'use client';

import { Search, Bell, MessageSquare, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session, status } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onSearch?.(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <span className="text-white">N</span>
              </div>
              <span className="text-xl text-white">NearHire</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Browse
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Explore
              </Button>
            </nav>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="What service are you looking for today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border-zinc-700 pl-10 pr-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="md:hidden text-gray-300">
              <Search className="h-5 w-5" />
            </Button>

            {status === 'loading' ? (
              // Loading state
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
              </div>
            ) : session ? (
              // Authenticated user
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-emerald-600 border-0 text-xs">
                        3
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800">
                    <div className="p-3 border-b border-zinc-800">
                      <p className="text-white">Notifications</p>
                    </div>
                    <DropdownMenuItem className="p-4 text-gray-300 hover:bg-zinc-800 focus:bg-zinc-800">
                      <div>
                        <p className="text-white">New order received</p>
                        <p className="text-sm text-gray-400">2 hours ago</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-4 text-gray-300 hover:bg-zinc-800 focus:bg-zinc-800">
                      <div>
                        <p className="text-white">Project milestone completed</p>
                        <p className="text-sm text-gray-400">5 hours ago</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Messages */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-gray-300 hover:text-white"
                  onClick={() => router.push('/messages')}
                >
                  <MessageSquare className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-emerald-600 border-0 text-xs">
                    5
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-10 px-2">
                      <Avatar className="h-8 w-8 border-2 border-emerald-600">
                        <AvatarImage src={session.user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200"} alt="User" />
                        <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                    <div className="px-3 py-2 border-b border-zinc-800">
                      <p className="text-white text-sm font-medium">{session.user?.name || 'User'}</p>
                      <p className="text-zinc-400 text-xs">{session.user?.email}</p>
                    </div>
                    <DropdownMenuItem 
                      className="text-gray-300 hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                      onClick={() => router.push('/profile')}
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-gray-300 hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                      onClick={() => router.push('/dashboard')}
                    >
                      My Gigs
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-gray-300 hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                      onClick={() => router.push('/orders')}
                    >
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem 
                      className="text-gray-300 hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                      onClick={() => router.push('/dashboard')}
                    >
                      Switch to Selling
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem className="text-red-400 hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
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
                  className="text-gray-300 hover:text-white hidden sm:inline-flex"
                  onClick={() => router.push('/auth/login')}
                >
                  Sign in
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => router.push('/auth/signup')}
                >
                  Join NearHire
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="lg:hidden text-gray-300">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}