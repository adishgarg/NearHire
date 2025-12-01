import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all gigs with their seller info
    const allGigs = await prisma.gig.findMany({
      select: {
        id: true,
        title: true,
        sellerId: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Check for orphaned gigs
    const orphanedGigs = allGigs.filter(gig => !gig.seller);
    const validGigs = allGigs.filter(gig => gig.seller);

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const result = {
      totalGigs: allGigs.length,
      validGigs: validGigs.length,
      orphanedGigs: orphanedGigs.length,
      totalUsers: allUsers.length,
      orphanedGigDetails: orphanedGigs.map(gig => ({
        id: gig.id,
        title: gig.title,
        sellerId: gig.sellerId
      })),
      users: allUsers
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'cleanup') {
      // Delete orphaned gigs (gigs without valid sellers)
      const orphanedGigs = await prisma.gig.findMany({
        where: {
          seller: null
        },
        select: { id: true, title: true, sellerId: true }
      });

      if (orphanedGigs.length > 0) {
        await prisma.gig.deleteMany({
          where: {
            id: { in: orphanedGigs.map(g => g.id) }
          }
        });

        return NextResponse.json({
          success: true,
          message: `Deleted ${orphanedGigs.length} orphaned gigs`,
          deletedGigs: orphanedGigs
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'No orphaned gigs found to delete'
        });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}