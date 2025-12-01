import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

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

    // Get user from database
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
    const { gigId, requirements, packageType } = body;

    // Validation
    if (!gigId) {
      return NextResponse.json(
        { error: 'Gig ID is required' },
        { status: 400 }
      );
    }

    // Get gig details
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: {
        seller: true
      }
    });

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      );
    }

    if (!gig.isActive) {
      return NextResponse.json(
        { error: 'Gig is not available' },
        { status: 400 }
      );
    }

    // Can't buy your own gig
    if (gig.sellerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot order your own service' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const price = Number(gig.price);
    const platformFee = price * 0.05; // 5% platform fee
    const totalAmount = price + platformFee;

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + gig.deliveryTime);

    // Create order
    const order = await prisma.order.create({
      data: {
        gigId: gig.id,
        buyerId: user.id,
        sellerId: gig.sellerId,
        price: price,
        platformFee: platformFee,
        requirements: requirements || '',
        dueDate: dueDate,
        status: 'PENDING'
      },
      include: {
        gig: {
          select: {
            title: true,
            images: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Order created successfully' 
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'buying' or 'selling'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;

    let where: any = {};
    
    if (type === 'buying') {
      where.buyerId = user.id;
    } else if (type === 'selling') {
      where.sellerId = user.id;
    } else {
      // Get both buying and selling orders
      where.OR = [
        { buyerId: user.id },
        { sellerId: user.id }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            images: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const totalCount = await prisma.order.count({ where });

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}