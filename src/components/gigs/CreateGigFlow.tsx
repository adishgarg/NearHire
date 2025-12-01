'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/components/FileUpload';
import { getTagSuggestions } from '@/data/tags';
import { ArrowLeft, ArrowRight, Save, Eye } from 'lucide-react';

interface GigData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  
  // Basic Package
  basicPrice: number;
  basicDescription: string;
  basicDeliveryTime: number;
  basicRevisions: number;
  
  // Standard Package (optional)
  standardPrice?: number;
  standardDescription?: string;
  standardDeliveryTime?: number;
  standardRevisions?: number;
  
  // Premium Package (optional)
  premiumPrice?: number;
  premiumDescription?: string;
  premiumDeliveryTime?: number;
  premiumRevisions?: number;
  
  images: Array<{url: string; publicId: string}>;
  requirements?: string[];
}

const categories = [
  { value: 'graphics-design', label: 'Graphics & Design' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'writing-translation', label: 'Writing & Translation' },
  { value: 'video-animation', label: 'Video & Animation' },
  { value: 'music-audio', label: 'Music & Audio' },
  { value: 'programming-tech', label: 'Programming & Tech' },
  { value: 'business', label: 'Business' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

const deliveryTimes = [
  { value: 1, label: '1 Day' },
  { value: 3, label: '3 Days' },
  { value: 7, label: '1 Week' },
  { value: 14, label: '2 Weeks' },
  { value: 30, label: '1 Month' },
];

export function CreateGigFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [gigData, setGigData] = useState<GigData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [],
    basicPrice: 5,
    basicDescription: '',
    basicDeliveryTime: 3,
    basicRevisions: 1,
    images: [],
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateGigData = (field: keyof GigData, value: any) => {
    setGigData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !gigData.tags.includes(cleanTag) && gigData.tags.length < 5) {
      updateGigData('tags', [...gigData.tags, cleanTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateGigData('tags', gigData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputChange = (value: string) => {
    setTagInput(value);
    setShowTagSuggestions(value.length > 0);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
        setTagInput('');
        setShowTagSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
    }
  };

  const selectSuggestedTag = (tag: string) => {
    addTag(tag);
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const tagSuggestions = getTagSuggestions(tagInput, gigData.category);

  const submitGig = async () => {
    setIsSubmitting(true);
    try {
      // Transform images array to just URLs for the database
      const gigDataForSubmission = {
        ...gigData,
        images: gigData.images.map(img => img.url)
      };

      const response = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gigDataForSubmission),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Gig creation result:', result);
        console.log('Navigating to gig ID:', result.gig.id);
        router.push(`/gigs/${result.gig.id}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create gig');
      }
    } catch (error) {
      console.error('Error creating gig:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create gig. Please try again.';
      alert(`Failed to create gig: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Gig Title *</Label>
              <Input
                id="title"
                placeholder="I will create amazing designs for your business"
                value={gigData.title}
                onChange={(e) => updateGigData('title', e.target.value)}
                maxLength={80}
                className="mt-2 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400"
              />
              <p className="text-sm text-zinc-500 mt-1">
                {gigData.title.length}/80 characters
              </p>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={gigData.category} onValueChange={(value) => updateGigData('category', value)}>
                <SelectTrigger className="mt-2 bg-zinc-900 border-zinc-700 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Gig Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your service in detail..."
                value={gigData.description}
                onChange={(e) => updateGigData('description', e.target.value)}
                rows={6}
                maxLength={1200}
                className="mt-2 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400"
              />
              <p className="text-sm text-zinc-500 mt-1">
                {gigData.description.length}/1200 characters
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Search Tags (up to 5)</Label>
              <div className="relative mt-2">
                <Input
                  placeholder="Type to search tags..."
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400"
                  value={tagInput}
                  onChange={(e) => handleTagInputChange(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicking on them
                    setTimeout(() => setShowTagSuggestions(false), 200);
                  }}
                />
                
                {/* Tag Suggestions */}
                {showTagSuggestions && tagSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-zinc-800 border border-zinc-700 rounded-md mt-1 max-h-48 overflow-y-auto">
                    {tagSuggestions
                      .filter(tag => !gigData.tags.includes(tag))
                      .map((tag, index) => (
                        <button
                          key={tag}
                          className="w-full text-left px-3 py-2 hover:bg-zinc-700 text-white text-sm border-b border-zinc-700 last:border-b-0"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur
                            selectSuggestedTag(tag);
                          }}
                        >
                          {tag}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
              
              {/* Current Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {gigData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer bg-zinc-700 hover:bg-zinc-600 text-white"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              
              {/* Popular Tags for Category */}
              {gigData.category && tagInput === '' && gigData.tags.length < 5 && (
                <div className="mt-3">
                  <p className="text-sm text-zinc-400 mb-2">Popular tags for {categories.find(cat => cat.value === gigData.category)?.label}:</p>
                  <div className="flex flex-wrap gap-2">
                    {getTagSuggestions('', gigData.category)
                      .filter(tag => !gigData.tags.includes(tag))
                      .slice(0, 8)
                      .map((tag) => (
                        <button
                          key={tag}
                          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded border border-zinc-600"
                          onClick={() => addTag(tag)}
                        >
                          + {tag}
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Upload Gig Images</Label>
              <div className="mt-2">
                <FileUpload
                  onUpload={(files) => updateGigData('images', files)}
                  maxFiles={5}
                  folder="gigs"
                  existingFiles={gigData.images}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Basic Package *</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basicPrice">Price (USD) *</Label>
                <Input
                  id="basicPrice"
                  type="number"
                  min="5"
                  value={gigData.basicPrice}
                  onChange={(e) => updateGigData('basicPrice', Number(e.target.value))}
                  className="mt-2 bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="basicDeliveryTime">Delivery Time *</Label>
                <Select 
                  value={gigData.basicDeliveryTime.toString()} 
                  onValueChange={(value) => updateGigData('basicDeliveryTime', Number(value))}
                >
                  <SelectTrigger className="mt-2 bg-zinc-900 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {deliveryTimes.map((time) => (
                      <SelectItem key={time.value} value={time.value.toString()} className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="basicDescription">Package Description *</Label>
              <Textarea
                id="basicDescription"
                placeholder="Describe what's included in your basic package"
                value={gigData.basicDescription}
                onChange={(e) => updateGigData('basicDescription', e.target.value)}
                rows={3}
                className="mt-2 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400"
              />
            </div>

            <div>
              <Label htmlFor="basicRevisions">Number of Revisions</Label>
              <Input
                id="basicRevisions"
                type="number"
                min="0"
                max="10"
                value={gigData.basicRevisions}
                onChange={(e) => updateGigData('basicRevisions', Number(e.target.value))}
                className="mt-2 bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Additional Packages (Optional)</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Standard Package */}
              <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                  <CardTitle className="text-base text-white">Standard Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Price (USD)"
                    value={gigData.standardPrice || ''}
                    onChange={(e) => updateGigData('standardPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                  />
                  <Textarea
                    placeholder="Package description"
                    value={gigData.standardDescription || ''}
                    onChange={(e) => updateGigData('standardDescription', e.target.value)}
                    rows={2}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                  />
                </CardContent>
              </Card>

              {/* Premium Package */}
              <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                  <CardTitle className="text-base text-white">Premium Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Price (USD)"
                    value={gigData.premiumPrice || ''}
                    onChange={(e) => updateGigData('premiumPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                  />
                  <Textarea
                    placeholder="Package description"
                    value={gigData.premiumDescription || ''}
                    onChange={(e) => updateGigData('premiumDescription', e.target.value)}
                    rows={2}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review Your Gig</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{gigData.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-600">{gigData.description}</p>
                <div className="flex gap-2">
                  {gigData.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span>
                    <p className="text-zinc-600 capitalize">{gigData.category.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Starting Price:</span>
                    <p className="text-zinc-600">${gigData.basicPrice}</p>
                  </div>
                  <div>
                    <span className="font-medium">Delivery:</span>
                    <p className="text-zinc-600">{gigData.basicDeliveryTime} days</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Images:</span>
                  <p className="text-zinc-600">{gigData.images.length} uploaded</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return gigData.title && gigData.category && gigData.description;
      case 2:
        return gigData.tags.length > 0 && gigData.images.length > 0;
      case 3:
        return gigData.basicPrice >= 5 && gigData.basicDescription;
      case 4:
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Create a New Gig</h1>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Content */}
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="p-8">
              {renderStep()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  onClick={submitGig}
                  disabled={!isStepValid() || isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Gig'}
                  <Eye className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}