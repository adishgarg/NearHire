import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { conversationId, content, receiverId, messageType, attachments } = body;

    if (!conversationId || !content || !receiverId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is a participant in this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        receiverId,
        content,
        messageType: messageType || 'TEXT',
        attachments: attachments || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    });

    // Increment unread count for the receiver
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

    // Format message for response
    const formattedMessage = {
      id: message.id,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderAvatar: message.sender.image,
      content: message.content,
      messageType: message.messageType,
      attachments: message.attachments,
      isRead: message.isRead,
      isOwn: true,
      timestamp: message.createdAt,
    };

    return NextResponse.json(formattedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
