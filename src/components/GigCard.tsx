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
      className="group cursor-pointer overflow-hidden border-zinc-800 bg-zinc-900 transition-all hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-600/10"
      onClick={handleClick}
    >
      {/* Gig Image */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={gig.image}
          alt={gig.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 bg-black/50 backdrop-blur-sm hover:bg-black/70"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Heart className="h-4 w-4 text-white" />
        </Button>
      </div>

      {/* Gig Info */}
      <div className="p-4">
        {/* Seller Info */}
        <div className="mb-3 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={gig.seller.avatar || gig.seller.image || ''} alt={gig.seller.name || 'Seller'} />
            <AvatarFallback>{(gig.seller.name || 'S')[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-400">{gig.seller.username || gig.seller.name}</span>
          {gig.seller.verified && (
            <VerifiedIcon className="h-4 w-4 fill-emerald-600 text-emerald-600" />
          )}
          <Badge variant="outline" className="ml-auto border-emerald-600 text-emerald-400 text-xs">
            {gig.seller.level || 'New Seller'}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 text-white group-hover:text-emerald-400 transition-colors">
          {gig.title}
        </h3>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-amber-500">{gig.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">({gig.reviewCount})</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
          <div className="text-gray-400 text-sm">
            <span className="text-xs uppercase">Starting at</span>
            <p className="text-white text-lg">${gig.price}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
