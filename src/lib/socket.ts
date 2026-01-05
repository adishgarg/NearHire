import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type NextApiResponseWithSocket = {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function initializeSocket(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log('🚀 Initializing Socket.IO server...');

    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    res.socket.server.io = io;

    io.on('connection', async (socket) => {
      console.log('✅ Client connected:', socket.id);

      // Authenticate user
      const token = socket.handshake.auth.token;
      let userId: string | null = null;

      try {
        // In a real implementation, verify the token
        // For now, we'll accept the userId from the client
        userId = socket.handshake.auth.userId;
        
        if (userId) {
          // Update user online status
          await prisma.user.update({
            where: { id: userId },
            data: { isOnline: true, lastSeen: new Date() },
          });

          // Join user's personal room
          socket.join(`user:${userId}`);
          
          // Notify others that user is online
          socket.broadcast.emit('user:online', { userId });
          
          console.log(`👤 User ${userId} connected`);
        }
      } catch (error) {
        console.error('❌ Socket authentication error:', error);
      }

      // Join conversation rooms
      socket.on('conversation:join', async (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`📨 Socket ${socket.id} joined conversation ${conversationId}`);
      });

      // Leave conversation rooms
      socket.on('conversation:leave', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`📤 Socket ${socket.id} left conversation ${conversationId}`);
      });

      // Handle new messages
      socket.on('message:send', async (data: {
        conversationId: string;
        content: string;
        receiverId: string;
      }) => {
        if (!userId) return;

        try {
          // Create message in database
          const message = await prisma.message.create({
            data: {
              conversationId: data.conversationId,
              senderId: userId,
              receiverId: data.receiverId,
              content: data.content,
              messageType: 'TEXT',
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

          // Update conversation
          await prisma.conversation.update({
            where: { id: data.conversationId },
            data: {
              lastMessage: data.content,
              lastMessageAt: new Date(),
            },
          });

          // Increment unread count for receiver
          await prisma.conversationParticipant.updateMany({
            where: {
              conversationId: data.conversationId,
              userId: data.receiverId,
            },
            data: {
              unreadCount: {
                increment: 1,
              },
            },
          });

          // Format message
          const formattedMessage = {
            id: message.id,
            senderId: message.senderId,
            senderName: message.sender.name,
            senderAvatar: message.sender.image,
            content: message.content,
            messageType: message.messageType,
            attachments: message.attachments,
            isRead: message.isRead,
            isOwn: message.senderId === userId,
            timestamp: message.createdAt,
          };

          // Broadcast to conversation room
          io.to(`conversation:${data.conversationId}`).emit('message:new', formattedMessage);
          
          // Notify receiver
          io.to(`user:${data.receiverId}`).emit('notification:new-message', {
            conversationId: data.conversationId,
            message: formattedMessage,
          });

          console.log(`📨 Message sent in conversation ${data.conversationId}`);
        } catch (error) {
          console.error('❌ Error sending message:', error);
          socket.emit('message:error', { error: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing:start', (data: { conversationId: string; userId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
          userId: data.userId,
          conversationId: data.conversationId,
        });
      });

      socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
          userId: data.userId,
          conversationId: data.conversationId,
        });
      });

      // Handle read receipts
      socket.on('messages:mark-read', async (data: { conversationId: string }) => {
        if (!userId) return;

        try {
          await prisma.message.updateMany({
            where: {
              conversationId: data.conversationId,
              receiverId: userId,
              isRead: false,
            },
            data: {
              isRead: true,
              readAt: new Date(),
            },
          });

          await prisma.conversationParticipant.updateMany({
            where: {
              conversationId: data.conversationId,
              userId,
            },
            data: {
              unreadCount: 0,
              lastReadAt: new Date(),
            },
          });

          // Notify sender about read receipt
          socket.to(`conversation:${data.conversationId}`).emit('messages:read', {
            conversationId: data.conversationId,
            userId,
          });
        } catch (error) {
          console.error('❌ Error marking messages as read:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log('❌ Client disconnected:', socket.id);
        
        if (userId) {
          try {
            // Update user offline status
            await prisma.user.update({
              where: { id: userId },
              data: { isOnline: false, lastSeen: new Date() },
            });

            // Notify others that user is offline
            socket.broadcast.emit('user:offline', { userId });
            
            console.log(`👤 User ${userId} disconnected`);
          } catch (error) {
            console.error('❌ Error updating offline status:', error);
          }
        }
      });
    });

    console.log('✅ Socket.IO server initialized');
  } else {
    console.log('⚡ Socket.IO server already running');
  }

  return res.socket.server.io;
}
