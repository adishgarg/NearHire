"use client";

import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { GigCard } from "@/components/GigCard";
import { Footer } from "@/components/Footer";
import { categories, featuredGigs } from "@/data/mockData";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      
      {/* Categories Section */}
      <section id="categories" className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gigs Section */}
      <section id="explore" className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Featured Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
