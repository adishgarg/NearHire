'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Heart, Clock, Eye } from 'lucide-react';
import { useState } from 'react';

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
  };
  averageRating?: number;
  startingPrice?: number;
}

interface GigCardProps {
  gig: Gig;
  variant?: 'default' | 'compact' | 'featured';
}

export function GigCard({ gig, variant = 'default' }: GigCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayPrice = gig.startingPrice || gig.price;
  const displayRating = gig.averageRating || gig.rating;
  const hasReviews = gig.reviewCount > 0;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  if (variant === 'compact') {
    return (
      <Link href={`/gigs/${gig.id}`} className="group">
        <Card className="border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {/* Image */}
              <div className="relative w-16 h-16 flex-shrink-0">
                {gig.images[0] && !imageError ? (
                  <Image
                    src={gig.images[0]}
                    alt={gig.title}
                    fill
                    className="object-cover rounded-lg"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📷</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
                  {gig.title}
                </h3>
                <p className="text-zinc-400 text-xs mt-1 line-clamp-2">
                  {gig.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    {hasReviews && (
                      <>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-400">{displayRating.toFixed(1)}</span>
                        <span className="text-zinc-500">({gig.reviewCount})</span>
                      </>
                    )}
                  </div>
                  <span className="text-emerald-400 font-medium text-sm">
                    ${displayPrice}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/gigs/${gig.id}`} className="group">
      <Card className="border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-all duration-200 overflow-hidden">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {gig.images[0] && !imageError ? (
            <Image
              src={gig.images[0]}
              alt={gig.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <span className="text-6xl opacity-50">📷</span>
            </div>
          )}
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-black/50"
            onClick={handleFavorite}
          >
            <Heart 
              className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} 
            />
          </Button>

          {/* Category Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-black/50 text-white border-none"
          >
            {gig.category.name}
          </Badge>

          {variant === 'featured' && (
            <Badge className="absolute bottom-2 left-2 bg-emerald-600 text-white">
              Featured
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Seller Info */}
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={gig.seller.image || ''} alt={gig.seller.name || 'Seller'} />
              <AvatarFallback className="text-xs">
                {gig.seller.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-zinc-400">{gig.seller.name}</span>
            {gig.seller.rating > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-zinc-400">
                  {gig.seller.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-white line-clamp-2 group-hover:text-emerald-400 transition-colors leading-tight">
            {gig.title}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {gig.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs border-zinc-700 text-zinc-400"
              >
                {tag}
              </Badge>
            ))}
            {gig.tags.length > 3 && (
              <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                +{gig.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            {hasReviews && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400">{displayRating.toFixed(1)}</span>
                <span>({gig.reviewCount})</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{gig.views}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{gig.deliveryTime} day{gig.deliveryTime !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <span className="text-sm text-zinc-400">Starting at</span>
            <span className="text-lg font-semibold text-emerald-400">
              ${displayPrice}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}