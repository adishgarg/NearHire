"use client";

import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { GigCard } from "@/components/GigCard";
import { Footer } from "@/components/Footer";
import { categories, featuredGigs } from "@/data/mockData";
import { TrendingUp, Zap, Award } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen">
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
      <section id="explore" className="border-b border-gray-200 py-20 px-4 bg-[#f5ecdf]">
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
      </section>

      {/* Why Choose NearHire Section */}
      <section className="border-b border-gray-200 py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-4xl font-semibold text-gray-900 mb-4">
              Why Choose NearHire?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join millions of users who trust NearHire for their freelancing needs
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                  <Zap className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-3">Location-Based Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Find talented freelancers near you with our smart geolocation technology for faster collaboration
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
                  <Award className="h-10 w-10 text-amber-600" />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-3">Top Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                Work with verified professionals who deliver exceptional results
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                  <TrendingUp className="h-10 w-10 text-emerald-600" />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-3">Best Value</h3>
              <p className="text-gray-600 leading-relaxed">
                Competitive pricing with transparent fees and money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-gray-200 py-24 px-4 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-gray-900 text-white border-none px-4 py-2 text-sm">
            Start Selling
          </Badge>
          <h2 className="font-serif text-5xl font-semibold text-gray-900 mb-6">
            Ready to Start Earning?
          </h2>
          <p className="mb-10 text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Join thousands of freelancers who are already making money doing what they love
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 py-6 text-lg"
              onClick={() => router.push('/dashboard')}
            >
              Become a Seller
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
