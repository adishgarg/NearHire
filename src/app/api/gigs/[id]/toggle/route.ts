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

    // Verify that the gig belongs to the user
    const gig = await prisma.gig.findUnique({
      where: { id },
      select: { sellerId: true }
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
