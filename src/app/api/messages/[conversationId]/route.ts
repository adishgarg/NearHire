import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;
    const userId = session.user.id;

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

    // Get all messages in the conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format messages for the frontend
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.sender.name,
      senderAvatar: msg.sender.image,
      content: msg.content,
      messageType: msg.messageType,
      attachments: msg.attachments,
      isRead: msg.isRead,
      isOwn: msg.senderId === userId,
      timestamp: msg.createdAt,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
