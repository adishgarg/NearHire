'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { GigCard } from '@/components/gigs/GigCard';
import { Loader2, Search, Filter, SortAsc } from 'lucide-react';

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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'graphics-design', label: 'Graphics & Design' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'writing-translation', label: 'Writing & Translation' },
  { value: 'video-animation', label: 'Video & Animation' },
  { value: 'music-audio', label: 'Music & Audio' },
  { value: 'programming-tech', label: 'Programming & Tech' },
  { value: 'business', label: 'Business' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export function MarketplacePage() {
  const searchParams = useSearchParams();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || 'all');
  const [priceRange, setPriceRange] = useState([5, 1000]);
  const [maxDeliveryTime, setMaxDeliveryTime] = useState(30);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        deliveryTime: maxDeliveryTime.toString(),
      });

      const response = await fetch(`/api/gigs?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Marketplace API response:', data);
        console.log('Gigs received:', data.gigs?.length || 0);
        console.log('First gig seller check:', data.gigs?.[0]?.seller ? 'HAS SELLER' : 'NO SELLER');
        setGigs(data.gigs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchQuery, selectedCategory, priceRange, maxDeliveryTime]);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchGigs();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePriceFilter = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchGigs();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([5, 1000]);
    setMaxDeliveryTime(30);
    setSortBy('newest');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchGigs();
  };

  const changePage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
          <p className="text-zinc-400">
            Discover services from talented freelancers around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <Input
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700">
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Quick Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.slice(0, 8).map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedCategory === category.value 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
                onClick={() => handleCategoryChange(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value} className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Delivery Time: {maxDeliveryTime} days
                    </label>
                    <Slider
                      value={[maxDeliveryTime]}
                      onValueChange={(value) => setMaxDeliveryTime(value[0])}
                      max={30}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3">
                  <Button onClick={handlePriceFilter} className="bg-emerald-600 hover:bg-emerald-700">
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={clearFilters} className="border-zinc-700">
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-400">
            {loading ? 'Searching...' : `${pagination.totalItems} services found`}
          </p>
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-zinc-400" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-zinc-900 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Gig Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : gigs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gigs.map((gig) => {
              try {
                // Log each gig for debugging
                console.log(`Gig ${gig.id} seller check:`, gig.seller ? 'HAS SELLER' : 'NO SELLER', gig.seller);
                
                // If seller data is missing, create a mock seller to prevent crashes
                if (!gig.seller) {
                  console.warn('Gig missing seller data, creating mock seller:', gig.id);
                  const gigWithMockSeller = {
                    ...gig,
                    seller: {
                      id: 'unknown',
                      name: 'Unknown Seller',
                      image: null,
                      rating: 0,
                      reviewCount: 0
                    }
                  };
                  return <GigCard key={gig.id} gig={gigWithMockSeller} />;
                }
                return <GigCard key={gig.id} gig={gig} />;
              } catch (error) {
                console.error('Error rendering gig:', error, gig);
                return (
                  <Card key={gig.id} className="border-red-800 bg-red-900/20 p-4">
                    <p className="text-red-400">Error loading gig</p>
                  </Card>
                );
              }
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className="text-zinc-400 mb-4">
              Try adjusting your search criteria or browse different categories
            </p>
            <Button onClick={clearFilters} variant="outline" className="border-zinc-700">
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={pagination.currentPage <= 1}
                onClick={() => changePage(pagination.currentPage - 1)}
                className="border-zinc-700"
              >
                Previous
              </Button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? "default" : "outline"}
                  onClick={() => changePage(page)}
                  className={
                    page === pagination.currentPage
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-zinc-700"
                  }
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => changePage(pagination.currentPage + 1)}
                className="border-zinc-700"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}