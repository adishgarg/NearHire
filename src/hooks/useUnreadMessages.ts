'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

export function useUnreadMessages() {
  const { data: session, status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const ablyClientRef = useRef<any>(null);
  const fetchedRef = useRef(false);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!session || status !== 'authenticated') return;
    try {
      const response = await fetch('/api/messages/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  // Initialize Ably for real-time updates
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

        // Listen for new messages
        userCh.subscribe('notification:new-message', (msg: any) => {
          if (!mounted) return;
          setUnreadCount((prev) => prev + 1);
        });
      } catch (err) {
        console.warn('Ably init failed for unread messages', err);
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

  // Fetch initial count
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id || fetchedRef.current) return;
    
    fetchedRef.current = true;
    fetchUnreadCount();
  }, [status, session?.user?.id]);

  return { unreadCount, refreshCount: fetchUnreadCount };
}
