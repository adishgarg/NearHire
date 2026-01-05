'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function sendMessage(
  conversationId: string,
  receiverId: string,
  content: string,
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' = 'TEXT',
  attachments: string[] = []
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId,
    },
  });

  if (!participant) {
    throw new Error('Forbidden');
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      receiverId,
      content,
      messageType,
      attachments,
    },
  });

  // Update conversation
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessage: content,
      lastMessageAt: new Date(),
    },
  });

  // Increment unread count
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: receiverId,
    },
    data: {
      unreadCount: {
        increment: 1,
      },
    },
  });

  revalidatePath('/messages');
  return message;
}

export async function markConversationAsRead(conversationId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Mark all messages as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      receiverId: userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  // Reset unread count
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId,
    },
    data: {
      unreadCount: 0,
      lastReadAt: new Date(),
    },
  });

  revalidatePath('/messages');
  return { success: true };
}

export async function getOrCreateConversation(
  otherUserId: string,
  gigId?: string,
  orderId?: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Verify the other user exists
  const otherUser = await prisma.user.findUnique({ 
    where: { id: otherUserId } 
  });

  if (!otherUser) {
    throw new Error('User not found');
  }

  // Check for existing conversation
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
        {
          participants: {
            some: {
              userId: otherUserId,
            },
          },
        },
        ...(gigId ? [{ gigId }] : []),
        ...(orderId ? [{ orderId }] : []),
      ],
    },
  });

  if (existingConversation) {
    return existingConversation;
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      gigId: gigId || null,
      orderId: orderId || null,
      participants: {
        create: [
          { userId: userId },
          { userId: otherUserId },
        ],
      },
    },
  });

  revalidatePath('/messages');
  return conversation;
}

export async function getUnreadCount() {
  const session = await auth();

  if (!session?.user?.id) {
    return 0;
  }

  const userId = session.user.id;

  const result = await prisma.conversationParticipant.aggregate({
    where: {
      userId,
    },
    _sum: {
      unreadCount: true,
    },
  });

  return result._sum.unreadCount || 0;
}
