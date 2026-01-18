import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';
import { TransactionStatus, TransactionType } from '@prisma/client';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting subscription check cron job...');

    // Get all subscriptions that should be checked
    const subscriptions = await prisma.subscription.findMany({
      where: {
        OR: [
          { status: 'ACTIVE' },
          { status: 'CREATED' },
        ],
        NOT: {
          razorpaySubscriptionId: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    console.log(`Found ${subscriptions.length} subscriptions to check`);

    const results = {
      checked: 0,
      updated: 0,
      renewed: 0,
      cancelled: 0,
      errors: [] as string[],
    };

    // Check each subscription
    for (const subscription of subscriptions) {
      try {
        results.checked++;

        // Fetch latest subscription data from Razorpay
        const razorpaySubscription = await razorpay.subscriptions.fetch(
          subscription.razorpaySubscriptionId!
        );

        console.log(`Subscription ${subscription.id}: Razorpay status = ${razorpaySubscription.status}`);

        // Check for new payments
        if (razorpaySubscription.status === 'active' || razorpaySubscription.status === 'completed') {
          // Fetch all payments from Razorpay
          const allPayments = await razorpay.payments.all({ count: 100 });
          
          // Filter payments for this subscription
          const subscriptionPayments = allPayments.items.filter(
            (payment: any) => 
              payment.notes?.subscription_id === subscription.razorpaySubscriptionId ||
              payment.subscription_id === subscription.razorpaySubscriptionId
          );

          if (subscriptionPayments.length > 0) {
            // Get the most recent successful payment
            const latestPayment = subscriptionPayments
              .filter((p: any) => p.status === 'captured')
              .sort((a: any, b: any) => b.created_at - a.created_at)[0];

            if (latestPayment) {
              // Check if this payment is already recorded
              const existingTransaction = await prisma.transaction.findFirst({
                where: {
                  orderId: latestPayment.id,
                },
              });

              if (!existingTransaction) {
                console.log(`New payment found for subscription ${subscription.id}: ${latestPayment.id}`);

                // Record the transaction
                await prisma.transaction.create({
                  data: {
                    userId: subscription.userId,
                    orderId: latestPayment.id,
                    paymentId: latestPayment.id,
                    amount: Number(latestPayment.amount) / 100, // Convert paise to rupees
                    currency: latestPayment.currency,
                    status: TransactionStatus.SUCCESS,
                    paymentMethod: latestPayment.method || 'subscription',
                    type: TransactionType.SUBSCRIPTION,
                  },
                });

                // Extend subscription
                const currentEndDate = subscription.endDate || new Date();
                const daysToAdd = subscription.billingCycle === 'YEARLY' ? 365 : 30;
                const newEndDate = new Date(currentEndDate);
                newEndDate.setDate(newEndDate.getDate() + daysToAdd);

                await prisma.subscription.update({
                  where: { id: subscription.id },
                  data: {
                    status: 'ACTIVE',
                    endDate: newEndDate,
                    nextBillingAt: razorpaySubscription.charge_at
                      ? new Date(razorpaySubscription.charge_at * 1000)
                      : newEndDate,
                  },
                });

                results.renewed++;
                console.log(`Subscription ${subscription.id} renewed until ${newEndDate}`);
              }
            }
          }
        }

        // Update subscription status based on Razorpay status
        let newStatus = subscription.status;
        let shouldUpdate = false;

        switch (razorpaySubscription.status) {
          case 'created':
            if (subscription.status !== 'CREATED') {
              newStatus = 'CREATED';
              shouldUpdate = true;
            }
            break;

          case 'active':
            if (subscription.status !== 'ACTIVE') {
              newStatus = 'ACTIVE';
              shouldUpdate = true;
            }
            break;

          case 'cancelled':
            if (subscription.status !== 'CANCELLED') {
              newStatus = 'CANCELLED';
              shouldUpdate = true;
              results.cancelled++;
            }
            break;

          case 'halted':
            if (subscription.status !== 'INACTIVE') {
              newStatus = 'INACTIVE';
              shouldUpdate = true;
            }
            break;

          case 'expired':
            if (subscription.status !== 'EXPIRED') {
              newStatus = 'EXPIRED';
              shouldUpdate = true;
            }
            break;
        }

        if (shouldUpdate) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: newStatus,
              nextBillingAt: razorpaySubscription.charge_at
                ? new Date(razorpaySubscription.charge_at * 1000)
                : undefined,
            },
          });
          results.updated++;
          console.log(`Subscription ${subscription.id} status updated to ${newStatus}`);
        }

      } catch (error: any) {
        console.error(`Error checking subscription ${subscription.id}:`, error);
        results.errors.push(`Subscription ${subscription.id}: ${error.message}`);
      }
    }

    console.log('Cron job completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Subscription check completed',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
