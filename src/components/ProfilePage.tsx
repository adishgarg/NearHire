'use client';

import { User, Gig } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GigCard } from './GigCard';
import { Star, MapPin, Calendar, Award, VerifiedIcon, MessageSquare, DollarSign, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfilePageProps {
  user: User & {
    email?: string;
    website?: string;
    phone?: string;
    totalEarnings?: number;
    activeOrders?: number;
    responseTime?: string;
    lastSeen?: string;
    isOnline?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  gigs?: Gig[];
  reviews?: Array<{
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: {
      name: string;
      image: string;
    };
  }>;
  onGigClick?: (gig: Gig) => void;
  isOwnProfile?: boolean;
}

export function ProfilePage({ user, gigs = [], reviews = [], onGigClick, isOwnProfile = false }: ProfilePageProps) {
  const userGigs = gigs || [];
  
  // Format member since date
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }) : 'Recently joined';
  
  // Calculate average rating from reviews if available
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : user.rating || 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="border-zinc-800 bg-zinc-900 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 mb-4 border-4 border-emerald-600">
                <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                <AvatarFallback className="text-3xl">{(user.name || 'U')[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-white">{user.name}</h1>
                    {user.verified && (
                      <VerifiedIcon className="h-6 w-6 fill-emerald-600 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-gray-400 mb-3">@{user.username || user.email?.split('@')[0] || 'user'}</p>
                  <Badge className="bg-emerald-600/10 text-emerald-400 border-emerald-600">
                    {user.level || 'New Seller'}
                  </Badge>
                </div>
                {!isOwnProfile && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                )}
              </div>

              <p className="text-gray-300 mb-6">
                {user.bio || `Professional ${userGigs[0]?.category || 'freelancer'} with a passion for delivering high-quality work.`}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="text-gray-400 text-sm">Rating</span>
                  </div>
                  <p className="text-white text-xl">{avgRating.toFixed(1)}</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-emerald-600" />
                    <span className="text-gray-400 text-sm">Reviews</span>
                  </div>
                  <p className="text-white text-xl">{user.reviewCount || reviews.length}</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-400 text-sm">From</span>
                  </div>
                  <p className="text-white">{user.location || 'Not specified'}</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-400 text-sm">Member since</span>
                  </div>
                  <p className="text-white">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="gigs" className="mb-8">
          <TabsList className="bg-zinc-900 border-b border-zinc-800">
            <TabsTrigger value="gigs" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              Active Gigs ({userGigs.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gigs" className="mt-6">
            {userGigs.length === 0 ? (
              <Card className="border-zinc-800 bg-zinc-900 p-12 text-center">
                <p className="text-gray-400">No active gigs yet</p>
                {isOwnProfile && (
                  <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                    Create Your First Gig
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {userGigs.map((gig) => {
                  // If seller data is missing, create mock seller
                  const gigWithSeller = gig.seller ? gig : {
                    ...gig,
                    seller: {
                      id: 'unknown',
                      name: 'Unknown Seller',
                      image: null,
                      rating: 0,
                      reviewCount: 0,
                      verified: false,
                      level: 'New Seller'
                    }
                  };
                  return <GigCard key={gig.id} gig={gigWithSeller} onClick={() => onGigClick?.(gigWithSeller)} />;
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-900 p-12 text-center">
                  <p className="text-gray-400">No reviews yet</p>
                  {!isOwnProfile && (
                    <p className="text-gray-500 mt-2">Be the first to leave a review!</p>
                  )}
                </Card>
              ) : (
                reviews.map((review, index) => (
                  <Card key={index} className="border-zinc-800 bg-zinc-900 p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.reviewer.image || ''} alt={review.reviewer.name} />
                        <AvatarFallback>{review.reviewer.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white">{review.reviewer.name}</p>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, j) => (
                            <Star 
                              key={j} 
                              className={`h-4 w-4 ${
                                j < review.rating 
                                  ? 'fill-amber-500 text-amber-500' 
                                  : 'text-gray-600'
                              }`} 
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-400">({review.rating}/5)</span>
                        </div>
                        <p className="text-gray-300">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-4 text-white">About Me</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {user.bio || `I'm a professional freelancer with ${user.reviewCount || reviews.length}+ completed projects and a ${avgRating.toFixed(1)} star rating.
I specialize in delivering high-quality work that exceeds client expectations.`}
              </p>
              
              {user.website && (
                <div className="mb-6">
                  <h3 className="mb-2 text-white">Website</h3>
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {user.website}
                  </a>
                </div>
              )}
              
              {user.phone && isOwnProfile && (
                <div className="mb-6">
                  <h3 className="mb-2 text-white">Phone</h3>
                  <p className="text-gray-300">{user.phone}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.totalEarnings && (
                  <div>
                    <h3 className="mb-2 text-white">Total Earnings</h3>
                    <p className="text-emerald-400 text-xl font-semibold">${user.totalEarnings}</p>
                  </div>
                )}
                
                {user.responseTime && (
                  <div>
                    <h3 className="mb-2 text-white">Avg Response Time</h3>
                    <p className="text-gray-300">{user.responseTime}</p>
                  </div>
                )}
              </div>
              
              {user.lastSeen && (
                <div className="mt-6">
                  <h3 className="mb-2 text-white">Last Active</h3>
                  <p className="text-gray-300">
                    {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
