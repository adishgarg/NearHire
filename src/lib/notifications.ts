import { prisma } from '@/lib/prisma';
import { publishToAbly } from '@/lib/ably';

type NotificationType = 'ORDER_UPDATE' | 'MESSAGE' | 'REVIEW' | 'PAYMENT' | 'SYSTEM';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
}

/**
 * Create a notification and broadcast it via Ably
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
  data,
}: CreateNotificationParams) {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: data || null,
      },
    });

    // Broadcast to user's channel via Ably
    await publishToAbly(`user:${userId}`, 'notification:new', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      data: notification.data,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create order-related notifications
 */
export async function notifyOrderUpdate(
  userId: string,
  orderId: string,
  status: string,
  gigTitle: string
) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    PENDING: {
      title: 'New Order Received',
      message: `You have a new order for "${gigTitle}"`,
    },
    IN_PROGRESS: {
      title: 'Order Started',
      message: `Work has started on your order "${gigTitle}"`,
    },
    DELIVERED: {
      title: 'Order Delivered',
      message: `Your order "${gigTitle}" has been delivered`,
    },
    COMPLETED: {
      title: 'Order Completed',
      message: `Order "${gigTitle}" is complete`,
    },
    CANCELLED: {
      title: 'Order Cancelled',
      message: `Order "${gigTitle}" has been cancelled`,
    },
  };

  const notification = statusMessages[status];
  if (!notification) return;

  return createNotification({
    userId,
    title: notification.title,
    message: notification.message,
    type: 'ORDER_UPDATE',
    data: { orderId, status, gigTitle },
  });
}

/**
 * Create message notification
 */
export async function notifyNewMessage(
  userId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
) {
  return createNotification({
    userId,
    title: `New message from ${senderName}`,
    message: messagePreview.substring(0, 100),
    type: 'MESSAGE',
    data: { conversationId, senderName },
  });
}

/**
 * Create review notification
 */
export async function notifyNewReview(
  userId: string,
  reviewerName: string,
  rating: number,
  gigTitle: string,
  reviewId: string
) {
  return createNotification({
    userId,
    title: 'New Review Received',
    message: `${reviewerName} left a ${rating}-star review on "${gigTitle}"`,
    type: 'REVIEW',
    data: { reviewId, reviewerName, rating, gigTitle },
  });
}

/**
 * Create payment notification
 */
export async function notifyPayment(
  userId: string,
  amount: number,
  type: 'received' | 'sent',
  orderId: string
) {
  const title = type === 'received' ? 'Payment Received' : 'Payment Sent';
  const message = `₹${amount} ${type === 'received' ? 'received' : 'sent'} for your order`;

  return createNotification({
    userId,
    title,
    message,
    type: 'PAYMENT',
    data: { orderId, amount, type },
  });
}
