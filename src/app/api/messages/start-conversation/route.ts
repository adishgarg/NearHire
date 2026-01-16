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
    const { otherUserId, gigId, orderId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'Missing otherUserId' },
        { status: 400 }
      );
    }

    // Verify both users exist in database
    const [currentUser, otherUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.user.findUnique({ where: { id: otherUserId } }),
    ]);

    console.log('Current user check:', { userId, exists: !!currentUser });
    console.log('Other user check:', { otherUserId, exists: !!otherUser });

    if (!currentUser) {
      console.error('Current user not found in database:', userId);
      return NextResponse.json(
        { error: 'Your user account was not found. Please log out and log back in.' },
        { status: 404 }
      );
    }

    if (!otherUser) {
      console.error('Other user not found in database:', otherUserId);
      return NextResponse.json(
        { error: 'This seller no longer exists.' },
        { status: 404 }
      );
    }

    // Check if a conversation already exists between these two users
    // We want only ONE conversation per user pair, regardless of gig/order
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
        ],
        // Ensure it's exactly a 2-person conversation (no group chats)
        participants: {
          every: {
            OR: [
              { userId: userId },
              { userId: otherUserId },
            ],
          },
        },
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
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      // If gig/order context is provided, update the conversation with this context
      // This allows the conversation to display the latest gig/order being discussed
      if (gigId || orderId) {
        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: {
            ...(gigId && { gigId }),
            ...(orderId && { orderId }),
          },
        });
      }

      return NextResponse.json({
        conversationId: existingConversation.id,
        isNew: false,
      });
    }

    // Create a new conversation
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
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      isNew: true,
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
