'use client';

import { Category } from '../types';
import * as Icons from 'lucide-react';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useRouter } from 'next/navigation';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/search?category=${encodeURIComponent(category.name)}`);
    }
  };
  const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-zinc-800 bg-zinc-900 transition-all hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-600/20"
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          {IconComponent && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
              <IconComponent className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-white">{category.name}</h3>
            <p className="text-sm text-gray-400">{category.gigCount.toLocaleString()} services</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
