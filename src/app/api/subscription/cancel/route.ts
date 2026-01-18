import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
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
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // Cancel subscription in Razorpay if it exists
    if (subscription.razorpaySubscriptionId) {
      try {
        await razorpay.subscriptions.cancel(
          subscription.razorpaySubscriptionId,
          false // cancel_at_cycle_end = false means immediate cancellation
        );
      } catch (error: any) {
        console.error('Error cancelling Razorpay subscription:', error);
        // Continue even if Razorpay cancellation fails
      }
    }

    // Cancel subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'CANCELLED',
        isAutoRenew: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        plan: updatedSubscription.plan,
        status: updatedSubscription.status,
        endDate: updatedSubscription.endDate
      }
    });

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
