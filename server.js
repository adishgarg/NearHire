const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST'],
    },
  });

  // Import Prisma
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  io.on('connection', async (socket) => {
    console.log('✅ Client connected:', socket.id);

    const userId = socket.handshake.auth.userId;

    if (userId) {
      try {
        // Update user online status
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: true, lastSeen: new Date() },
        });

        socket.join(`user:${userId}`);
        socket.broadcast.emit('user:online', { userId });
        console.log(`👤 User ${userId} connected`);
      } catch (error) {
        console.error('❌ Socket authentication error:', error);
      }
    }

    // Join conversation
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`📨 Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`📤 Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Send message
    socket.on('message:send', async (data) => {
      if (!userId) return;

      try {
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
              select: { id: true, name: true, image: true },
            },
          },
        });

        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: {
            lastMessage: data.content,
            lastMessageAt: new Date(),
          },
        });

        await prisma.conversationParticipant.updateMany({
          where: {
            conversationId: data.conversationId,
            userId: data.receiverId,
          },
          data: { unreadCount: { increment: 1 } },
        });

        const formattedMessage = {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderName: message.sender.name,
          senderAvatar: message.sender.image,
          content: message.content,
          messageType: message.messageType,
          attachments: message.attachments,
          isRead: message.isRead,
          timestamp: message.createdAt,
        };

        io.to(`conversation:${data.conversationId}`).emit('message:new', formattedMessage);
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

    // Typing indicators
    socket.on('typing:start', (data) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
        userId: data.userId,
        conversationId: data.conversationId,
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        userId: data.userId,
        conversationId: data.conversationId,
      });
    });

    // Mark as read
    socket.on('messages:mark-read', async (data) => {
      if (!userId) return;

      try {
        await prisma.message.updateMany({
          where: {
            conversationId: data.conversationId,
            receiverId: userId,
            isRead: false,
          },
          data: { isRead: true, readAt: new Date() },
        });

        await prisma.conversationParticipant.updateMany({
          where: {
            conversationId: data.conversationId,
            userId,
          },
          data: { unreadCount: 0, lastReadAt: new Date() },
        });

        socket.to(`conversation:${data.conversationId}`).emit('messages:read', {
          conversationId: data.conversationId,
          userId,
        });
      } catch (error) {
        console.error('❌ Error marking messages as read:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log('❌ Client disconnected:', socket.id);

      if (userId) {
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { isOnline: false, lastSeen: new Date() },
          });

          socket.broadcast.emit('user:offline', { userId });
          console.log(`👤 User ${userId} disconnected`);
        } catch (error) {
          console.error('❌ Error updating offline status:', error);
        }
      }
    });
  });

  server.listen(port, () => {
    console.log(`✅ Server running on http://${hostname}:${port}`);
    console.log(`✅ Socket.IO running on path: /api/socketio`);
  });
});
