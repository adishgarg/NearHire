'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, MapPin, Globe, Phone, ArrowRight, Upload, Star, 
  Briefcase, DollarSign, Calendar, Award 
} from 'lucide-react';

interface SellerProfileProps {
  onComplete: (data: SellerProfileData) => void;
  onSkip: () => void;
}

interface SellerProfileData {
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  skills?: string[];
  hourlyRate?: string;
  experience?: string;
  portfolio?: string;
  availability?: string;
}

export function SellerProfile({ onComplete, onSkip }: SellerProfileProps) {
  const [formData, setFormData] = useState<SellerProfileData>({
    bio: '',
    location: '',
    website: '',
    phone: '',
    skills: [],
    hourlyRate: '',
    experience: '',
    portfolio: '',
    availability: ''
  });
  
  const [progress, setProgress] = useState(0);

  const updateProgress = () => {
    const requiredFields = [formData.bio, formData.skills?.length, formData.hourlyRate, formData.experience];
    const filledFields = requiredFields.filter(field => field && (typeof field === 'string' ? field.trim().length > 0 : field > 0)).length;
    setProgress((filledFields / requiredFields.length) * 100);
  };

  const handleInputChange = (field: keyof SellerProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTimeout(updateProgress, 0);
  };

  const skillOptions = [
    'Web Development', 'Mobile App Development', 'Graphic Design', 'UI/UX Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Social Media Marketing',
    'Video Editing', 'Photography', 'Data Analysis', 'Virtual Assistant',
    'Translation', 'Voice Over', 'Animation', 'E-commerce', 'WordPress',
    'React', 'Node.js', 'Python', 'Adobe Photoshop', 'Figma'
  ];

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...(prev.skills || []), skill]
    }));
    setTimeout(updateProgress, 0);
  };

  const experienceOptions = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years',
    '6-10 years',
    '10+ years'
  ];

  const availabilityOptions = [
    'Full-time (40+ hrs/week)',
    'Part-time (20-39 hrs/week)',
    'Limited (10-19 hrs/week)',
    'Weekends only',
    'Project-based'
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl border-zinc-800 bg-zinc-900">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white mb-2">
            Complete Your Seller Profile
          </CardTitle>
          <p className="text-zinc-400">
            Showcase your skills and experience to attract the right clients
          </p>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-zinc-500 mt-2">{Math.round(progress)}% complete</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="bio" className="text-zinc-300">
              Professional Bio *
            </Label>
            <Textarea
              id="bio"
              placeholder="Describe your professional background, expertise, and what makes you unique..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white mt-2"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-zinc-300 mb-3 block">
              Your Skills & Expertise * (Select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {skillOptions.map((skill) => (
                <Badge
                  key={skill}
                  variant={formData.skills?.includes(skill) ? "default" : "outline"}
                  className={`cursor-pointer text-center justify-center py-2 ${
                    formData.skills?.includes(skill)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-zinc-600 text-zinc-300 hover:border-emerald-500'
                  }`}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
            {formData.skills && formData.skills.length > 0 && (
              <p className="text-sm text-zinc-500 mt-2">
                {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourlyRate" className="text-zinc-300">
                <DollarSign className="inline h-4 w-4 mr-2" />
                Hourly Rate (USD) *
              </Label>
              <Input
                id="hourlyRate"
                placeholder="25"
                value={formData.hourlyRate}
                onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white mt-2"
                type="number"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="experience" className="text-zinc-300">
                <Award className="inline h-4 w-4 mr-2" />
                Years of Experience *
              </Label>
              <Select 
                value={formData.experience} 
                onValueChange={(value) => handleInputChange('experience', value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-2">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {experienceOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-zinc-700">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="availability" className="text-zinc-300">
              <Calendar className="inline h-4 w-4 mr-2" />
              Availability
            </Label>
            <Select 
              value={formData.availability} 
              onValueChange={(value) => handleInputChange('availability', value)}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-2">
                <SelectValue placeholder="Select your availability" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {availabilityOptions.map((option) => (
                  <SelectItem key={option} value={option} className="text-white hover:bg-zinc-700">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Label htmlFor="phone" className="text-zinc-300">
                <Phone className="inline h-4 w-4 mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="portfolio" className="text-zinc-300">
              <Globe className="inline h-4 w-4 mr-2" />
              Portfolio/Website URL
            </Label>
            <Input
              id="portfolio"
              placeholder="https://yourportfolio.com"
              value={formData.portfolio}
              onChange={(e) => handleInputChange('portfolio', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white mt-2"
            />
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-zinc-300 font-medium mb-2">✨ Pro Tips for Success:</h4>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• A complete profile gets 5x more visibility</li>
              <li>• Competitive hourly rates increase your hire rate</li>
              <li>• Portfolio links help clients trust your expertise</li>
            </ul>
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