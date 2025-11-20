'use client';

import { User, Gig } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GigCard } from './GigCard';
import { Star, MapPin, Calendar, Award, VerifiedIcon, MessageSquare } from 'lucide-react';

interface ProfilePageProps {
  user?: User;
  gigs?: Gig[];
  onGigClick?: (gig: Gig) => void;
  isOwnProfile?: boolean;
}

// Default user data
const defaultUser: User = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  rating: 4.8,
  reviewCount: 156,
  level: 'Top Rated',
  verified: true,
  bio: 'Professional full-stack developer with 5+ years of experience.',
  skills: ['React', 'Node.js', 'TypeScript', 'Python'],
  location: 'San Francisco, CA',
  memberSince: '2020-01-15'
};

export function ProfilePage({ user = defaultUser, gigs = [], onGigClick, isOwnProfile = false }: ProfilePageProps) {
  const userGigs = gigs.filter(gig => gig.seller?.id === user.id);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="border-zinc-800 bg-zinc-900 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 mb-4 border-4 border-emerald-600">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-white">{user.name}</h1>
                    {user.verified && (
                      <VerifiedIcon className="h-6 w-6 fill-emerald-600 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-gray-400 mb-3">@{user.username}</p>
                  <Badge className="bg-emerald-600/10 text-emerald-400 border-emerald-600">
                    {user.level}
                  </Badge>
                </div>
                {!isOwnProfile && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                )}
              </div>

              <p className="text-gray-300 mb-6">
                Professional {userGigs[0]?.category || 'freelancer'} with a passion for delivering high-quality work.
                Specialized in creating exceptional solutions for clients worldwide.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="text-gray-400 text-sm">Rating</span>
                  </div>
                  <p className="text-white text-xl">{user.rating.toFixed(1)}</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-emerald-600" />
                    <span className="text-gray-400 text-sm">Reviews</span>
                  </div>
                  <p className="text-white text-xl">{user.reviewCount}</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-400 text-sm">From</span>
                  </div>
                  <p className="text-white">United States</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-400 text-sm">Member since</span>
                  </div>
                  <p className="text-white">Jan 2023</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="gigs" className="mb-8">
          <TabsList className="bg-zinc-900 border-b border-zinc-800">
            <TabsTrigger value="gigs" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              Active Gigs ({userGigs.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              Reviews ({user.reviewCount})
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gigs" className="mt-6">
            {userGigs.length === 0 ? (
              <Card className="border-zinc-800 bg-zinc-900 p-12 text-center">
                <p className="text-gray-400">No active gigs yet</p>
                {isOwnProfile && (
                  <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                    Create Your First Gig
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {userGigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} onClick={() => onGigClick(gig)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="border-zinc-800 bg-zinc-900 p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=200`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white">Client Name {i}</p>
                        <span className="text-sm text-gray-500">2 weeks ago</span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <p className="text-gray-300">
                        Outstanding work! Very professional and delivered exactly what was needed.
                        Would definitely recommend and hire again.
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-4 text-white">About Me</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                I'm a professional freelancer with {user.reviewCount}+ completed projects and a {user.rating} star rating.
                I specialize in delivering high-quality work that exceeds client expectations. My goal is to
                help businesses grow by providing exceptional services tailored to their specific needs.
              </p>

              <h3 className="mb-4 text-white">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Web Development', 'UI/UX Design', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js'].map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-zinc-700 text-gray-300"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>

              <h3 className="mb-4 text-white">Languages</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">English</span>
                  <Badge variant="outline" className="border-emerald-600 text-emerald-400">
                    Native
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Spanish</span>
                  <Badge variant="outline" className="border-zinc-700 text-gray-400">
                    Fluent
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
