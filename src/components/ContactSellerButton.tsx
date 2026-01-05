'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ContactSellerButtonProps {
  sellerId: string;
  sellerName: string;
  gigId?: string;
  orderId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function ContactSellerButton({
  sellerId,
  sellerName,
  gigId,
  orderId,
  variant = 'default',
  className = '',
}: ContactSellerButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleContactSeller = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!sellerId) {
      console.error('Seller ID is missing');
      return;
    }

    try {
      setLoading(true);

      // Start or get existing conversation
      const response = await fetch('/api/messages/start-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otherUserId: sellerId,
          gigId: gigId || null,
          orderId: orderId || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/messages?conversation=${data.conversationId}`);
      } else {
        const error = await response.json();
        console.error('Failed to start conversation:', error);
        alert(error.error || 'Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleContactSeller}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4 mr-2" />
      )}
      Contact {sellerName}
    </Button>
  );
}
