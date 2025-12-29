import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    // Verify that the gig belongs to the user
    const originalGig = await prisma.gig.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!originalGig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    if (originalGig.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Generate unique slug for the duplicated gig
    const baseSlug = originalGig.slug + '-copy';
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.gig.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create duplicate gig
    const duplicateGig = await prisma.gig.create({
      data: {
        title: originalGig.title + ' (Copy)',
        description: originalGig.description,
        slug,
        categoryId: originalGig.categoryId,
        subcategoryId: originalGig.subcategoryId,
        sellerId: user.id,
        price: originalGig.price,
        deliveryTime: originalGig.deliveryTime,
        tags: originalGig.tags,
        features: originalGig.features,
        images: originalGig.images,
        isActive: false, // Start as inactive
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({ 
      success: true,
      gig: {
        ...duplicateGig,
        price: Number(duplicateGig.price)
      }
    });

  } catch (error) {
    console.error('Error duplicating gig:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
