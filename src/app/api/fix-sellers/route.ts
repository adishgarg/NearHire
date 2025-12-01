import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find all gigs and check for missing seller relationships
    const allGigs = await prisma.gig.findMany({
      include: {
        seller: true
      }
    });

    const gigsWithMissingSellers = allGigs.filter(gig => !gig.seller);

    // Fix orphaned gigs by assigning them to the current user
    const fixedGigs = [];
    
    for (const gig of gigsWithMissingSellers) {
      const updatedGig = await prisma.gig.update({
        where: { id: gig.id },
        data: { sellerId: currentUser.id },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      fixedGigs.push(updatedGig);
    }

    // Alternatively, create a default seller if none exists
    if (gigsWithMissingSellers.length > 0 && !currentUser) {
      // Create a default seller account
      const defaultSeller = await prisma.user.create({
        data: {
          email: 'default.seller@nearhire.com',
          name: 'Default Seller'
        }
      });

      // Update orphaned gigs to use default seller
      await prisma.gig.updateMany({
        where: {
          id: { in: gigsWithMissingSellers.map(g => g.id) }
        },
        data: {
          sellerId: defaultSeller.id
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Seller relationships fixed',
      fixedGigs: fixedGigs.length,
      totalProblematicGigs: gigsWithMissingSellers.length
    });

  } catch (error) {
    console.error('Fix sellers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for gigs without sellers
    const allGigs = await prisma.gig.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const gigsWithoutSellers = allGigs.filter(gig => !gig.seller);
    const gigsWithSellers = allGigs.filter(gig => gig.seller);

    return NextResponse.json({
      totalGigs: allGigs.length,
      gigsWithSellers: gigsWithSellers.length,
      gigsWithoutSellers: gigsWithoutSellers.length,
      problematicGigs: gigsWithoutSellers.map(gig => ({
        id: gig.id,
        title: gig.title,
        sellerId: gig.sellerId
      }))
    });

  } catch (error) {
    console.error('Check sellers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}