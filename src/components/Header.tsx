'use client';

import { Bell, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-[#f5ecdf]/95 backdrop-blur supports-[backdrop-filter]:bg-[#f5ecdf]/80">
      <div className="container mx-auto px-10">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 transition-colors">
              Services
            </Link>
            <a 
              href="/#categories" 
              onClick={(e) => handleSmoothScroll(e, 'categories')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Categories
            </a>
          </nav>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-serif text-[22px] font-semibold tracking-wider text-gray-900">
            NearHire
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {status === 'loading' ? (
              // Loading state
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : session ? (
              // Authenticated user
              <>
                {/* Sell Services Button */}
                <Link href="/gigs/create">
                  <Button 
                    size="sm" 
                    className="bg-gray-900 hover:bg-gray-800 text-white border-none hidden sm:inline-flex rounded-full px-6"
                  >
                    Sell Services
                  </Button>
                </Link>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gray-900 border-0 text-xs">
                        3
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-white border-gray-200">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-gray-900 font-medium">Notifications</p>
                    </div>
                    <DropdownMenuItem className="p-4 text-gray-600 hover:bg-gray-50 focus:bg-gray-50">
                      <div>
                        <p className="text-gray-900">New order received</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-4 text-gray-600 hover:bg-gray-50 focus:bg-gray-50">
                      <div>
                        <p className="text-gray-900">Project milestone completed</p>
                        <p className="text-sm text-gray-500">5 hours ago</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Messages */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-gray-600 hover:text-gray-900"
                  onClick={() => router.push('/messages')}
                >
                  <MessageSquare className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gray-900 border-0 text-xs">
                    5
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-10 px-2 hover:bg-transparent">
                      <Avatar className="h-8 w-8 border-2 border-gray-300">
                        <AvatarImage src={session.user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200"} alt="User" />
                        <AvatarFallback className="bg-gray-200 text-gray-900">{session.user?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
                    <div className="px-3 py-2 border-b border-gray-200">
                      <p className="text-gray-900 text-sm font-medium">{session.user?.name || 'User'}</p>
                      <p className="text-gray-500 text-xs">{session.user?.email}</p>
                    </div>
                    <DropdownMenuItem 
                      className="text-gray-600 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                      onClick={() => router.push('/profile')}
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-gray-600 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                      onClick={() => router.push('/dashboard')}
                    >
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-gray-600 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                      onClick={() => router.push('/orders')}
                    >
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-gray-600 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                      onClick={() => router.push('/gigs/manage')}
                    >
                      My Services
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem 
                      className="text-gray-600 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                      onClick={() => router.push('/settings')}
                    >
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem 
                      className="text-red-600 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Unauthenticated user
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:text-gray-900 hover:bg-transparent hidden sm:inline-flex"
                  onClick={() => router.push('/auth/login')}
                >
                  Sign in
                </Button>
                <Button 
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                  onClick={() => router.push('/auth/signup')}
                >
                  Join NearHire
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}