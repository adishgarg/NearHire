import { Suspense } from 'react';
import { MarketplacePage } from '@/components/marketplace/MarketplacePage';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function MarketplaceSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5ecdf]">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4 bg-gray-300" />
          <Skeleton className="h-4 w-96 bg-gray-300" />
        </div>
        
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="flex-1 h-10 bg-gray-300" />
            <Skeleton className="h-10 w-20 bg-gray-300" />
            <Skeleton className="h-10 w-20 bg-gray-300" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 bg-gray-300" />
            ))}
          </div>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-gray-200 bg-white border-0 shadow-sm">
              <div className="relative h-48">
                <Skeleton className="h-full w-full bg-gray-300" />
              </div>
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-gray-300" />
                <Skeleton className="h-6 w-full bg-gray-300" />
                <Skeleton className="h-4 w-1/2 bg-gray-300" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <MarketplacePage />
    </Suspense>
  );
}