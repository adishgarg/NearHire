'use client';

import { ArrowLeft, Star, Clock, RefreshCw, Award, Shield, MessageSquare, Heart, Share2, VerifiedIcon } from 'lucide-react';
import { Gig } from '../types';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useRouter } from 'next/navigation';
import { mockGigs } from '../data/mockData';

interface GigDetailProps {
  gigId?: string;
  gig?: Gig;
  onBack?: () => void;
}

export function GigDetail({ gigId, gig, onBack }: GigDetailProps) {
  const router = useRouter();
  
  // Find gig by ID or use provided gig or fallback to first mock gig
  const currentGig = gig || 
    (gigId ? mockGigs.find(g => g.id === gigId) : null) || 
    mockGigs[0];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-white"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to results
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title & Seller */}
            <div className="mb-6">
              <h1 className="mb-4 text-white">{currentGig.title}</h1>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={currentGig.seller.avatar} alt={currentGig.seller.name} />
                  <AvatarFallback>{currentGig.seller.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white">{currentGig.seller.name}</p>
                    {currentGig.seller.verified && (
                      <VerifiedIcon className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="text-amber-500">{currentGig.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-400">({currentGig.reviewCount} reviews)</span>
                    <Badge variant="outline" className="border-emerald-600 text-emerald-400">
                      {currentGig.seller.level}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Gig Images */}
            <div className="mb-8">
              <ImageWithFallback
                src={currentGig.image}
                alt={currentGig.title}
                className="w-full rounded-lg"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="bg-zinc-900 border-b border-zinc-800">
                <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="about" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
                  About Seller
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="mb-3 text-white">About This Gig</h2>
                    <p className="text-gray-300 leading-relaxed">{currentGig.description}</p>
                  </div>

                  <Separator className="bg-zinc-800" />

                  <div>
                    <h3 className="mb-3 text-white">What's Included</h3>
                    <ul className="space-y-2">
                      {currentGig.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator className="bg-zinc-800" />

                  <div>
                    <h3 className="mb-3 text-white">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentGig.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-zinc-700 text-gray-300 hover:border-emerald-600 hover:text-emerald-400"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-zinc-800 bg-zinc-900 p-4">
                      <div className="mb-3 flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=200`} />
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-white">User {i}</p>
                            <span className="text-sm text-gray-500">2 weeks ago</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300">
                        Excellent work! Very professional and delivered exactly what I needed. Highly recommended!
                      </p>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-6">
                <Card className="border-zinc-800 bg-zinc-900 p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={currentGig.seller.avatar} alt={currentGig.seller.name} />
                      <AvatarFallback>{currentGig.seller.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-white">{currentGig.seller.name}</h3>
                      <p className="text-gray-400">@{currentGig.seller.username}</p>
                      <Badge variant="outline" className="mt-2 border-emerald-600 text-emerald-400">
                        {currentGig.seller.level}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Professional {currentGig.category.toLowerCase()} expert with {currentGig.seller.reviewCount}+ completed projects.
                    Dedicated to delivering high-quality work and excellent customer service.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Total Orders</p>
                      <p className="text-white">{currentGig.seller.reviewCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Rating</p>
                      <p className="text-white">{currentGig.seller.rating} ⭐</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Pricing Card */}
              <Card className="border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-6">
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-3xl text-white">${currentGig.price}</span>
                    <span className="text-gray-400">/ project</span>
                  </div>
                  <p className="text-gray-400">{currentGig.description.substring(0, 60)}...</p>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span>{currentGig.deliveryTime} delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                    <span>Unlimited revisions</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>Money-back guarantee</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Continue (${currentGig.price})
                  </Button>
                  <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-1 border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="flex-1 border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Seller Stats */}
              <Card className="border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-4 text-white">Seller Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-600" />
                      <span className="text-gray-300">Response time</span>
                    </div>
                    <span className="text-white">1 hour</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-gray-300">Orders completed</span>
                    </div>
                    <span className="text-white">{currentGig.reviewCount}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
