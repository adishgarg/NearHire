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

  // Check if user has seller role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, onboardingCompleted: true }
  });

  if (!user) {
    redirect('/auth/login');
  }

  // Redirect to onboarding if not completed
  if (!user.onboardingCompleted) {
    redirect('/onboarding');
  }

  // Check if user has seller role
  if (user.role !== 'SELLER' && user.role !== 'BOTH') {
    redirect('/dashboard?error=seller-role-required');
  }

  return <CreateGigPage />;
}