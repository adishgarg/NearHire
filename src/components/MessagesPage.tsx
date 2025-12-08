'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Send, Paperclip, MoreVertical, Search } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
  gigTitle?: string;
}

export function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messageText, setMessageText] = useState('');

  const conversations: Conversation[] = [
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        username: 'sarahdesigns',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        online: true,
      },
      lastMessage: 'Thanks for the update! Looking forward to the final version.',
      timestamp: '2 min ago',
      unread: 2,
      gigTitle: 'I will design a modern logo for your brand',
    },
    {
      id: '2',
      user: {
        name: 'Mike Chen',
        username: 'mikecodes',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        online: false,
      },
      lastMessage: 'The website looks great! Just a few minor changes needed.',
      timestamp: '1 hour ago',
      unread: 0,
      gigTitle: 'I will develop a responsive website with React',
    },
    {
      id: '3',
      user: {
        name: 'Emma Davis',
        username: 'emmawriter',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
        online: true,
      },
      lastMessage: 'I\'ve sent over the first draft for your review.',
      timestamp: '3 hours ago',
      unread: 1,
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      senderId: '1',
      text: 'Hi! I\'m interested in your logo design service.',
      timestamp: '10:30 AM',
      isOwn: false,
    },
    {
      id: '2',
      senderId: 'me',
      text: 'Hello! Thanks for reaching out. I\'d be happy to help with your logo design.',
      timestamp: '10:32 AM',
      isOwn: true,
    },
    {
      id: '3',
      senderId: 'me',
      text: 'Could you tell me more about your brand and what you\'re looking for?',
      timestamp: '10:32 AM',
      isOwn: true,
    },
    {
      id: '4',
      senderId: '1',
      text: 'Sure! We\'re a tech startup focusing on AI solutions. We need a modern, professional logo.',
      timestamp: '10:35 AM',
      isOwn: false,
    },
    {
      id: '5',
      senderId: 'me',
      text: 'Perfect! I can definitely help with that. I\'ll start working on some concepts.',
      timestamp: '10:40 AM',
      isOwn: true,
    },
    {
      id: '6',
      senderId: '1',
      text: 'Thanks for the update! Looking forward to the final version.',
      timestamp: '11:15 AM',
      isOwn: false,
    },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Add message logic here
      setMessageText('');
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-[#f5ecdf]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-gray-900 font-playfair text-3xl font-semibold">Messages</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conversations List */}
          <Card className="border-gray-200 bg-white lg:col-span-1 rounded-3xl">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  className="bg-white border-gray-200 pl-10 text-gray-900 placeholder:text-gray-500 rounded-full"
                />
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-gray-200">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedConversation === conv.id ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-gray-300">
                          <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                          <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                        </Avatar>
                        {conv.user.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-600 border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-gray-900 font-semibold truncate">{conv.user.name}</p>
                          <span className="text-xs text-gray-500">{conv.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                        {conv.gigTitle && (
                          <p className="text-xs text-gray-500 mt-1 truncate">{conv.gigTitle}</p>
                        )}
                      </div>
                      {conv.unread > 0 && (
                        <Badge className="bg-gray-900 text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Window */}
          <Card className="border-gray-200 bg-white lg:col-span-2 rounded-3xl">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-gray-300">
                        <AvatarImage src={selectedConv.user.avatar} alt={selectedConv.user.name} />
                        <AvatarFallback>{selectedConv.user.name[0]}</AvatarFallback>
                      </Avatar>
                      {selectedConv.user.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-600 border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">{selectedConv.user.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedConv.user.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="h-[450px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-3 ${
                            message.isOwn
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.isOwn ? 'text-gray-300' : 'text-gray-500'
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-full"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-full"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[600px]">
                <p className="text-gray-600">Select a conversation to start messaging</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
