'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, MapPin, Globe, Phone, ArrowRight, Upload } from 'lucide-react';

interface BuyerProfileProps {
  onComplete: (data: BuyerProfileData) => void;
  onSkip: () => void;
}

interface BuyerProfileData {
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  interests?: string[];
}

export function BuyerProfile({ onComplete, onSkip }: BuyerProfileProps) {
  const [formData, setFormData] = useState<BuyerProfileData>({
    bio: '',
    location: '',
    website: '',
    phone: '',
    interests: []
  });
  
  const [progress, setProgress] = useState(0);

  const updateProgress = () => {
    const fields = [formData.bio, formData.location, formData.website, formData.phone];
    const filledFields = fields.filter(field => field && field.trim().length > 0).length;
    setProgress((filledFields / fields.length) * 100);
  };

  const handleInputChange = (field: keyof BuyerProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTimeout(updateProgress, 0);
  };

  const interestOptions = [
    'Web Development', 'Mobile Apps', 'Graphic Design', 'Content Writing',
    'Digital Marketing', 'Video Editing', 'UI/UX Design', 'Data Analysis',
    'Photography', 'Translation', 'Virtual Assistant', 'Social Media'
  ];

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-zinc-800 bg-zinc-900">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white mb-2">
            Complete Your Buyer Profile
          </CardTitle>
          <p className="text-zinc-400">
            Help us personalize your experience and connect you with the right sellers
          </p>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-zinc-500 mt-2">{Math.round(progress)}% complete</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="bio" className="text-zinc-300">
              Tell us about yourself
            </Label>
            <Textarea
              id="bio"
              placeholder="What kind of projects are you looking to hire for? What's your background?"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white mt-2"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-zinc-300">
                <MapPin className="inline h-4 w-4 mr-2" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white mt-2"
              />
            </div>

            <div>
              <Label htmlFor="website" className="text-zinc-300">
                <Globe className="inline h-4 w-4 mr-2" />
                Website/Portfolio (Optional)
              </Label>
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-zinc-300">
              <Phone className="inline h-4 w-4 mr-2" />
              Phone Number (Optional)
            </Label>
            <Input
              id="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white mt-2"
            />
          </div>

          <div>
            <Label className="text-zinc-300 mb-3 block">
              What services are you interested in hiring for? (Optional)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {interestOptions.map((interest) => (
                <Badge
                  key={interest}
                  variant={formData.interests?.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer text-center justify-center py-2 ${
                    formData.interests?.includes(interest)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-zinc-600 text-zinc-300 hover:border-emerald-500'
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Skip for now
            </Button>
            <Button
              onClick={() => onComplete(formData)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Complete Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}