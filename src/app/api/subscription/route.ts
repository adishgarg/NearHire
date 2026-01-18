import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get user's subscription status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user is not a seller, return inactive subscription
    if (user.role !== 'SELLER' && user.role !== 'BOTH') {
      return NextResponse.json({
        isActive: false,
        subscription: null,
        message: 'User is not a seller'
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    // Check if subscription is expired
    const isActive = subscription && new Date(subscription.endDate) > new Date() && subscription.status === 'ACTIVE';

    return NextResponse.json({
      isActive,
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        endDate: subscription.endDate,
        startDate: subscription.startDate,
        isAutoRenew: subscription.isAutoRenew
      } : null
    });

  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// Create a subscription payment order
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const plan = body.plan || 'TIER1';
    const billingCycle = body.billingCycle === 'yearly' ? 'yearly' : 'monthly';

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, phone: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine pricing by plan and billingCycle
    const pricing: Record<string, { monthly: number; yearly: number }> = {
      TIER1: { monthly: 99, yearly: 999 },
      TIER2: { monthly: 199, yearly: 1999 },
      TIER3: { monthly: 299, yearly: 2999 }
    };

    const planPricing = pricing[plan] || pricing.TIER1;
    const price = billingCycle === 'yearly' ? planPricing.yearly : planPricing.monthly;
    const amount = price * 100; // Convert to paise for Razorpay

    // Create Razorpay plan/customer/subscription
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay credentials');
      return NextResponse.json(
        { error: 'Payment service not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    try {
      console.log('🔧 Creating Razorpay plan with payload:', JSON.stringify({
        period: billingCycle === 'yearly' ? 'yearly' : 'monthly',
        interval: 1,
        item: {
          name: `${plan} - ${billingCycle}`,
          amount: amount,
          currency: 'INR'
        }
      }, null, 2));

      // Create a Plan in Razorpay (if you prefer to reuse plans you can store plan ids)
      const planPayload = {
        period: billingCycle === 'yearly' ? 'yearly' : 'monthly',
        interval: 1,
        item: {
          name: `${plan} - ${billingCycle}`,
          amount: amount,
          currency: 'INR'
        }
      };

      const razorpayPlan = await razorpay.plans.create(planPayload);
      console.log('✅ Razorpay plan created:', razorpayPlan.id);

      // Create or fetch customer
      const customerPayload = {
        name: user.name || 'Customer',
        email: user.email,
        contact: user.phone || undefined,
        fail_existing: 0
      };

      console.log('🔧 Creating Razorpay customer...');
      const razorpayCustomer = await razorpay.customers.create(customerPayload);
      console.log('✅ Razorpay customer created:', razorpayCustomer.id);

      // Create subscription
      const subscriptionPayload: any = {
        plan_id: razorpayPlan.id,
        customer_notify: 1,
        customer_id: razorpayCustomer.id,
        total_count: 9999,
        notes: {
          userId: user.id,
          plan,
          billingCycle,
          type: 'subscription'
        }
      };

      console.log('🔧 Creating Razorpay subscription...');
      const razorpaySubscription = await razorpay.subscriptions.create(subscriptionPayload);
      console.log('✅ Razorpay subscription created:', razorpaySubscription.id);

      // Save subscription record in DB (initial inactive until payment verification webhook)
      const startDate = new Date();
      const days = billingCycle === 'yearly' ? 365 : 30;
      const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

      const created = await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          plan,
          status: 'PENDING',
          billingCycle: billingCycle.toUpperCase(),
          startDate,
          endDate,
          price: price,
          razorpayCustomerId: razorpayCustomer.id,
          razorpaySubscriptionId: razorpaySubscription.id,
          isAutoRenew: true,
          updatedAt: new Date()
        },
        create: {
          userId: user.id,
          plan,
          status: 'PENDING',
          billingCycle: billingCycle.toUpperCase(),
          startDate,
          endDate,
          price: price,
          razorpayCustomerId: razorpayCustomer.id,
          razorpaySubscriptionId: razorpaySubscription.id,
          isAutoRenew: true
        }
      });

      return NextResponse.json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID,
        subscriptionId: razorpaySubscription.id,
        plan,
        billingCycle,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone
      });
    } catch (err: any) {
      console.error('❌ Razorpay subscription creation error:', {
        statusCode: err.statusCode,
        error: err.error,
        message: err.message,
        description: err.error?.description,
        stack: err.stack
      });
      
      // Return more specific error message
      const errorMessage = err.error?.description || err.message || 'Failed to create subscription';
      return NextResponse.json(
        { 
          error: errorMessage,
          details: err.error || err.message
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription order' },
      { status: 500 }
    );
  }
}
