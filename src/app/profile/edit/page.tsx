'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Upload, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  DollarSign,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
  skills: string | null;
  hourlyRate: number | null;
  experience: string | null;
  availability: string | null;
  role: string | null;
}

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<ProfileData>({
    id: '',
    name: '',
    username: '',
    email: '',
    image: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    skills: '',
    hourlyRate: null,
    experience: '',
    availability: '',
    role: null
  });

  const [skillsArray, setSkillsArray] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile/edit');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          setFormData({
            id: user.id,
            name: user.name || '',
            username: user.username || '',
            email: user.email,
            image: user.image || '',
            bio: user.bio || '',
            location: user.location || '',
            website: user.website || '',
            phone: user.phone || '',
            skills: user.skills || '',
            hourlyRate: user.hourlyRate || null,
            experience: user.experience || '',
            availability: user.availability || '',
            role: user.role || null
          });

          // Parse skills if they exist
          if (user.skills) {
            try {
              const parsed = JSON.parse(user.skills);
              setSkillsArray(Array.isArray(parsed) ? parsed : []);
            } catch {
              setSkillsArray([]);
            }
          }
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skillsArray.includes(newSkill.trim())) {
      setSkillsArray(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsArray(prev => prev.filter(s => s !== skill));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('folder', 'profiles');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.data?.url;
        if (imageUrl) {
          setFormData(prev => ({ ...prev, image: imageUrl }));
        } else {
          console.error('Upload response:', data);
          setError('No image URL received from server');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Try to get city name from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            if (response.ok) {
              const data = await response.json();
              const city = data.address?.city || data.address?.town || data.address?.village;
              const country = data.address?.country;
              const location = city && country ? `${city}, ${country}` : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setFormData(prev => ({ ...prev, location }));
            } else {
              // Fallback to coordinates if reverse geocoding fails
              setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
            }
          } catch (err) {
            // Fallback to coordinates if API call fails
            setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          }
        } catch (err) {
          console.error('Error processing location:', err);
          setError('Failed to process location');
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setError('Location permission denied. Please enable location access in your browser settings.');
        } else if (error.code === error.TIMEOUT) {
          setError('Location request timed out. Please try again.');
        } else {
          setError('Failed to detect location. Please ensure location services are enabled.');
        }
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const updateData = {
        name: formData.name,
        username: formData.username,
        image: formData.image,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        phone: formData.phone,
        skills: JSON.stringify(skillsArray),
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate.toString()) : null,
        experience: formData.experience,
        availability: formData.availability
      };

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f5ecdf] text-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5ecdf] text-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-gray-600 mt-2">Update your profile information and settings</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Profile updated successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-gray-200 flex-shrink-0">
                  <AvatarImage src={formData.image || ''} alt={formData.name || 'User'} />
                  <AvatarFallback className="text-2xl bg-gray-100 text-gray-900">
                    {(formData.name || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="image-upload" className="block mb-3">
                    Profile Picture
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Choose File'}
                    </Button>
                    {formData.image && (
                      <span className="text-sm text-gray-600">
                        Image selected
                      </span>
                    )}
                  </div>
                  <Input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleInputChange}
                    placeholder="johndoe"
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="mt-2 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.bio || '').length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </CardTitle>
              <CardDescription>How people can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="mt-2 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="location"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    placeholder="New York, NY"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {detectingLocation ? 'Detecting...' : 'Detect'}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          {(formData.role === 'SELLER' || formData.role === 'BOTH') && (
            <Card className="border-gray-200 bg-white shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>Your skills and expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="skills"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add a skill (e.g., JavaScript, Design, Writing)"
                    />
                    <Button type="button" onClick={handleAddSkill} variant="outline">
                      Add
                    </Button>
                  </div>
                  {skillsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skillsArray.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourlyRate" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Hourly Rate (USD)
                    </Label>
                    <Input
                      id="hourlyRate"
                      name="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hourlyRate || ''}
                      onChange={handleInputChange}
                      placeholder="50.00"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="availability" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Availability
                    </Label>
                    <Input
                      id="availability"
                      name="availability"
                      value={formData.availability || ''}
                      onChange={handleInputChange}
                      placeholder="Full-time, Part-time, etc."
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    value={formData.experience || ''}
                    onChange={handleInputChange}
                    placeholder="Describe your work experience..."
                    rows={4}
                    className="mt-2 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 py-6"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            
            <Link href="/profile">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 hover:bg-white rounded-full px-8 py-6"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
