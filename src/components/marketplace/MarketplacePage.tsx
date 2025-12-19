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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || 'all');
  const [priceRange, setPriceRange] = useState([5, 100000]);
  const [maxDeliveryTime, setMaxDeliveryTime] = useState(30);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const fetchGigs = useCallback(async () => {
    console.log('🚀 fetchGigs called with:', { currentPage, searchQuery, selectedCategory });
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
      });

      // Only add filters if they're not default values
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      // Only add price filters if they're not the default range
      if (priceRange[0] !== 5 || priceRange[1] !== 100000) {
        params.append('minPrice', priceRange[0].toString());
        params.append('maxPrice', priceRange[1].toString());
      }
      
      // Only add delivery time filter if it's not the default
      if (maxDeliveryTime !== 30) {
        params.append('deliveryTime', maxDeliveryTime.toString());
      }

      const url = `/api/gigs?${params}`;
      console.log('🌐 Marketplace fetching URL:', url);
      console.log('📊 Current page:', currentPage);
      console.log('🔍 Search query:', searchQuery);
      console.log('📂 Selected category:', selectedCategory);

      const response = await fetch(url);
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Marketplace API response:', data);
        console.log('📦 Gigs received:', data.gigs?.length || 0);
        console.log('📊 Pagination data:', data.pagination);
        
        if (data.gigs?.[0]) {
          console.log('👤 First gig seller check:', data.gigs[0].seller ? 'HAS SELLER' : 'NO SELLER');
          console.log('🏷️ First gig title:', data.gigs[0].title);
        }
        
        setGigs(data.gigs || []);
        setPagination(data.pagination);
      } else {
        console.error('❌ API Error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error body:', errorText);
      }
    } catch (error) {
      console.error('💥 Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, priceRange, maxDeliveryTime]);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchGigs();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePriceFilter = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([5, 100000]);
    setMaxDeliveryTime(30);
    setSortBy('newest');
    setCurrentPage(1);
  };

  const changePage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#e6ddcf] text-gray-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-semibold mb-4 text-gray-900">Marketplace</h1>
          <p className="text-gray-600">
            Discover services from talented freelancers around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-white border-gray-200 text-gray-900 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <Button onClick={handleSearch} className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8">
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-200 text-gray-700 hover:bg-white hover:border-gray-900 rounded-full px-6"
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
                className={`cursor-pointer transition-colors rounded-full ${
                  selectedCategory === category.value 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'border-gray-300 text-gray-700 hover:bg-white'
                }`}
                onClick={() => handleCategoryChange(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="border-gray-200 bg-white rounded-3xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-serif text-gray-900">Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-white border-gray-200 text-gray-900 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 rounded-2xl">
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value} className="text-gray-900 hover:bg-[#f5ecdf] focus:bg-[#f5ecdf] rounded-xl">
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-white border-gray-200 text-gray-900 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 rounded-2xl">
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-gray-900 hover:bg-[#f5ecdf] focus:bg-[#f5ecdf] rounded-xl">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Max Delivery Time: <span className="font-semibold text-gray-900">{maxDeliveryTime} days</span>
                    </label>
                    <Slider
                      value={[maxDeliveryTime]}
                      onValueChange={(value) => setMaxDeliveryTime(value[0])}
                      max={30}
                      min={1}
                      step={1}
                      className="mt-4"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Price Range: <span className="font-semibold text-gray-900">${priceRange[0]} - ${priceRange[1]}</span>
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000}
                    min={5}
                    step={100}
                    className="mt-4"
                  />
                </div>

                {/* Filter Actions */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={handlePriceFilter} className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8">
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={clearFilters} className="border-gray-200 text-gray-700 hover:bg-[#f5ecdf] hover:border-gray-900 rounded-full px-8">
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 font-medium">
            {loading ? 'Searching...' : `${pagination.totalItems} services found`}
          </p>
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-600" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-white border-gray-200 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 rounded-2xl">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-gray-900 hover:bg-[#f5ecdf] focus:bg-[#f5ecdf] rounded-xl">
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
            <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
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
            <h3 className="text-xl font-serif font-semibold mb-2 text-gray-900">No services found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse different categories
            </p>
            <Button onClick={clearFilters} variant="outline" className="border-gray-300 text-gray-700 hover:bg-white rounded-full px-6">
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
                disabled={currentPage <= 1}
                onClick={() => changePage(currentPage - 1)}
                className="border-gray-300 text-gray-700 hover:bg-white rounded-full"
              >
                Previous
              </Button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => changePage(page)}
                  className={
                    page === currentPage
                      ? "bg-gray-900 hover:bg-gray-800 text-white rounded-full"
                      : "border-gray-300 text-gray-700 hover:bg-white rounded-full"
                  }
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => changePage(currentPage + 1)}
                className="border-gray-300 text-gray-700 hover:bg-white rounded-full"
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