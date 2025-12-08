'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ProfilePage } from '@/components/ProfilePage';
import { PageLayout } from '@/components/PageLayout';
import { User, Gig } from '@/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileData {
  user: User & {
    gigs: Gig[];
    receivedReviews: Array<{
      rating: number;
      comment: string;
      createdAt: string;
      reviewer: {
        name: string;
        image: string;
      };
    }>;
  };
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchProfileData();
  }, [session, status, router, fetchProfileData]);

  if (status === 'loading' || loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-[#f5ecdf]">
          <div className="container mx-auto px-4 py-8">
            <Card className="border-gray-200 bg-white p-8 mb-8 rounded-3xl">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <Skeleton className="h-32 w-32 rounded-full bg-gray-200" />
                  <Skeleton className="h-10 w-24 mt-4 bg-gray-200" />
                </div>
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-64 bg-gray-200" />
                  <Skeleton className="h-4 w-32 bg-gray-200" />
                  <Skeleton className="h-16 w-full bg-zinc-700" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 bg-zinc-700" />
                    <Skeleton className="h-6 w-20 bg-zinc-700" />
                    <Skeleton className="h-6 w-18 bg-zinc-700" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Card className="border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Profile</h2>
            <p className="text-zinc-400 mb-4">{error}</p>
            <button
              onClick={fetchProfileData}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Try Again
            </button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!profileData) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Card className="border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-2xl font-bold text-white">No Profile Data</h2>
            <p className="text-zinc-400">Unable to load your profile information.</p>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ProfilePage 
        user={profileData.user} 
        gigs={profileData.user.gigs}
        reviews={profileData.user.receivedReviews}
        isOwnProfile={true} 
      />
    </PageLayout>
  );
}