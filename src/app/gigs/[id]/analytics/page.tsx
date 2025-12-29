import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { GigAnalyticsPage } from '@/components/dashboard/GigAnalyticsPage';

const prisma = new PrismaClient();

export default async function GigAnalytics({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login?callbackUrl=/gigs/' + id + '/analytics');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch the gig with analytics data
  const gig = await prisma.gig.findUnique({
    where: { id },
    include: {
      category: true,
      orders: {
        select: {
          id: true,
          status: true,
          price: true,
          createdAt: true,
          completedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      reviews: {
        include: {
          reviewer: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!gig) {
    redirect('/dashboard/my-gigs?error=gig-not-found');
  }

  // Verify ownership
  if (gig.sellerId !== user.id) {
    redirect('/dashboard/my-gigs?error=unauthorized');
  }

  // Calculate analytics
  const totalRevenue = gig.orders.reduce((sum, order) => sum + Number(order.price), 0);
  const completedOrders = gig.orders.filter(o => o.status === 'COMPLETED').length;
  const avgRating = gig.reviews.length > 0 
    ? gig.reviews.reduce((sum, r) => sum + r.rating, 0) / gig.reviews.length 
    : 0;

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentOrders = gig.orders.filter(o => o.createdAt >= thirtyDaysAgo).length;

  const analytics = {
    views: gig.views,
    totalOrders: gig.orderCount,
    completedOrders,
    totalRevenue,
    avgRating,
    reviewCount: gig.reviewCount,
    recentOrders,
    conversionRate: gig.views > 0 ? ((gig.orderCount / gig.views) * 100).toFixed(1) : '0',
  };

  const gigData = {
    ...gig,
    price: Number(gig.price),
    orders: gig.orders.map(o => ({ ...o, price: Number(o.price) })),
    reviews: gig.reviews.map(r => ({ ...r, comment: r.comment || '' }))
  };

  return <GigAnalyticsPage gig={gigData} analytics={analytics} />;
}
