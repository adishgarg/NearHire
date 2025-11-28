import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

const prisma = new PrismaClient();

export default async function OnboardingPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Check if user exists and get their onboarding status
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/login');
  }

  // If onboarding is already completed, redirect to dashboard
  if ((user as any).onboardingCompleted) {
    redirect('/dashboard');
  }

  return <OnboardingFlow />;
}