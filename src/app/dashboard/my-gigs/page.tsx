import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { MyGigsPage } from '@/components/dashboard/MyGigsPage';

const prisma = new PrismaClient();

export default async function MyGigs() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login?callbackUrl=/dashboard/my-gigs');
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

  // Fetch user's gigs
  const gigsData = await prisma.gig.findMany({
    where: { sellerId: user.id },
    include: {
      category: true,
      _count: {
        select: {
          orders: true,
          reviews: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Convert Decimal to number for client component
  const gigs = gigsData.map(gig => ({
    ...gig,
    price: Number(gig.price)
  }));

  return <MyGigsPage gigs={gigs} />;
}
