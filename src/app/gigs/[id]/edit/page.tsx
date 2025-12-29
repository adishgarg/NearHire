import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { EditGigPage } from '@/components/gigs/EditGigPage';

const prisma = new PrismaClient();

export default async function EditGig({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login?callbackUrl=/gigs/' + id + '/edit');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      id: true,
      role: true,
      onboardingCompleted: true 
    }
  });

  if (!user) {
    redirect('/auth/login');
  }

  if (!user.onboardingCompleted) {
    redirect('/onboarding');
  }

  // Check if user has seller role
  if (user.role !== 'SELLER' && user.role !== 'BOTH') {
    redirect('/dashboard?error=seller-role-required');
  }

  // Fetch the gig with full details
  const gig = await prisma.gig.findUnique({
    where: { id },
    include: {
      category: true
    }
  });

  if (!gig) {
    redirect('/dashboard/my-gigs?error=gig-not-found');
  }

  // Verify ownership
  if (gig.sellerId !== user.id) {
    redirect('/dashboard/my-gigs?error=unauthorized');
  }

  // Convert Decimal to number for client component
  const gigData = {
    ...gig,
    price: Number(gig.price)
  };

  return <EditGigPage gig={gigData} />;
}
