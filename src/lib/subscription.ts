import { prisma } from './prisma';

export async function isSellerSubscriptionActive(userId: string): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return false;
    }

    // Check if subscription is active and not expired
    const isActive = 
      subscription.status === 'ACTIVE' && 
      new Date(subscription.endDate) > new Date();

    return isActive;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

export async function getSellerSubscriptionStatus(userId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return {
        isActive: false,
        daysRemaining: 0,
        subscription: null
      };
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isActive = subscription.status === 'ACTIVE' && daysRemaining > 0;

    return {
      isActive,
      daysRemaining: Math.max(0, daysRemaining),
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        endDate: subscription.endDate,
        startDate: subscription.startDate,
        isAutoRenew: subscription.isAutoRenew
      }
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      isActive: false,
      daysRemaining: 0,
      subscription: null
    };
  }
}
