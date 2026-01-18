import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        role: true,
        subscription: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user is a buyer, they need to subscribe first
    if (user.role === 'BUYER') {
      return NextResponse.json(
        { 
          canSell: false,
          requiresSubscription: true,
          message: 'Subscribe to a seller plan to start selling' 
        },
        { status: 403 }
      );
    }

    // If user is a seller, check if they have an active subscription
    if (user.role === 'SELLER' || user.role === 'BOTH') {
      const hasActiveSubscription = user.subscription?.status === 'ACTIVE';
      
      return NextResponse.json({
        canSell: hasActiveSubscription,
        requiresSubscription: !hasActiveSubscription,
        message: hasActiveSubscription 
          ? 'You can create gigs' 
          : 'Activate your subscription to create gigs',
      });
    }

    return NextResponse.json(
      { error: 'Invalid user role' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Check seller status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
