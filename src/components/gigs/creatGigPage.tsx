'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  const handleAddTag = () => {
    if (currentTag.trim() && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const gigData = {
        title,
        description,
        category,
        tags,
        basicPrice: Number(price),
        basicDescription: description,
        basicDeliveryTime: Number(deliveryTime),
        basicRevisions: 1,
        images: images.map(img => img.url)
      };

      const response = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gigData),
      });

      if (response.ok) {
        const result = await response.json();
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

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Create a New Gig</h1>
          <p className="text-gray-400">Fill in the details to create your service listing</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <h2 className="mb-6 text-white">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Gig Title *</Label>
                  <Input
                    id="title"
                    placeholder="I will do something I'm really good at"
                    className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">{title.length}/80 characters</p>
                </div>

                <div>
                  <Label htmlFor="category" className="text-gray-300">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-2 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {categories.map((cat) => (
                        <SelectItem 
                          key={cat.id} 
                          value={cat.id}
                          className="text-white focus:bg-zinc-800 focus:text-white"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your service in detail..."
                    className="mt-2 min-h-[150px] bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">{description.length}/1200 characters</p>
                </div>

                <div>
                  <Label htmlFor="tags" className="text-gray-300">Search Tags</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Add up to 5 tags"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
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
                      className="border-zinc-700 text-white hover:bg-zinc-800"
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
                        className="border-emerald-600 text-emerald-400"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-emerald-300"
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
            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <h2 className="mb-6 text-white">Pricing & Delivery</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="price" className="text-gray-300">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="50"
                    className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="delivery" className="text-gray-300">Delivery Time *</Label>
                  <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                    <SelectTrigger className="mt-2 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select delivery time" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="1" className="text-white focus:bg-zinc-800 focus:text-white">
                        1 day delivery
                      </SelectItem>
                      <SelectItem value="3" className="text-white focus:bg-zinc-800 focus:text-white">
                        3 days delivery
                      </SelectItem>
                      <SelectItem value="7" className="text-white focus:bg-zinc-800 focus:text-white">
                        7 days delivery
                      </SelectItem>
                      <SelectItem value="14" className="text-white focus:bg-zinc-800 focus:text-white">
                        14 days delivery
                      </SelectItem>
                      <SelectItem value="30" className="text-white focus:bg-zinc-800 focus:text-white">
                        30 days delivery
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Gallery */}
            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <h2 className="mb-6 text-white">Gallery</h2>
              
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
              <Card className="border-zinc-800 bg-zinc-900 p-6">
                <h3 className="mb-4 text-white">Preview</h3>
                
                <div className="space-y-4">
                  <div className="bg-zinc-800 rounded-lg h-48 flex items-center justify-center overflow-hidden">
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
                    <h4 className="text-white line-clamp-2">
                      {title || 'Your gig title will appear here'}
                    </h4>
                  </div>

                  {category && (
                    <Badge variant="outline" className="border-emerald-600 text-emerald-400">
                      {categories.find(cat => cat.id === category)?.name || category}
                    </Badge>
                  )}

                  <p className="text-gray-400 text-sm line-clamp-3">
                    {description || 'Your description will appear here...'}
                  </p>

                  {price && (
                    <div className="border-t border-zinc-800 pt-4">
                      <p className="text-gray-400 text-sm mb-1">Starting at</p>
                      <p className="text-white text-2xl">${price}</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSubmit}
                  disabled={!title || !category || !description || !price || !deliveryTime || isSubmitting}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Gig'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800"
                >
                  Save as Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}