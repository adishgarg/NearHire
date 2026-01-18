import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Razorpay Webhook Handler for Subscription Events
 * 
 * This endpoint handles recurring payment events from Razorpay:
 * - subscription.charged: Recurring payment successful
 * - payment.captured: Payment captured successfully
 * - payment.failed: Payment failed
 * - subscription.cancelled: Subscription cancelled by user or Razorpay
 * - subscription.halted: Subscription halted due to payment failures
 * 
 * Configure this webhook URL in Razorpay Dashboard:
 * https://yourdomain.com/api/subscription/webhook
 * 
 * Webhook Secret: Set RAZORPAY_WEBHOOK_SECRET in .env
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const event = JSON.parse(body);
    const eventType = event.event;

    console.log(`[Webhook] Received event: ${eventType}`);

    // Handle different event types
    switch (eventType) {
      case 'subscription.charged':
        await handleSubscriptionCharged(event);
        break;

      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;

      case 'subscription.halted':
        await handleSubscriptionHalted(event);
        break;

      case 'subscription.activated':
        await handleSubscriptionActivated(event);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCharged(event: any) {
  const { payload } = event;
  const subscriptionData = payload.subscription?.entity;
  const paymentData = payload.payment?.entity;

  if (!subscriptionData || !paymentData) {
    console.error('[Webhook] Missing subscription or payment data');
    return;
  }

  const razorpaySubscriptionId = subscriptionData.id;
  const paymentId = paymentData.id;
  const amount = paymentData.amount / 100; // Convert from paise to rupees
  const status = paymentData.status;

  console.log(`[Webhook] Subscription charged: ${razorpaySubscriptionId}, Payment: ${paymentId}, Status: ${status}`);

  try {
    // Find subscription in DB
    const subscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId },
      include: { user: true }
    });

    if (!subscription) {
      console.error(`[Webhook] Subscription not found: ${razorpaySubscriptionId}`);
      return;
    }

    // Update subscription and create transaction
    await prisma.$transaction(async (tx) => {
      // Calculate next billing date based on billing cycle
      const currentEndDate = new Date(subscription.endDate);
      const billingCycle = subscriptionData.plan_id?.includes('year') || 
                          (subscriptionData.charge_at && subscriptionData.total_count > 1) 
                          ? 'yearly' : 'monthly';
      const days = billingCycle === 'yearly' ? 365 : 30;
      const nextBillingDate = new Date(currentEndDate.getTime() + days * 24 * 60 * 60 * 1000);

      // Update subscription
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          endDate: nextBillingDate,
          nextBillingAt: nextBillingDate,
          paymentId,
          updatedAt: new Date()
        }
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          orderId: paymentId,
          userId: subscription.userId,
          amount: amount,
          platformFee: 0,
          type: 'PAYMENT',
          status: status === 'captured' ? 'COMPLETED' : 'PENDING',
          paymentGateway: 'razorpay',
          paymentId: paymentId,
          description: `Subscription renewal - ${subscription.plan}`,
          metadata: {
            subscriptionId: razorpaySubscriptionId,
            eventType: 'subscription.charged',
            razorpayPayload: paymentData
          }
        }
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: subscription.userId,
          title: 'Subscription Renewed',
          message: `Your subscription has been renewed successfully. Next billing date: ${nextBillingDate.toLocaleDateString()}`,
          type: 'SYSTEM'
        }
      });
    });

    console.log(`[Webhook] Subscription updated successfully: ${razorpaySubscriptionId}`);
  } catch (error) {
    console.error('[Webhook] Error handling subscription.charged:', error);
  }
}

async function handlePaymentCaptured(event: any) {
  const { payload } = event;
  const paymentData = payload.payment?.entity;

  if (!paymentData) {
    console.error('[Webhook] Missing payment data');
    return;
  }

  const paymentId = paymentData.id;
  const amount = paymentData.amount / 100;
  const notes = paymentData.notes || {};

  console.log(`[Webhook] Payment captured: ${paymentId}, Amount: ${amount}`);

  // If this is a subscription payment, it will be handled by subscription.charged
  if (notes.type === 'subscription') {
    console.log('[Webhook] Subscription payment, handled by subscription.charged event');
    return;
  }

  // Handle one-off payments if needed
  try {
    // Update transaction status if exists
    const transaction = await prisma.transaction.findFirst({
      where: { paymentId }
    });

    if (transaction) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' }
      });
      console.log(`[Webhook] Transaction updated: ${transaction.id}`);
    }
  } catch (error) {
    console.error('[Webhook] Error handling payment.captured:', error);
  }
}

async function handlePaymentFailed(event: any) {
  const { payload } = event;
  const paymentData = payload.payment?.entity;

  if (!paymentData) {
    console.error('[Webhook] Missing payment data');
    return;
  }

  const paymentId = paymentData.id;
  const notes = paymentData.notes || {};

  console.log(`[Webhook] Payment failed: ${paymentId}`);

  try {
    // If this is a subscription payment failure
    if (notes.subscriptionId || notes.type === 'subscription') {
      const subscriptionId = notes.subscriptionId;
      
      const subscription = await prisma.subscription.findFirst({
        where: { razorpaySubscriptionId: subscriptionId }
      });

      if (subscription) {
        // Create notification
        await prisma.notification.create({
          data: {
            userId: subscription.userId,
            title: 'Payment Failed',
            message: 'Your subscription payment failed. Please update your payment method to continue your subscription.',
            type: 'SYSTEM'
          }
        });
      }
    }

    // Update transaction status
    const transaction = await prisma.transaction.findFirst({
      where: { paymentId }
    });

    if (transaction) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' }
      });
    }

    console.log(`[Webhook] Payment failure handled: ${paymentId}`);
  } catch (error) {
    console.error('[Webhook] Error handling payment.failed:', error);
  }
}

async function handleSubscriptionCancelled(event: any) {
  const { payload } = event;
  const subscriptionData = payload.subscription?.entity;

  if (!subscriptionData) {
    console.error('[Webhook] Missing subscription data');
    return;
  }

  const razorpaySubscriptionId = subscriptionData.id;

  console.log(`[Webhook] Subscription cancelled: ${razorpaySubscriptionId}`);

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          isAutoRenew: false,
          updatedAt: new Date()
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: subscription.userId,
          title: 'Subscription Cancelled',
          message: 'Your subscription has been cancelled. You can reactivate it anytime.',
          type: 'SYSTEM'
        }
      });

      console.log(`[Webhook] Subscription cancelled in DB: ${razorpaySubscriptionId}`);
    }
  } catch (error) {
    console.error('[Webhook] Error handling subscription.cancelled:', error);
  }
}

async function handleSubscriptionHalted(event: any) {
  const { payload } = event;
  const subscriptionData = payload.subscription?.entity;

  if (!subscriptionData) {
    console.error('[Webhook] Missing subscription data');
    return;
  }

  const razorpaySubscriptionId = subscriptionData.id;

  console.log(`[Webhook] Subscription halted: ${razorpaySubscriptionId}`);

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'INACTIVE',
          updatedAt: new Date()
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: subscription.userId,
          title: 'Subscription Halted',
          message: 'Your subscription has been halted due to payment failures. Please update your payment method.',
          type: 'SYSTEM'
        }
      });

      console.log(`[Webhook] Subscription halted in DB: ${razorpaySubscriptionId}`);
    }
  } catch (error) {
    console.error('[Webhook] Error handling subscription.halted:', error);
  }
}

async function handleSubscriptionActivated(event: any) {
  const { payload } = event;
  const subscriptionData = payload.subscription?.entity;

  if (!subscriptionData) {
    console.error('[Webhook] Missing subscription data');
    return;
  }

  const razorpaySubscriptionId = subscriptionData.id;

  console.log(`[Webhook] Subscription activated: ${razorpaySubscriptionId}`);

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });

      console.log(`[Webhook] Subscription activated in DB: ${razorpaySubscriptionId}`);
    }
  } catch (error) {
    console.error('[Webhook] Error handling subscription.activated:', error);
  }
}
