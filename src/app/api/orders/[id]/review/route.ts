import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid rating (1-5) is required' },
        { status: 400 }
      );
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        review: true,
        gig: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only buyer can review and only if order is completed
    if (order.buyerId !== user.id) {
      return NextResponse.json(
        { error: 'Only the buyer can review this order' },
        { status: 403 }
      );
    }

    if (order.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Order must be completed before reviewing' },
        { status: 400 }
      );
    }

    if (order.review) {
      return NextResponse.json(
        { error: 'Order has already been reviewed' },
        { status: 400 }
      );
    }

    // Create review and update seller/gig ratings in a transaction
    const review = await prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          orderId: order.id,
          gigId: order.gigId,
          reviewerId: user.id,
          revieweeId: order.sellerId,
          rating,
          comment: comment || null
        }
      });

      // Update gig rating
      const gigReviews = await tx.review.findMany({
        where: { gigId: order.gigId }
      });

      const totalGigRating = gigReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgGigRating = totalGigRating / gigReviews.length;

      await tx.gig.update({
        where: { id: order.gigId },
        data: {
          rating: avgGigRating,
          reviewCount: gigReviews.length
        }
      });

      // Update seller rating
      const sellerReviews = await tx.review.findMany({
        where: { revieweeId: order.sellerId }
      });

      const totalSellerRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgSellerRating = totalSellerRating / sellerReviews.length;

      await tx.user.update({
        where: { id: order.sellerId },
        data: {
          rating: avgSellerRating,
          reviewCount: sellerReviews.length
        }
      });

      // Create notification for seller
      await tx.notification.create({
        data: {
          userId: order.sellerId,
          title: 'New Review Received',
          message: `You received a ${rating}-star review for "${order.gig.title}"`,
          type: 'REVIEW',
          data: {
            orderId: order.id,
            gigId: order.gigId,
            reviewId: newReview.id,
            rating
          }
        }
      });

      return newReview;
    });

    return NextResponse.json(review);

  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
