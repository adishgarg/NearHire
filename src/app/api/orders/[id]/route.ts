import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            images: true,
            deliveryTime: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
            responseTime: true
          }
        },
        conversation: {
          select: {
            id: true,
            lastMessage: true,
            lastMessageAt: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this order
    if (order.buyerId !== user.id && order.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        seller: true,
        buyer: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user has access to update this order
    if (order.buyerId !== user.id && order.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, deliverables, progress } = body;

    const updateData: any = {};

    // Only seller can update certain fields
    if (user.id === order.sellerId) {
      if (status) updateData.status = status;
      if (deliverables) updateData.deliverables = deliverables;
      if (progress !== undefined) updateData.progress = progress;
      
      if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      }
    }

    // Only buyer can mark as completed
    if (user.id === order.buyerId && status === 'COMPLETED') {
      updateData.status = 'COMPLETED';
      updateData.completedAt = new Date();
      
      // Update seller's active orders count
      await prisma.user.update({
        where: { id: order.sellerId },
        data: {
          activeOrders: {
            decrement: 1
          }
        }
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
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
      }
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
