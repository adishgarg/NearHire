'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  data: any;
  isRead: boolean;
  createdAt: Date | string;
}

export function useNotifications() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const ablyClientRef = useRef<any>(null);
  const fetchedRef = useRef(false);

  // Fetch notifications
  const fetchNotifications = async (unreadOnly = false) => {
    if (!session || status !== 'authenticated') return;
    try {
      const url = `/api/notifications${unreadOnly ? '?unreadOnly=true' : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!session || status !== 'authenticated') return;
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!session || status !== 'authenticated') return;
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!session || status !== 'authenticated') return;
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Initialize Ably for real-time notifications
  useEffect(() => {
    let mounted = true;
    if (!session?.user?.id) return;

    async function initAbly() {
      const key = process.env.NEXT_PUBLIC_ABLY_KEY;
      if (!key) return;

      try {
        const ablyModule = await import('ably');
        const client = new (ablyModule as any).Realtime({ key });
        ablyClientRef.current = client;

        const userCh = client.channels.get(`user:${session?.user?.id}`);

        // Listen for new notifications
        userCh.subscribe('notification:new', (msg: any) => {
          if (!mounted) return;
          const notification = msg.data;

          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Optional: Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
            });
          }
        });
      } catch (err) {
        console.warn('Ably init failed for notifications', err);
      }
    }

    initAbly();

    return () => {
      mounted = false;
      try {
        ablyClientRef.current?.close();
      } catch (e) {}
    };
  }, [session?.user?.id]);

  // Fetch initial data
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id || fetchedRef.current) return;
    
    fetchedRef.current = true;
    fetchNotifications();
    fetchUnreadCount();
  }, [status, session?.user?.id]);

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
  };
}
