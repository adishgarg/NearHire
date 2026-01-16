'use client';

import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const categories = [
  { id: 'graphics-design', name: 'Graphics & Design' },
  { id: 'digital-marketing', name: 'Digital Marketing' },
  { id: 'writing-translation', name: 'Writing & Translation' },
  { id: 'video-animation', name: 'Video & Animation' },
  { id: 'music-audio', name: 'Music & Audio' },
  { id: 'programming-tech', name: 'Programming & Tech' },
  { id: 'business', name: 'Business' },
  { id: 'lifestyle', name: 'Lifestyle' },
];

export function CreateGigPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [images, setImages] = useState<Array<{url: string; publicId: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{display_name: string; lat: string; lon: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAddTag = () => {
    if (currentTag.trim() && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get city name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.address) {
            const locationCity = data.address.city || data.address.town || data.address.village || '';
            const locationAddress = data.display_name || '';
            setCity(locationCity);
            setAddress(locationAddress);
            toast.success('Location detected!');
          }
        } catch (error) {
          console.error('Error getting location details:', error);
          toast.error('Failed to get location details');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get your location. Please enter it manually.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleCitySearch = useCallback((searchText: string) => {
    setCity(searchText);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchText.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Show loading immediately
    setIsSearchingLocation(true);
    
    // Debounce the API call - wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Prioritize India for faster/better results - you can change this to your region
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=in&limit=5&addressdetails=1`
        );
        const data = await response.json();
        setLocationSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (error) {
        console.error('Error searching location:', error);
        setLocationSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 300); // Wait 300ms after user stops typing
  }, []);

  const handleSelectLocation = (suggestion: {display_name: string; lat: string; lon: string; address?: any}) => {
    // Extract city from address object, fallback to first part of display_name
    const locationCity = suggestion.address?.city || 
                        suggestion.address?.town || 
                        suggestion.address?.village || 
                        suggestion.address?.municipality || 
                        suggestion.address?.county ||
                        suggestion.display_name.split(',')[0].trim();
    
    setCity(locationCity);
    setAddress(suggestion.display_name);
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a gig title');
      return;
    }
    if (title.length > 80) {
      toast.error('Title must be 80 characters or less');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (description.length > 1200) {
      toast.error('Description must be 1200 characters or less');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    if (!price || Number(price) < 5) {
      toast.error('Minimum price is ₹5');
      return;
    }
    if (!deliveryTime) {
      toast.error('Please select a delivery time');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating your gig...');

    try {
      // Get coordinates from address if city is provided
      let latitude = null;
      let longitude = null;
      
      if (city) {
        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
          );
          const geocodeData = await geocodeResponse.json();
          if (geocodeData && geocodeData[0]) {
            latitude = parseFloat(geocodeData[0].lat);
            longitude = parseFloat(geocodeData[0].lon);
          }
        } catch (error) {
          console.error('Error geocoding location:', error);
        }
      }

      const gigData = {
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        basicPrice: Number(price),
        basicDescription: description.trim(),
        basicDeliveryTime: Number(deliveryTime),
        basicRevisions: 1,
        images: images.map(img => img.url),
        city: city || null,
        address: address || null,
        latitude,
        longitude,
      };

      const response = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gigData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Gig created successfully!', { id: toastId });
        router.push(`/gigs/${result.gig.id}`);
      } else {
        throw new Error(result.error || 'Failed to create gig');
      }
    } catch (error) {
      console.error('Error creating gig:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create gig. Please try again.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    // Minimal validation for draft
    if (!title.trim()) {
      toast.error('Please enter at least a title to save as draft');
      return;
    }

    setIsSavingDraft(true);
    const toastId = toast.loading('Saving draft...');

    try {
      const draftData = {
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
        tags,
        basicPrice: price ? Number(price) : 0,
        basicDescription: description.trim(),
        basicDeliveryTime: deliveryTime ? Number(deliveryTime) : 1,
        basicRevisions: 1,
        images: images.map(img => img.url),
        city: city || null,
        address: address || null,
      };

      const response = await fetch('/api/gigs/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Draft saved successfully!', { id: toastId });
        router.push('/dashboard/my-gigs?tab=drafts');
      } else {
        throw new Error(result.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save draft. Please try again.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6ddcf]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-serif font-semibold text-gray-900">Create a New Gig</h1>
          <p className="text-gray-600">Fill in the details to create your service listing</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-gray-200 bg-white p-6 rounded-3xl">
              <h2 className="mb-6 text-gray-900 font-serif text-xl font-semibold">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700">Gig Title *</Label>
                  <Input
                    id="title"
                    placeholder="I will do something I'm really good at"
                    className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">{title.length}/80 characters</p>
                </div>

                <div>
                  <Label htmlFor="category" className="text-gray-700">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-2 bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {categories.map((cat) => (
                        <SelectItem 
                          key={cat.id} 
                          value={cat.id}
                          className="text-gray-900 focus:bg-gray-50 focus:text-gray-900"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your service in detail..."
                    className="mt-2 min-h-[150px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">{description.length}/1200 characters</p>
                </div>

                <div>
                  <Label htmlFor="city" className="text-gray-700">City / Location</Label>
                  <div className="mt-2 flex gap-2 relative">
                    <div className="flex-1 relative">
                      <Input
                        id="city"
                        placeholder="Type to search location..."
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                        value={city}
                        onChange={(e) => handleCitySearch(e.target.value)}
                        onFocus={() => city.length >= 3 && setShowSuggestions(true)}
                      />
                      {isSearchingLocation && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                      )}
                      
                      {/* Location Suggestions Dropdown */}
                      {showSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                          {locationSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl transition-colors border-b border-gray-100 last:border-b-0"
                              onClick={() => handleSelectLocation(suggestion)}
                            >
                              <div className="text-sm text-gray-900">{suggestion.display_name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-white whitespace-nowrap"
                      onClick={handleGetLocation}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Detect Location'}
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Type at least 3 characters to search or use detect location</p>
                </div>

                <div>
                  <Label htmlFor="address" className="text-gray-700">Full Address (Optional)</Label>
                  <Input
                    id="address"
                    placeholder="Street address or area"
                    className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tags" className="text-gray-700">Search Tags</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Add up to 5 tags"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-white"
                      onClick={handleAddTag}
                      disabled={tags.length >= 5}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-gray-300 text-gray-700 rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-gray-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Pricing & Delivery */}
            <Card className="border-gray-200 bg-white p-6 rounded-3xl">
              <h2 className="mb-6 text-gray-900 font-serif text-xl font-semibold">Pricing & Delivery</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="price" className="text-gray-700">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="50"
                    className="mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="delivery" className="text-gray-700">Delivery Time *</Label>
                  <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                    <SelectTrigger className="mt-2 bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select delivery time" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="1" className="text-gray-900 focus:bg-gray-50 focus:text-gray-900">
                        1 day delivery
                      </SelectItem>
                      <SelectItem value="3" className="text-gray-900 focus:bg-gray-50 focus:text-gray-900">
                        3 days delivery
                      </SelectItem>
                      <SelectItem value="7" className="text-gray-900 focus:bg-gray-50 focus:text-gray-900">
                        7 days delivery
                      </SelectItem>
                      <SelectItem value="14" className="text-gray-900 focus:bg-gray-50 focus:text-gray-900">
                        14 days delivery
                      </SelectItem>
                      <SelectItem value="30" className="text-gray-900 focus:bg-gray-50 focus:text-gray-900">
                        30 days delivery
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Gallery */}
            <Card className="border-gray-200 bg-white p-6 rounded-3xl">
              <h2 className="mb-6 text-gray-900 font-serif text-xl font-semibold">Gallery</h2>
              
              <FileUpload
                onUpload={setImages}
                maxFiles={5}
                folder="gigs"
                existingFiles={images}
              />
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card className="border-gray-200 bg-white p-6 rounded-3xl">
                <h3 className="mb-4 text-gray-900 font-serif text-lg font-semibold">Preview</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-2xl h-48 flex items-center justify-center overflow-hidden">
                    {images.length > 0 ? (
                      <img 
                        src={images[0].url} 
                        alt="Gig preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-gray-500">Gig image preview</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-gray-900 font-medium line-clamp-2">
                      {title || 'Your gig title will appear here'}
                    </h4>
                  </div>

                  {category && (
                    <Badge variant="outline" className="border-gray-300 text-gray-700 rounded-full">
                      {categories.find(cat => cat.id === category)?.name || category}
                    </Badge>
                  )}

                  <p className="text-gray-600 text-sm line-clamp-3">
                    {description || 'Your description will appear here...'}
                  </p>

                  {price && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-600 text-sm mb-1 uppercase tracking-wider">Starting at</p>
                      <p className="text-gray-900 text-2xl font-serif">${price}</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full"
                  onClick={handleSubmit}
                  disabled={!title || !category || !description || !price || !deliveryTime || isSubmitting || isSavingDraft}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Gig'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
                  onClick={handleSaveDraft}
                  disabled={!title || isSubmitting || isSavingDraft}
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Draft...
                    </>
                  ) : (
                    'Save as Draft'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}