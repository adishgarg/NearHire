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

    // Single subscription plan - no plan parameter needed
    const plan = 'SELLER';

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

    // Single subscription plan pricing - ₹499/month
    const price = 499;
    const amount = price * 100; // Convert to paise for Razorpay

    // Create Razorpay order
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

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `sub-${user.id.substring(0, 20)}-${Date.now().toString().slice(-8)}`,
        notes: {
          userId: user.id,
          plan,
          type: 'subscription'
        }
      });
    } catch (razorpayError) {
      console.error('Razorpay order creation error:', razorpayError);
      return NextResponse.json(
        { error: 'Failed to create payment order. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      plan,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription order' },
      { status: 500 }
    );
  }
}
