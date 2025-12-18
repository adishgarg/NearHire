"use client";

import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { GigCard } from "@/components/GigCard";
import { Footer } from "@/components/Footer";
import MagicBento from "@/components/MagicBento";
import { categories, featuredGigs } from "@/data/mockData";
import { TrendingUp, Zap, Award } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen mt-[2rem]">
      <Hero />
      
      {/* Trusted By Section */}

      {/* Categories Section */}
      <section id="categories" className="border-b border-gray-200 py-20 px-4 bg-[#f5ecdf]">
        <div className="container mx-auto">
          <div className="mb-12">
            <h2 className="font-serif text-4xl font-semibold text-gray-900 mb-2 text-center">
              Browse by Category
            </h2>
            <p className="text-gray-600 text-center">Find the perfect service for your needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Gigs Section */}
      <section className="border-b border-gray-200 py-20 px-4 bg-[#e6ddcf]">
        <div className="container mx-auto">
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-gray-900" />
              <h2 className="font-serif text-4xl font-semibold text-gray-900">Trending Gigs</h2>
            </div>
            <p className="text-gray-600 text-center">Most popular services this week</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGigs.slice(0, 4).map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Services Section */}
      {/* <section id="explore" className="border-b border-gray-200 py-20 px-4 bg-[#f5ecdf]">
        <div className="container mx-auto">
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="h-6 w-6 text-amber-600" />
              <h2 className="font-serif text-4xl font-semibold text-gray-900">Top Rated Services</h2>
            </div>
            <p className="text-gray-600 text-center">Highly rated by our community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGigs.slice(4, 8).map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </div>
      </section> */}

      {/* Why Choose NearHire Section - Bento Grid */}
      <section className="border-b border-gray-200 py-20 px-4 bg-[#f5ecdf]">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-4xl font-semibold text-gray-900 mb-4">
              Why Choose NearHire?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover what makes us different
            </p>
          </div>
          <div className="flex justify-center">
            <MagicBento
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              clickEffect={true}
              enableMagnetism={true}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
