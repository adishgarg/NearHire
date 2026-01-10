import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { OrdersPageClient } from '@/components/OrdersPageClient';
import { PageLayout } from '@/components/PageLayout';

const prisma = new PrismaClient();

export default async function Orders() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch buyer orders (orders I placed)
  const buyerOrders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: {
      gig: {
        select: {
          id: true,
          title: true,
          images: true,
          deliveryTime: true
        }
      },
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          rating: true
        }
      },
      conversation: {
        select: {
          id: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch seller orders (orders I received)
  const sellerOrders = await prisma.order.findMany({
    where: { sellerId: user.id },
    include: {
      gig: {
        select: {
          id: true,
          title: true,
          images: true,
          deliveryTime: true
        }
      },
      buyer: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true
        }
      },
      conversation: {
        select: {
          id: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const serializedBuyerOrders = buyerOrders.map(order => ({
    ...order,
    price: order.price.toString(),
    platformFee: order.platformFee.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    dueDate: order.dueDate.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString() || null,
    completedAt: order.completedAt?.toISOString() || null,
  }));

  const serializedSellerOrders = sellerOrders.map(order => ({
    ...order,
    price: order.price.toString(),
    platformFee: order.platformFee.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    dueDate: order.dueDate.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString() || null,
    completedAt: order.completedAt?.toISOString() || null,
  }));

  return (
    <PageLayout>
      <OrdersPageClient 
        buyerOrders={serializedBuyerOrders}
        sellerOrders={serializedSellerOrders}
      />
    </PageLayout>
  );
}