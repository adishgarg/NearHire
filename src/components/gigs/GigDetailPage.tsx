'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Eye, Heart, Share2, ArrowLeft, MessageSquare, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ContactSellerButton } from '@/components/ContactSellerButton';

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
  city?: string | null;
  address?: string | null;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5ecdf] text-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-[#f5ecdf] text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Gig Not Found</h1>
          <Link href="/marketplace">
            <Button variant="outline" className="border-gray-300 hover:bg-white">
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
    <div className="min-h-screen bg-[#f5ecdf] text-gray-900">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/marketplace" className="hover:text-gray-900">
              <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
            <span>/</span>
            <span className="capitalize">{gig.category.name}</span>
            <span>/</span>
            <span className="text-gray-900 truncate font-medium">{gig.title}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="border-gray-200 bg-white overflow-hidden shadow-sm">
              <CardContent className="p-0">
                {gig.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative h-96 bg-gray-100">
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
                                ? 'border-gray-900'
                                : 'border-gray-300 hover:border-gray-400'
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
                  <div className="h-96 bg-gray-100 flex items-center justify-center">
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{gig.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={gig.seller.image || ''} alt={gig.seller.name} />
                        <AvatarFallback>{gig.seller.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-gray-900 font-medium">{gig.seller.name}</span>
                      {gig.seller.isOnline && (
                        <Badge className="bg-green-600 text-white text-xs">Online</Badge>
                      )}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">{displayRating.toFixed(1)}</span>
                      <span>({gig.reviewCount})</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{gig.views} views</span>
                    </div>
                    {gig.city && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{gig.city}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`border-gray-300 hover:bg-white ${isFavorited ? 'text-red-500' : 'text-gray-600'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-white">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {gig.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-gray-300 text-gray-700 bg-white">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Tabbed Content */}
              <Tabs defaultValue="description" className="space-y-4">
                <TabsList className="bg-white border border-gray-200">
                  <TabsTrigger value="description" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                    Reviews ({gig.reviewCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <Card className="border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {gig.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  {gig.reviews.length > 0 ? (
                    gig.reviews.map((review) => (
                      <Card key={review.id} className="border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={review.reviewer.image || ''} alt={review.reviewer.name} />
                              <AvatarFallback>{review.reviewer.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">{review.reviewer.name}</span>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-500 text-yellow-500'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="border-gray-200 bg-white shadow-sm">
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">No reviews yet</p>
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
            <Card className="border-gray-200 bg-white shadow-sm sticky top-8">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    ${displayPrice}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {gig.deliveryTime} day delivery
                  </div>
                  {gig.city && (
                    <div className="text-sm text-gray-600 mt-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {gig.city}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleOrderNow}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  size="lg"
                >
                  Order Now
                </Button>
                <ContactSellerButton
                  sellerId={gig.seller.id}
                  sellerName={gig.seller.name}
                  gigId={gig.id}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-900 hover:bg-gray-50"
                />
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">About the Seller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={gig.seller.image || ''} alt={gig.seller.name} />
                    <AvatarFallback>{gig.seller.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900">{gig.seller.name}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">{gig.seller.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({gig.seller.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-200" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="text-gray-900 font-medium">{gig.seller.responseTime || 'Within 1 hour'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Seen</span>
                    <span className={`font-medium ${gig.seller.isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                      {gig.seller.isOnline ? 'Online now' : gig.seller.lastSeen || 'Recently'}
                    </span>
                  </div>
                </div>

                <ContactSellerButton
                  sellerId={gig.seller.id}
                  sellerName={gig.seller.name}
                  gigId={gig.id}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-900 hover:bg-gray-50"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}