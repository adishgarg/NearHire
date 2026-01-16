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
    <div className="min-h-screen bg-[#e6ddcf]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-[#f5ecdf]">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
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
              <h1 className="mb-4 text-gray-900 font-serif text-3xl font-semibold">{currentGig.title}</h1>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-gray-200">
                  <AvatarImage src={currentGig.seller.avatar || currentGig.seller.image || ''} alt={currentGig.seller.name || 'Seller'} />
                  <AvatarFallback className="bg-gray-100 text-gray-900">{(currentGig.seller.name || 'S')[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-medium">{currentGig.seller.name || 'Unknown Seller'}</p>
                    {currentGig.seller.verified && (
                      <VerifiedIcon className="h-4 w-4 fill-gray-900 text-gray-900" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="text-gray-900 font-medium">{currentGig.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-gray-600">({currentGig.reviewCount || 0} reviews)</span>
                    <Badge variant="outline" className="border-gray-300 text-gray-700 rounded-full">
                      {currentGig.seller.level || 'New Seller'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Gig Images */}
            <div className="mb-8">
              <ImageWithFallback
                src={currentGig.image || ((currentGig as any).images && (currentGig as any).images[0]) || ''}
                alt={currentGig.title}
                className="w-full rounded-3xl"
                fallbackSrc="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="bg-white border border-gray-200 rounded-full p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-full">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-full">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="about" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-full">
                  About Seller
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="mb-3 text-gray-900 font-serif text-2xl font-semibold">About This Gig</h2>
                    <p className="text-gray-600 leading-relaxed">{currentGig.description}</p>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div>
                    <h3 className="mb-3 text-gray-900 font-serif text-xl font-semibold">What's Included</h3>
                    <ul className="space-y-2">
                      {currentGig.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div>
                    <h3 className="mb-3 text-gray-900 font-serif text-xl font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentGig.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full"
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
                    <Card key={i} className="border-gray-200 bg-white p-6 rounded-2xl">
                      <div className="mb-3 flex items-start gap-3">
                        <Avatar className="h-10 w-10 border border-gray-200">
                          <AvatarImage src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=200`} />
                          <AvatarFallback className="bg-gray-100 text-gray-900">U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-900 font-medium">User {i}</p>
                            <span className="text-sm text-gray-500">2 weeks ago</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        Excellent work! Very professional and delivered exactly what I needed. Highly recommended!
                      </p>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-6">
                <Card className="border-gray-200 bg-white p-6 rounded-3xl">
                  <div className="mb-4 flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-gray-200">
                      <AvatarImage src={currentGig.seller.avatar || currentGig.seller.image || ''} alt={currentGig.seller.name || 'Seller'} />
                      <AvatarFallback className="bg-gray-100 text-gray-900 text-2xl">{(currentGig.seller.name || 'S')[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-gray-900 font-serif text-xl font-semibold">{currentGig.seller.name || 'Unknown Seller'}</h3>
                      <p className="text-gray-600">@{currentGig.seller.username || currentGig.seller.name || 'seller'}</p>
                      <Badge variant="outline" className="mt-2 border-gray-300 text-gray-700 rounded-full">
                        {currentGig.seller.level || 'New Seller'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Professional expert with {currentGig.seller.reviewCount || 0}+ completed projects.
                    Dedicated to delivering high-quality work and excellent customer service.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Total Orders</p>
                      <p className="text-gray-900 font-semibold text-lg">{currentGig.seller.reviewCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Rating</p>
                      <p className="text-gray-900 font-semibold text-lg">{currentGig.seller.rating} ⭐</p>
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
              <Card className="border-gray-200 bg-white p-6 rounded-3xl">
                <div className="mb-6">
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-4xl text-gray-900 font-serif font-semibold">₹{currentGig.price}</span>
                    <span className="text-gray-600">/ project</span>
                  </div>
                  <p className="text-gray-600">{currentGig.description.substring(0, 60)}...</p>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4 text-gray-900" />
                    <span>{currentGig.deliveryTime} delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <RefreshCw className="h-4 w-4 text-gray-900" />
                    <span>Unlimited revisions</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="h-4 w-4 text-gray-900" />
                    <span>Money-back guarantee</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full py-6">
                    Continue (₹{currentGig.price})
                  </Button>
                  <Button variant="outline" className="w-full border-gray-300 text-gray-900 hover:bg-gray-50 rounded-full py-6">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-full h-12">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-full h-12">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Seller Stats */}
              <Card className="border-gray-200 bg-white p-6 rounded-3xl">
                <h3 className="mb-4 text-gray-900 font-serif text-xl font-semibold">Seller Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-900" />
                      <span className="text-gray-600">Response time</span>
                    </div>
                    <span className="text-gray-900 font-medium">1 hour</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-gray-600">Orders completed</span>
                    </div>
                    <span className="text-gray-900 font-medium">{currentGig.reviewCount}</span>
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
