import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

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

    const { id } = await context.params;
    const body = await request.json();
    
    // Verify ownership
    const existingGig = await prisma.gig.findUnique({
      where: { id },
      select: { sellerId: true, categoryId: true }
    });

    if (!existingGig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    if (existingGig.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const {
      title,
      description,
      category,
      price,
      deliveryTime,
      tags,
      images,
      isActive,
      city,
      address,
      latitude,
      longitude,
    } = body;

    // Validation
    if (title && title.length > 80) {
      return NextResponse.json(
        { error: 'Title must be 80 characters or less' },
        { status: 400 }
      );
    }

    if (description && description.length > 1200) {
      return NextResponse.json(
        { error: 'Description must be 1200 characters or less' },
        { status: 400 }
      );
    }

    if (price && price < 5) {
      return NextResponse.json(
        { error: 'Minimum price is $5' },
        { status: 400 }
      );
    }

    // Handle category change if provided
    let categoryId = existingGig.categoryId;
    if (category) {
      let categoryRecord = await prisma.category.findFirst({
        where: { slug: category }
      });

      if (!categoryRecord) {
        // Create a basic category if it doesn't exist
        categoryRecord = await prisma.category.create({
          data: {
            name: category.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            slug: category,
            icon: '📂',
            image: '/placeholder-category.jpg',
          }
        });
      }
      categoryId = categoryRecord.id;
    }

    const gig = await prisma.gig.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { categoryId }),
        ...(price && { price }),
        ...(deliveryTime && { deliveryTime }),
        ...(tags && { tags }),
        ...(images && { images }),
        ...(isActive !== undefined && { isActive }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
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
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await context.params;

    // Verify ownership
    const existingGig = await prisma.gig.findUnique({
      where: { id },
      select: { sellerId: true }
    });

    if (!existingGig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    if (existingGig.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

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
  } finally {
    await prisma.$disconnect();
  }
}