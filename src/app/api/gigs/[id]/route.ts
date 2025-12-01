import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log('Fetching gig with ID:', id, 'Type:', typeof id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Gig ID is required' },
        { status: 400 }
      );
    }

    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        subcategory: {
          select: {
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true,
            reviewCount: true,
            totalEarnings: true,
            createdAt: true,
            responseTime: true,
            lastSeen: true,
            isOnline: true
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
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        orders: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.gig.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    // Calculate average rating
    const totalRating = (gig as any).reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    const averageRating = (gig as any).reviews.length > 0 ? totalRating / (gig as any).reviews.length : 0;

    return NextResponse.json({
      ...gig,
      averageRating,
      startingPrice: Number(gig.price)
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Gig fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const {
      title,
      description,
      price,
      deliveryTime,
      tags,
      images,
      isActive
    } = body;

    const gig = await prisma.gig.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price }),
        ...(deliveryTime && { deliveryTime }),
        ...(tags && { tags }),
        ...(images && { images }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      gig,
      message: 'Gig updated successfully' 
    });

  } catch (error) {
    console.error('Gig update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.gig.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Gig deleted successfully' 
    });

  } catch (error) {
    console.error('Gig delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}