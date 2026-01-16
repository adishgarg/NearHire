import { useState } from 'react';
import { GigCard } from './GigCard';
import { Gig } from '../types';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { SlidersHorizontal } from 'lucide-react';
import { mockGigs } from '../data/mockData';
import { useRouter } from 'next/navigation';

interface SearchResultsProps {
  gigs?: Gig[];
  searchQuery?: string;
  query?: string;
  category?: string;
  onGigClick?: (gig: Gig) => void;
}

export function SearchResults({ gigs = mockGigs, searchQuery, query, category, onGigClick }: SearchResultsProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Use either searchQuery or query prop
  const effectiveQuery = searchQuery || query || '';
  
  const handleGigClick = (gig: Gig) => {
    if (onGigClick) {
      onGigClick(gig);
    } else {
      router.push(`/gigs/${gig.id}`);
    }
  };

  const levels = ['Top Rated', 'Level 2', 'Level 1', 'New Seller'];

  const filteredGigs = gigs.filter(gig => {
    const matchesPrice = gig.price >= priceRange[0] && gig.price <= priceRange[1];
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(gig.seller.level || 'New Seller');
    const matchesQuery = !effectiveQuery || gig.title.toLowerCase().includes(effectiveQuery.toLowerCase()) || gig.description.toLowerCase().includes(effectiveQuery.toLowerCase());
    const matchesCategory = !category || gig.category.toLowerCase() === category.toLowerCase();
    return matchesPrice && matchesLevel && matchesQuery && matchesCategory;
  });

  const sortedGigs = [...filteredGigs].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  return (
    <div className="min-h-screen bg-[#f5ecdf]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-gray-900 font-playfair text-3xl font-semibold">
            {effectiveQuery ? `Results for "${effectiveQuery}"` : (category ? `Results for "${category}"` : 'All Services')}
          </h1>
          <p className="text-gray-600">{sortedGigs.length} services available</p>
        </div>

        {/* Filters & Sort */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-900 hover:bg-gray-50 rounded-full"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px] bg-white border-gray-200 text-gray-900 rounded-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="recommended" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                Recommended
              </SelectItem>
              <SelectItem value="rating" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                Best Rating
              </SelectItem>
              <SelectItem value="reviews" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                Most Reviews
              </SelectItem>
              <SelectItem value="price-low" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                Price: Low to High
              </SelectItem>
              <SelectItem value="price-high" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                Price: High to Low
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="lg:col-span-1 space-y-6">
              {/* Price Range */}
              <Card className="border-gray-200 bg-white p-4 rounded-3xl">
                <h3 className="mb-4 text-gray-900 font-playfair font-semibold">Price Range</h3>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-4"
                />
                <div className="flex items-center justify-between text-sm text-gray-600 font-semibold">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </Card>

              {/* Seller Level */}
              <Card className="border-gray-200 bg-white p-4 rounded-3xl">
                <h3 className="mb-4 text-gray-900 font-playfair font-semibold">Seller Level</h3>
                <div className="space-y-3">
                  {levels.map((level) => (
                    <div key={level} className="flex items-center gap-2">
                      <Checkbox
                        id={level}
                        checked={selectedLevels.includes(level)}
                        onCheckedChange={() => toggleLevel(level)}
                        className="border-gray-300"
                      />
                      <label htmlFor={level} className="text-gray-700 cursor-pointer">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Delivery Time */}
              <Card className="border-gray-200 bg-white p-4 rounded-3xl">
                <h3 className="mb-4 text-gray-900 font-playfair font-semibold">Delivery Time</h3>
                <div className="space-y-3">
                  {['Express (24h)', 'Up to 3 days', 'Up to 7 days', 'Anytime'].map((time) => (
                    <div key={time} className="flex items-center gap-2">
                      <Checkbox id={time} className="border-gray-300" />
                      <label htmlFor={time} className="text-gray-700 cursor-pointer">
                        {time}
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Results Grid */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {sortedGigs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No services found matching your criteria</p>
                <Button
                  variant="outline"
                  className="mt-4 border-gray-300 text-gray-900 hover:bg-gray-50 rounded-full"
                  onClick={() => {
                    setPriceRange([0, 1000]);
                    setSelectedLevels([]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedGigs.map((gig) => {
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
                  return <GigCard key={gig.id} gig={gigWithSeller} onClick={() => handleGigClick(gigWithSeller)} />;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
