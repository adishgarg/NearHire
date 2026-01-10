import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { OrderDetailClient } from '@/components/OrderDetailClient';
import { PageLayout } from '@/components/PageLayout';

const prisma = new PrismaClient();

export default async function OrderDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
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

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      gig: {
        select: {
          id: true,
          title: true,
          description: true,
          images: true,
          deliveryTime: true,
          features: true
        }
      },
      seller: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          rating: true,
          reviewCount: true,
          responseTime: true,
          level: true
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
          id: true,
          lastMessage: true,
          lastMessageAt: true
        }
      },
      review: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true
        }
      }
    }
  });

  if (!order) {
    redirect('/orders');
  }

  // Check if user has access to this order
  if (order.buyerId !== user.id && order.sellerId !== user.id) {
    redirect('/orders');
  }

  const isSeller = order.sellerId === user.id;

  const serializedOrder = {
    ...order,
    price: order.price.toString(),
    platformFee: order.platformFee.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    dueDate: order.dueDate.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString() || null,
    completedAt: order.completedAt?.toISOString() || null,
    conversation: order.conversation ? {
      ...order.conversation,
      lastMessageAt: order.conversation.lastMessageAt?.toISOString() || null
    } : null,
    review: order.review ? {
      ...order.review,
      createdAt: order.review.createdAt.toISOString()
    } : null
  };

  return (
    <PageLayout>
      <OrderDetailClient order={serializedOrder} isSeller={isSeller} />
    </PageLayout>
  );
}
