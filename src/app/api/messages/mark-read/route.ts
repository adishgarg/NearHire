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
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      );
    }

    // Mark all messages in the conversation as read
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

    // Reset unread count for the user
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
