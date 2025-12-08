'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

interface DebugData {
  totalGigs: number;
  validGigs: number;
  orphanedGigs: number;
  totalUsers: number;
  orphanedGigDetails: Array<{
    id: string;
    title: string;
    sellerId: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export default function DebugPage() {
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/debug/gigs');
      if (response.ok) {
        const debugData = await response.json();
        setData(debugData);
      }
    } catch (error) {
      console.error('Error fetching debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupOrphanedGigs = async () => {
    setCleaning(true);
    setCleanupResult(null);
    
    try {
      const response = await fetch('/api/debug/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' })
      });
      
      if (response.ok) {
        const result = await response.json();
        setCleanupResult(result.message);
        // Refresh data after cleanup
        await fetchData();
      }
    } catch (error) {
      console.error('Error cleaning up:', error);
      setCleanupResult('Cleanup failed');
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5ecdf] text-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5ecdf] text-gray-900 p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-emerald-400">Database Debug Information</h1>
        
        {data && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Total Gigs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{data.totalGigs}</div>
              </CardContent>
            </Card>
            
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Valid Gigs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {data.validGigs}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Orphaned Gigs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {data.orphanedGigs}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{data.totalUsers}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {cleanupResult && (
          <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-600 rounded-lg">
            <p className="text-emerald-400">{cleanupResult}</p>
          </div>
        )}

        {data && data.orphanedGigs > 0 && (
          <Card className="border-red-800 bg-red-900/20 mb-8">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Orphaned Gigs Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-300 mb-4">
                These gigs have seller IDs that don't correspond to existing users. This is why you're seeing "Gig data incomplete".
              </p>
              
              <div className="space-y-2 mb-4">
                {data.orphanedGigDetails.map((gig) => (
                  <div key={gig.id} className="flex items-center gap-3 p-2 bg-zinc-800 rounded">
                    <Badge variant="destructive" className="text-xs">ID: {gig.id}</Badge>
                    <span className="text-white">{gig.title}</span>
                    <Badge variant="outline" className="text-xs text-zinc-400">Seller ID: {gig.sellerId}</Badge>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={cleanupOrphanedGigs}
                disabled={cleaning}
                className="bg-red-600 hover:bg-red-700"
              >
                {cleaning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cleaning up...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Orphaned Gigs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {data && data.users.length > 0 && (
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-emerald-400">Existing Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {data.users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 bg-zinc-800 rounded">
                    <Badge variant="secondary" className="text-xs">{user.id}</Badge>
                    <span className="text-white">{user.name}</span>
                    <span className="text-zinc-400 text-sm">{user.email}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <Button onClick={fetchData} variant="outline" className="border-zinc-700">
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}