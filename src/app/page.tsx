"use client";

import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { GigCard } from "@/components/GigCard";
import { Footer } from "@/components/Footer";
import MagicBento from "@/components/MagicBento";
import TiltedCard from "@/components/TiltedCard";
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
      <section id="categories" className="py-20 bg-[#f5ecdf]">
        <div className="container mx-auto">
          <div className="mb-12">
            <h2 className="font-serif text-4xl font-semibold text-gray-900 mb-2 text-center">
              Browse by Category
            </h2>
            <p className="text-gray-600 text-center">Find the perfect service for your needs</p>
          </div>
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 sm:gap-6 justify-items-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => router.push('/marketplace')}
                  className="w-full max-w-[280px]"
                  aria-label={`Open ${category.name} in marketplace`}
                >
                  <div className="grayscale transition-all duration-300">
                    <TiltedCard
                      imageSrc={category.image}
                      altText={category.name}
                      captionText={`${category.gigCount} active gigs`}
                      containerHeight="300px"
                      containerWidth="100%"
                      imageHeight="300px"
                      imageWidth="100%"
                      rotateAmplitude={12}
                      scaleOnHover={1.14}
                      showMobileWarning={false}
                      showTooltip={true}
                      displayOverlayContent={true}
                      overlayContent={
                        <p className="text-white text-center text-base font-semibold">
                          {category.name}
                        </p>
                      }
                    />
                  </div>
                </button>
              ))}

              {/* Extra option card */}
              <button
                type="button"
                onClick={() => router.push('/marketplace')}
                className="w-full max-w-[280px]"
                aria-label="Explore marketplace"
              >
                <div className="grayscale transition-all duration-300">
                  <TiltedCard
                    imageSrc={"https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"}
                    altText={"Explore Marketplace"}
                    captionText={`Browse marketplace`}
                    containerHeight="300px"
                    containerWidth="100%"
                    imageHeight="300px"
                    imageWidth="100%"
                    rotateAmplitude={10}
                    scaleOnHover={1.14}
                    showMobileWarning={false}
                    showTooltip={true}
                    displayOverlayContent={true}
                    overlayContent={
                      <p className="text-white text-center text-base font-semibold">
                        Explore Marketplace
                      </p>
                    }
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Gigs Section - Continuous Carousel */}
      <section className="py-20 bg-[#e6ddcf] overflow-hidden">
        <div className="w-full">
          <div className="mb-12 container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-gray-900" />
              <h2 className="font-serif text-4xl font-semibold text-gray-900">
                Trending Gigs
              </h2>
            </div>
            <p className="text-gray-600 text-center">
              Most popular services this week
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-carousel hover:pause-carousel">
              {[...featuredGigs.slice(0, 4), ...featuredGigs.slice(0, 4)].map((gig, index) => (
                <div key={`${gig.id}-${index}`} className="min-w-[280px] max-w-[280px] pointer-events-auto">
                  <GigCard gig={gig} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Services Section */}
      {/* <section id="explore" className="py-20 px-4 bg-[#f5ecdf]">
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
      <section className="py-20 px-4 bg-[#f5ecdf]">
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
      <style jsx global>{`
        @keyframes carousel-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-carousel {
          display: flex;
          width: max-content;
          animation: carousel-scroll 25s linear infinite;
        }

        .animate-carousel:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
