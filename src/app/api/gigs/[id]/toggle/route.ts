import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
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

    const { isActive } = await request.json();

    // Verify that the gig belongs to the user and get full gig data
    const gig = await prisma.gig.findUnique({
      where: { id },
    });

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    if (gig.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If activating a gig, validate all required fields are present
    if (isActive === true) {
      const missingFields = [];
      
      if (!gig.title || gig.title.trim() === '') missingFields.push('title');
      if (!gig.description || gig.description.trim() === '') missingFields.push('description');
      if (!gig.categoryId) missingFields.push('category');
      if (!gig.price || gig.price < 5) missingFields.push('price');
      if (!gig.deliveryTime || gig.deliveryTime < 1) missingFields.push('delivery time');
      if (!gig.images || gig.images.length === 0) missingFields.push('at least one image');
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { 
            error: 'Failed to activate gig',
            message: 'Cannot publish gig with incomplete details. Please complete all required fields.',
            missingFields: missingFields,
            details: 'Missing: ' + missingFields.join(', ')
          },
          { status: 400 }
        );
      }
    }

    // Update gig status
    const updatedGig = await prisma.gig.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json({ 
      success: true,
      gig: updatedGig 
    });

  } catch (error) {
    console.error('Error toggling gig status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
