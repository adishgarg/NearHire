'use client';

import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HeroProps {
  onSearch?: (query: string) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onSearch?.(searchQuery);
    }
  };
  return (
    <div className="relative bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-cyan-900/20 border-b border-zinc-800">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-6 text-white">
            Find the perfect <span className="text-emerald-400">freelance</span> services for your business
          </h1>
          <p className="mb-8 text-xl text-gray-300">
            Millions of people use NearHire to turn their ideas into reality.
          </p>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Try "logo design", "web development", or "video editing"'
                  className="h-12 bg-white border-0 pl-12 pr-4 text-black placeholder:text-gray-500"
                />
              </div>
              <Button type="submit" className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700">
                Search
              </Button>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-gray-400 text-sm">Popular:</span>
            {['Logo Design', 'WordPress', 'Video Editing', 'AI Services', 'Social Media'].map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                className="border-zinc-700 bg-transparent text-gray-300 hover:bg-zinc-800 hover:text-white"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
