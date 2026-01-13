'use client';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search } from 'lucide-react';

interface HeroProps {
  onSearch?: (query: string) => void;
}

const freelancers = [
  {
    name: "Arjun Patel",
    role: "Full-Stack Developer • React / Node",
    image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600",
    gradient: "from-gray-800 to-gray-600"
  },
  {
    name: "Mira Singh",
    role: "Product Designer • SaaS & Mobile",
    image: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=600",
    gradient: "from-orange-600 to-orange-800"
  },
  {
    name: "Luis Gomez",
    role: "Brand & Motion Designer",
    image: "https://images.pexels.com/photos/1181680/pexels-photo-1181680.jpeg?auto=compress&cs=tinysrgb&w=600",
    gradient: "from-pink-600 to-pink-900"
  },
  {
    name: "Sara Ahmed",
    role: "Performance Marketer • DTC",
    image: "https://images.pexels.com/photos/1181524/pexels-photo-1181524.jpeg?auto=compress&cs=tinysrgb&w=600",
    gradient: "from-green-600 to-green-800"
  },
  {
    name: "Noah Lee",
    role: "Backend Engineer • APIs & Data",
    image: "https://images.pexels.com/photos/1181681/pexels-photo-1181681.jpeg?auto=compress&cs=tinysrgb&w=600",
    gradient: "from-pink-600 to-pink-900"
  },
  {
    name: "Ananya Rao",
    role: "Content & Copy Strategy",
    image: "https://images.pexels.com/photos/1181518/pexels-photo-1181518.jpeg?auto=compress&cs=tinysrgb&w=600",
    gradient: "from-orange-600 to-orange-800"
  }
];

export function Hero({ onSearch }: HeroProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      onSearch?.(searchQuery);
    }
  };

  return (
    <section className="text-center">
      <div className="text-xs uppercase tracking-[0.14em] text-gray-500 mb-2">
        FREELANCE TALENT MARKETPLACE
      </div>
      <h1 className="font-serif text-[32px] leading-tight mb-1 font-medium">
        Build Your Dream Team,
      </h1>
      <div className="font-serif text-[38px] font-bold mb-3">
        Talent at your doorstep
      </div>
      <p className="text-sm text-gray-600 max-w-lg mx-auto mb-5 leading-relaxed">
        NearHire connects you with verified designers, developers, marketers, and more —
        so you can ship projects faster without growing your payroll.
      </p>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search for services (e.g., logo design, web development, content writing...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-32 py-6 text-base bg-white border-gray-300 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6 bg-gray-900 hover:bg-gray-800 text-white"
          >
            Search
          </Button>
        </div>
      </form>

      <div className="flex justify-center gap-3 ">
        <Button 
          onClick={() => router.push('/marketplace')}
          variant="outline"
          className="rounded-full px-5 py-2.5 text-sm font-medium bg-transparent border-gray-300 text-gray-900 hover:bg-gray-50"
        >
          Browse all services
        </Button>
      </div>
    </section>
  );
}
