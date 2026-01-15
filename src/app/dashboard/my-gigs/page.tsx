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
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user is a seller
  if (user.role !== 'SELLER' && user.role !== 'BOTH') {
    redirect('/profile?error=seller-role-required');
  }

  // Fetch user's gigs with stats
  const gigs = await prisma.gig.findMany({
    where: { sellerId: user.id },
    include: {
      category: {
        select: {
          name: true,
          slug: true
        }
      },
      _count: {
        select: {
          orders: true,
          reviews: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Serialize the data
  const serializedGigs = gigs.map(gig => ({
    ...gig,
    price: Number(gig.price),
    createdAt: gig.createdAt.toISOString(),
    updatedAt: gig.updatedAt.toISOString(),
  }));

  return <MyGigsPage gigs={serializedGigs as any} />;
}
