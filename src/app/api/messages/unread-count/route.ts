import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get unread message count across all conversations
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Sum up unread counts from all conversations
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        userId,
        conversation: {
          isActive: true,
        },
      },
      select: {
        unreadCount: true,
      },
    });

    const totalUnread = participants.reduce(
      (sum, p) => sum + (p.unreadCount || 0),
      0
    );

    return NextResponse.json({ count: totalUnread });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
