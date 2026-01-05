import { getUnreadCount } from '@/app/actions/messages';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export async function UnreadMessagesBadge() {
  const unreadCount = await getUnreadCount();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Link href="/messages" className="relative">
      <MessageCircle className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600 text-white border-2 border-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Link>
  );
}
