import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { 
  sendOrderConfirmationToBuyer, 
  sendNewOrderNotificationToSeller 
} from '@/lib/email';

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      gigId,
      requirements,
      amount,
      platformFee
    } = body;

    // Verify Razorpay signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
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

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + gig.deliveryTime);

    // Create order and related records in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          gigId: gig.id,
          buyerId: user.id,
          sellerId: gig.sellerId,
          price: amount - platformFee,
          platformFee: platformFee,
          requirements: requirements || '',
          dueDate: dueDate,
          status: 'PENDING'
        },
        include: {
          gig: {
            select: {
              id: true,
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
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          orderId: newOrder.id,
          userId: user.id,
          amount: amount - platformFee,
          platformFee: platformFee,
          type: 'PAYMENT',
          status: 'COMPLETED',
          paymentGateway: 'razorpay',
          paymentId: razorpay_payment_id,
          metadata: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
          }
        }
      });

      // Create a conversation for this order
      const conversation = await tx.conversation.create({
        data: {
          gigId: gig.id,
          orderId: newOrder.id,
          isActive: true
        }
      });

      // Add both buyer and seller as participants
      await tx.conversationParticipant.createMany({
        data: [
          {
            conversationId: conversation.id,
            userId: user.id
          },
          {
            conversationId: conversation.id,
            userId: gig.sellerId
          }
        ]
      });

      // Update seller's active orders count
      await tx.user.update({
        where: { id: gig.sellerId },
        data: {
          activeOrders: {
            increment: 1
          }
        }
      });

      // Update gig order count
      await tx.gig.update({
        where: { id: gig.id },
        data: {
          orderCount: {
            increment: 1
          }
        }
      });

      // Create notifications
      await tx.notification.create({
        data: {
          userId: gig.sellerId,
          title: 'New Order Received',
          message: `You have a new order for "${gig.title}"`,
          type: 'ORDER_UPDATE',
          data: {
            orderId: newOrder.id,
            gigId: gig.id,
            buyerId: user.id
          }
        }
      });

      return newOrder;
    });

    // Send email notifications (async, don't wait for them)
    Promise.all([
      sendOrderConfirmationToBuyer(
        order.buyer.email,
        order.buyer.name || 'Buyer',
        {
          id: order.id,
          gigTitle: order.gig.title,
          sellerName: order.seller.name || 'Seller',
          price: Number(order.price),
          platformFee: Number(order.platformFee),
          dueDate: order.dueDate.toISOString(),
          requirements: order.requirements || undefined
        }
      ),
      sendNewOrderNotificationToSeller(
        order.seller.email,
        order.seller.name || 'Seller',
        {
          id: order.id,
          gigTitle: order.gig.title,
          buyerName: order.buyer.name || 'Buyer',
          price: Number(order.price),
          dueDate: order.dueDate.toISOString(),
          requirements: order.requirements || undefined
        }
      )
    ]).catch(err => {
      console.error('Failed to send order notification emails:', err);
    });

    return NextResponse.json({
      success: true,
      order,
      message: 'Payment verified and order created successfully'
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
