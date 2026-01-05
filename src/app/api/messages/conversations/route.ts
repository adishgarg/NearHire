import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all conversations where the user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
        isActive: true,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        gig: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Format conversations for the frontend
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.userId !== userId
      );
      const currentUserParticipant = conv.participants.find(
        (p) => p.userId === userId
      );

      return {
        id: conv.id,
        user: {
          id: otherParticipant?.user.id || '',
          name: otherParticipant?.user.name || 'Unknown User',
          username: otherParticipant?.user.username || '',
          avatar: otherParticipant?.user.image || '',
          online: otherParticipant?.user.isOnline || false,
        },
        lastMessage: conv.messages[0]?.content || '',
        timestamp: conv.lastMessageAt || conv.createdAt,
        unread: currentUserParticipant?.unreadCount || 0,
        gigTitle: conv.gig?.title,
        gigImage: conv.gig?.images?.[0],
        orderId: conv.order?.id,
        orderStatus: conv.order?.status,
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
