import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentId, orderId, signature, amount, plan, billingCycle, subscriptionId } = body;

    // subscriptionId and paymentId required for subscription verification
    if (!paymentId || !subscriptionId || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify signature for subscription checkout: hmac(payment_id|subscription_id)
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${paymentId}|${subscriptionId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate end date based on billing cycle
    const startDate = new Date();
    const days = billingCycle === 'yearly' ? 365 : 30;
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    // Create or update subscription
    const planKey = plan || 'TIER1';
    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: planKey,
        status: 'ACTIVE',
        billingCycle: billingCycle ? billingCycle.toUpperCase() : 'MONTHLY',
        startDate,
        endDate,
        paymentId,
        orderId,
        razorpaySubscriptionId: subscriptionId,
        price: amount ? amount / 100 : undefined,
        isAutoRenew: true,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        plan: planKey,
        status: 'ACTIVE',
        billingCycle: billingCycle ? billingCycle.toUpperCase() : 'MONTHLY',
        startDate,
        endDate,
        paymentId,
        orderId,
        razorpaySubscriptionId: subscriptionId,
        price: amount ? amount / 100 : 0,
        isAutoRenew: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        endDate: subscription.endDate,
        isAutoRenew: subscription.isAutoRenew
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
