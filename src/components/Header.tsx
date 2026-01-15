'use client';

import { Bell, MessageSquare, Menu, X } from 'lucide-react';
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
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'border-b border-white/20' 
          : 'border-b border-transparent'
      }`}
      style={{
        background: scrolled 
          ? 'rgba(245, 236, 223, 0.25)'
          : 'rgba(245, 236, 223, 0.1)',
        backdropFilter: scrolled 
          ? 'blur(16px) saturate(1.8) brightness(1.05)'
          : 'blur(12px) saturate(1.5) brightness(1.02)',
        WebkitBackdropFilter: scrolled 
          ? 'blur(16px) saturate(1.8) brightness(1.05)'
          : 'blur(12px) saturate(1.5) brightness(1.02)',
        boxShadow: scrolled
          ? `0 4px 24px 0 rgba(31, 38, 135, 0.08),
             0 2px 12px 0 rgba(31, 38, 135, 0.04),
             inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
             inset 0 -1px 0 0 rgba(255, 255, 255, 0.25)`
          : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.3)',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Mobile Menu Button - Left */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-full transition-all"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-[280px] sm:w-[340px] bg-gradient-to-br from-white via-white to-[#faf7f2] border-r border-gray-200 shadow-2xl p-0 overflow-y-auto"
            >
              {/* Header Section */}
              <div className="px-6 pt-8 pb-6 border-b border-gray-200">
                <div className="font-serif text-2xl font-bold text-gray-900 tracking-wider">
                  NearHire
                </div>
                <p className="text-sm text-gray-500 mt-2">Discover local talent</p>
              </div>

              <nav className="flex flex-col py-4 px-4">
                {/* Main Navigation */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                    Browse
                  </p>
                  <Link 
                    href="/marketplace" 
                    className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-xl px-4 py-3.5 group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium">Services</span>
                  </Link>
                  <a 
                    href="/#categories" 
                    onClick={(e) => {
                      handleSmoothScroll(e, 'categories');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-xl px-4 py-3.5 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <span className="font-medium">Categories</span>
                  </a>
                </div>
                
                {session ? (
                  <>
                    <div className="border-t border-gray-200 my-5" />
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                        Account
                      </p>
                      <Link 
                        href="/gigs/create" 
                        className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-xl px-4 py-3.5 group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="font-medium">Sell Services</span>
                      </Link>
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-xl px-4 py-3.5 group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-medium">Profile</span>
                      </Link>
                      <Link 
                        href="/orders" 
                        className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-xl px-4 py-3.5 group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <span className="font-medium">My Orders</span>
                      </Link>
                      <Link 
                        href="/dashboard/my-gigs" 
                        className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-xl px-4 py-3.5 group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <span className="font-medium">My Gigs</span>
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-200 my-5" />
                    
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                        Settings
                      </p>
                      <Link 
                        href="/settings" 
                        className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-xl px-4 py-3.5 group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all rounded-xl px-4 py-3.5 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-red-50 group-hover:bg-red-600 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4 text-red-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-t border-gray-200 my-6" />
                    <div className="space-y-3 px-4 pb-6">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push('/auth/login');
                        }}
                        className="w-full text-center py-3.5 px-4 rounded-xl border-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-all"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push('/auth/signup');
                        }}
                        className="w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl px-4 py-3 transition-all shadow-lg hover:shadow-xl"
                      >
                        Join NearHire
                      </button>
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

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
          <Link 
            href="/" 
            className="flex-1 lg:absolute lg:left-1/2 lg:-translate-x-1/2 text-center font-serif text-lg sm:text-[22px] font-semibold tracking-wider text-gray-900"
          >
            NearHire
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {status === 'loading' ? (
              // Loading state
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : session ? (
              // Authenticated user
              <>
                {/* Sell Services Button - Hidden on mobile, shown in menu */}
                <Link href="/gigs/create" className="hidden lg:block">
                  <Button 
                    size="sm" 
                    className="bg-gray-900 hover:bg-gray-800 text-white border-none rounded-full px-6"
                  >
                    Sell Services
                  </Button>
                </Link>

                {/* Notifications - Desktop only */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900 hidden sm:inline-flex">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gray-900 border-0 text-xs text-white">
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
                  className="relative text-gray-600 hover:text-gray-900 h-9 w-9 sm:h-10 sm:w-10"
                  onClick={() => router.push('/messages')}
                >
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-gray-900 border-0 text-[10px] sm:text-xs text-white">
                    5
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-9 sm:h-10 px-1 sm:px-2 hover:bg-transparent">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-gray-300">
                        <AvatarImage src={session.user?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200"} alt="User" />
                        <AvatarFallback className="bg-gray-200 text-gray-900 text-xs sm:text-sm">{session.user?.name?.[0] || 'U'}</AvatarFallback>
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
                      onClick={() => router.push('/orders')}
                    >
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-gray-600 hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                      onClick={() => router.push('/dashboard/my-gigs')}
                    >
                      My Gigs
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem 
                      className="text-amber-600 hover:bg-amber-50 focus:bg-amber-50 cursor-pointer font-medium"
                      onClick={() => router.push('/subscription')}
                    >
                      Manage Subscription
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
              <div className="flex items-center gap-2 sm:gap-3">
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:text-gray-900 hover:bg-transparent hidden sm:inline-flex text-sm"
                  onClick={() => router.push('/auth/login')}
                >
                  Sign in
                </Button>
                <Button 
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-4 sm:px-6 text-sm"
                  onClick={() => router.push('/auth/signup')}
                >
                  Join
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}