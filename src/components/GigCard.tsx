'use client';

import { Heart, Star, VerifiedIcon } from 'lucide-react';
import { Gig } from '../types';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useRouter } from 'next/navigation';

interface GigCardProps {
  gig: Gig;
  onClick?: () => void;
}

export function GigCard({ gig, onClick }: GigCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/gigs/${gig.id}`);
    }
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-gray-200 bg-white transition-all hover:shadow-xl hover:shadow-gray-900/10 rounded-3xl"
      onClick={handleClick}
    >
      {/* Gig Image */}
      <div className="relative h-48 overflow-hidden rounded-t-3xl">
        <ImageWithFallback
          src={gig.image || ((gig as any).images && (gig as any).images[0]) || ''}
          alt={gig.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Heart className="h-4 w-4 text-gray-900" />
        </Button>
      </div>

      {/* Gig Info */}
      <div className="p-5">
        {/* Seller Info */}
        <div className="mb-3 flex items-center gap-2">
          <Avatar className="h-7 w-7 border border-gray-200">
            <AvatarImage src={gig.seller?.avatar || gig.seller?.image || ''} alt={gig.seller?.name || 'Seller'} />
            <AvatarFallback className="bg-gray-100 text-gray-900 text-xs">{(gig.seller?.name || 'S')[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{gig.seller?.username || gig.seller?.name || 'Unknown Seller'}</span>
          {gig.seller?.verified && (
            <VerifiedIcon className="h-4 w-4 fill-gray-900 text-gray-900" />
          )}
          <Badge variant="outline" className="ml-auto border-gray-300 text-gray-700 text-xs rounded-full">
            {gig.seller?.level || 'New Seller'}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 text-gray-900 font-medium group-hover:text-gray-700 transition-colors">
          {gig.title}
        </h3>

        {/* Rating */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-gray-900 font-medium">{gig.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">({gig.reviewCount})</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-gray-600 text-sm">
            <span className="text-xs uppercase tracking-wider">Starting at</span>
            <p className="text-gray-900 text-xl font-serif">₹{gig.price}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
