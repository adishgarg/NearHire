'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Send, Paperclip, MoreVertical, Search, Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string | null;
  content: string;
  messageType: string;
  attachments: string[];
  isRead: boolean;
  isOwn: boolean;
  timestamp: Date | string;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    online: boolean;
  };
  lastMessage: string;
  timestamp: Date | string;
  unread: number;
  gigTitle?: string;
  gigImage?: string;
  orderId?: string;
  orderStatus?: string;
}

export function MessagesPage() {
  const { data: session } = useSession();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = io({
      path: '/api/socketio',
      auth: {
        userId: session.user.id,
      },
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    // Listen for new messages
    socket.on('message:new', (message: any) => {
      console.log('📨 Received new message:', message);
      
      // Add message to the list with isOwn flag
      setMessages((prev) => {
        // Avoid duplicates (in case optimistic update already added it)
        const exists = prev.some(m => m.id === message.id);
        if (exists) {
          console.log('⚠️ Message already exists, skipping');
          return prev;
        }
        
        console.log('✅ Adding message to UI');
        return [...prev, { 
          ...message, 
          isOwn: message.senderId === session.user.id 
        }];
      });
      
      // Update conversation list with latest message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message.content, timestamp: new Date() }
            : conv
        )
      );
    });

    // Listen for typing indicators
    socket.on('typing:start', ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => new Set(prev).add(userId));
    });

    socket.on('typing:stop', ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // Listen for online/offline status
    socket.on('user:online', ({ userId }: { userId: string }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user.id === userId ? { ...conv, user: { ...conv.user, online: true } } : conv
        )
      );
    });

    socket.on('user:offline', ({ userId }: { userId: string }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user.id === userId ? { ...conv, user: { ...conv.user, online: false } } : conv
        )
      );
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [session?.user?.id]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages and join conversation room
  useEffect(() => {
    if (selectedConversation && socketRef.current) {
      console.log('🔄 Loading conversation:', selectedConversation);
      fetchMessages(selectedConversation);
      markAsRead(selectedConversation);
      
      console.log('📥 Joining conversation room:', selectedConversation);
      socketRef.current.emit('conversation:join', selectedConversation);

      return () => {
        if (socketRef.current) {
          console.log('📤 Leaving conversation room:', selectedConversation);
          socketRef.current.emit('conversation:leave', selectedConversation);
        }
      };
    }
  }, [selectedConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`/api/messages/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });

      // Update local conversation unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unread: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !session?.user || !socketRef.current) return;

    const selectedConv = conversations.find((c) => c.id === selectedConversation);
    if (!selectedConv) return;

    const messageContent = messageText.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    setMessageText('');

    try {
      setSending(true);

      // Optimistically add message to UI immediately
      const optimisticMessage: Message = {
        id: tempId,
        senderId: session.user.id,
        senderName: session.user.name || 'You',
        senderAvatar: session.user.image,
        content: messageContent,
        messageType: 'TEXT',
        attachments: [],
        isRead: false,
        isOwn: true,
        timestamp: new Date(),
      };

      console.log('➕ Adding optimistic message to UI:', optimisticMessage);
      setMessages((prev) => {
        const updated = [...prev, optimisticMessage];
        console.log('📊 Messages after optimistic add:', updated.length);
        return updated;
      });

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? { ...conv, lastMessage: messageContent, timestamp: new Date() }
            : conv
        )
      );

      console.log('📤 Sending message via Socket.IO:', {
        conversationId: selectedConversation,
        content: messageContent,
        receiverId: selectedConv.user.id,
      });

      // Send via Socket.IO
      socketRef.current.emit('message:send', {
        conversationId: selectedConversation,
        content: messageContent,
        receiverId: selectedConv.user.id,
        tempId, // Send temp ID so we can replace it
      });
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketRef.current.emit('typing:stop', {
        conversationId: selectedConversation,
        userId: session.user.id,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!socketRef.current || !selectedConversation || !session?.user?.id) return;

    // Send typing start
    socketRef.current.emit('typing:start', {
      conversationId: selectedConversation,
      userId: session.user.id,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send typing stop after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('typing:stop', {
          conversationId: selectedConversation,
          userId: session.user.id,
        });
      }
    }, 2000);
  };

  const formatTimestamp = (timestamp: Date | string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  };

  const formatMessageTime = (timestamp: Date | string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5ecdf] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5ecdf]">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <h1 className="mb-4 sm:mb-6 text-gray-900 font-playfair text-2xl sm:text-3xl font-semibold px-2 sm:px-0">Messages</h1>

        {conversations.length === 0 ? (
          <Card className="border-gray-200 bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center mx-2 sm:mx-0">
            <p className="text-gray-600 text-base sm:text-lg">No conversations yet</p>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Start chatting with sellers to see your messages here</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Conversations List - Hidden on mobile when conversation is selected */}
            <Card className={`border-gray-200 bg-white lg:col-span-1 rounded-2xl sm:rounded-3xl ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    className="bg-white border-gray-200 pl-10 text-gray-900 placeholder:text-gray-500 rounded-full text-sm sm:text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-200px)] sm:h-[600px]">
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 sm:p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation === conv.id ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-gray-300">
                            <AvatarImage src={conv.user.avatar || undefined} alt={conv.user.name} />
                            <AvatarFallback className="text-sm sm:text-base">{conv.user.name[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {conv.user.online && (
                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-600 border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">{conv.user.name}</p>
                            <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap ml-2">{formatTimestamp(conv.timestamp)}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                          {conv.gigTitle && (
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{conv.gigTitle}</p>
                          )}
                        </div>
                        {conv.unread > 0 && (
                          <Badge className="bg-gray-900 text-white h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Chat Window - Full screen on mobile when conversation is selected */}
            <Card className={`border-gray-200 bg-white lg:col-span-2 rounded-2xl sm:rounded-3xl ${selectedConversation ? 'fixed inset-0 z-50 lg:static lg:z-auto rounded-none lg:rounded-3xl' : 'hidden lg:block'}`}>
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      {/* Back button - Mobile only */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-8 w-8 flex-shrink-0"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Button>
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-gray-300">
                          <AvatarImage src={selectedConv.user.avatar || undefined} alt={selectedConv.user.name} />
                          <AvatarFallback className="text-sm sm:text-base">{selectedConv.user.name[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {selectedConv.user.online && (
                          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-600 border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">{selectedConv.user.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {selectedConv.user.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="h-[calc(100vh-220px)] sm:h-[450px] p-3 sm:p-4" ref={scrollAreaRef}>
                    <div className="space-y-3 sm:space-y-4">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm sm:text-base">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 sm:p-3 ${
                                message.isOwn
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="break-words text-sm sm:text-base">{message.content}</p>
                              <p
                                className={`text-[10px] sm:text-xs mt-1 ${
                                  message.isOwn ? 'text-gray-300' : 'text-gray-500'
                                }`}
                              >
                                {formatMessageTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      {/* Typing indicator */}
                      {typingUsers.size > 0 && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-3 sm:p-4 bg-white">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-600 hover:text-gray-900 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                        disabled
                      >
                        <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-full text-sm sm:text-base"
                        value={messageText}
                        onChange={(e) => {
                          setMessageText(e.target.value);
                          handleTyping();
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={sending || !isConnected}
                      />
                      <Button
                        size="icon"
                        className="bg-gray-900 hover:bg-gray-800 text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                        onClick={handleSendMessage}
                        disabled={sending || !messageText.trim()}
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[400px] sm:h-[600px]">
                  <p className="text-gray-600 text-sm sm:text-base px-4 text-center">Select a conversation to start messaging</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
