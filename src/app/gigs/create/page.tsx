import { CreateGigPage } from '@/components/gigs/creatGigPage';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function CreateGig() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login?callbackUrl=/gigs/create');
  }

  // Check if user has seller role and subscription
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      role: true, 
      onboardingCompleted: true,
      subscription: {
        select: {
          status: true,
          plan: true,
        }
      }
    }
  });

  if (!user) {
    redirect('/auth/login');
  }

  // Redirect to onboarding if not completed
  if (!user.onboardingCompleted) {
    redirect('/onboarding');
  }

  // Check if user is a buyer trying to sell - redirect to paywall/subscription
  if (user.role === 'BUYER') {
    redirect('/seller-upgrade');
  }

  // Check if user has seller role but no active subscription
  if (user.role === 'SELLER' || user.role === 'BOTH') {
    if (!user.subscription || user.subscription.status !== 'ACTIVE') {
      redirect('/subscription?required=true');
    }
  }

  return <CreateGigPage />;
}