'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Eye, Heart, Share2, ArrowLeft, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface Gig {
  id: string;
  title: string;
  description: string;
  slug: string;
  price: number;
  deliveryTime: number;
  rating: number;
  reviewCount: number;
  views: number;
  orderCount: number;
  images: string[];
  tags: string[];
  category: {
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
    image: string | null;
    rating: number;
    reviewCount: number;
    responseTime?: string;
    lastSeen?: string;
    isOnline: boolean;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: {
      name: string;
      image: string | null;
    };
  }>;
  averageRating?: number;
  startingPrice?: number;
}

export function GigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await fetch(`/api/gigs/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setGig(data);
        } else {
          console.error('Failed to fetch gig');
        }
      } catch (error) {
        console.error('Error fetching gig:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchGig();
    }
  }, [params.id]);

  const handleOrderNow = () => {
    if (gig) {
      router.push(`/checkout?gigId=${gig.id}`);
    }
  };

  const handleContactSeller = () => {
    if (gig) {
      router.push(`/messages?sellerId=${gig.seller.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Gig Not Found</h1>
          <Link href="/marketplace">
            <Button variant="outline" className="border-zinc-700">
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = gig.startingPrice || gig.price;
  const displayRating = gig.averageRating || gig.rating;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Link href="/marketplace" className="hover:text-white">
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
            <span>/</span>
            <span className="capitalize">{gig.category.name}</span>
            <span>/</span>
            <span className="text-white truncate">{gig.title}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="border-zinc-800 bg-zinc-900 overflow-hidden">
              <CardContent className="p-0">
                {gig.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative h-96 bg-zinc-800">
                      <Image
                        src={gig.images[selectedImage]}
                        alt={gig.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    {gig.images.length > 1 && (
                      <div className="flex gap-2 p-4 overflow-x-auto">
                        {gig.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-colors ${
                              selectedImage === index
                                ? 'border-emerald-500'
                                : 'border-zinc-700 hover:border-zinc-600'
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${gig.title} ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-96 bg-zinc-800 flex items-center justify-center">
                    <span className="text-6xl opacity-50">📷</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gig Details */}
            <div className="space-y-6">
              {/* Title and Actions */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{gig.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={gig.seller.image || ''} alt={gig.seller.name} />
                        <AvatarFallback>{gig.seller.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-white">{gig.seller.name}</span>
                      {gig.seller.isOnline && (
                        <Badge className="bg-emerald-600 text-white text-xs">Online</Badge>
                      )}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-400">{displayRating.toFixed(1)}</span>
                      <span>({gig.reviewCount})</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{gig.views} views</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`border-zinc-700 ${isFavorited ? 'text-red-500' : 'text-zinc-400'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {gig.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-zinc-700 text-zinc-300">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Tabbed Content */}
              <Tabs defaultValue="description" className="space-y-4">
                <TabsList className="bg-zinc-900 border-zinc-800">
                  <TabsTrigger value="description" className="data-[state=active]:bg-emerald-600">
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-emerald-600">
                    Reviews ({gig.reviewCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <Card className="border-zinc-800 bg-zinc-900">
                    <CardContent className="p-6">
                      <div className="prose prose-invert max-w-none">
                        <p className="text-zinc-300 leading-relaxed">
                          {gig.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  {gig.reviews.length > 0 ? (
                    gig.reviews.map((review) => (
                      <Card key={review.id} className="border-zinc-800 bg-zinc-900">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={review.reviewer.image || ''} alt={review.reviewer.name} />
                              <AvatarFallback>{review.reviewer.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-white">{review.reviewer.name}</span>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-zinc-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-zinc-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-zinc-300">{review.comment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="border-zinc-800 bg-zinc-900">
                      <CardContent className="p-6 text-center">
                        <p className="text-zinc-400">No reviews yet</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="border-zinc-800 bg-zinc-900 sticky top-8">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    ${displayPrice}
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {gig.deliveryTime} day delivery
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleOrderNow}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                >
                  Order Now
                </Button>
                <Button 
                  onClick={handleContactSeller}
                  variant="outline" 
                  className="w-full border-zinc-700 text-zinc-300"
                  size="lg"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-lg">About the Seller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={gig.seller.image || ''} alt={gig.seller.name} />
                    <AvatarFallback>{gig.seller.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-white">{gig.seller.name}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-400">{gig.seller.rating.toFixed(1)}</span>
                      <span className="text-zinc-400">({gig.seller.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Response Time</span>
                    <span className="text-white">{gig.seller.responseTime || 'Within 1 hour'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Last Seen</span>
                    <span className={`${gig.seller.isOnline ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {gig.seller.isOnline ? 'Online now' : gig.seller.lastSeen || 'Recently'}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleContactSeller}
                  variant="outline" 
                  className="w-full border-zinc-700 text-zinc-300"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Me
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}