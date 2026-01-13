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
    const { paymentId, orderId, signature, amount } = body;

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return NextResponse.json(
        { error: 'Payment signature verification failed' },
        { status: 400 }
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

    // Calculate end date (30 days from now)
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: 'SELLER',
        status: 'ACTIVE',
        startDate,
        endDate,
        paymentId,
        orderId,
        isAutoRenew: true,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        plan: 'SELLER',
        status: 'ACTIVE',
        startDate,
        endDate,
        paymentId,
        orderId,
        price: amount ? amount / 100 : 499,
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
