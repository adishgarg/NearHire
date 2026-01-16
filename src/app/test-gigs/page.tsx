'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function TestGigsPage() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gigs');
      if (response.ok) {
        const data = await response.json();
        setGigs(data.gigs || []);
        console.log('Raw API response:', data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch gigs');
      }
    } catch (err) {
      console.error('Error fetching gigs:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
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
        <h1 className="text-3xl font-bold mb-8 text-emerald-400">Test Gigs Data</h1>
        
        <div className="mb-6 flex items-center gap-4">
          <Button onClick={fetchGigs} variant="outline" className="border-zinc-700">
            Refresh
          </Button>
          <Badge variant="secondary">
            Total Gigs: {gigs.length}
          </Badge>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        <div className="grid gap-6">
          {gigs.map((gig, index) => (
            <Card key={gig.id || index} className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center justify-between">
                  <span>{gig.title}</span>
                  <Badge variant={gig.seller ? "default" : "destructive"}>
                    {gig.seller ? "Has Seller" : "No Seller"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Basic Info</h4>
                    <ul className="text-sm space-y-1">
                      <li><strong>ID:</strong> {gig.id}</li>
                      <li><strong>Title:</strong> {gig.title}</li>
                      <li><strong>Price:</strong> ₹{gig.price}</li>
                      <li><strong>Rating:</strong> {gig.rating}</li>
                      <li><strong>Reviews:</strong> {gig.reviewCount}</li>
                      <li><strong>Active:</strong> {gig.isActive ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Seller Info</h4>
                    {gig.seller ? (
                      <ul className="text-sm space-y-1 text-emerald-300">
                        <li><strong>ID:</strong> {gig.seller.id}</li>
                        <li><strong>Name:</strong> {gig.seller.name}</li>
                        <li><strong>Email:</strong> {gig.seller.email || 'N/A'}</li>
                        <li><strong>Rating:</strong> {gig.seller.rating}</li>
                        <li><strong>Reviews:</strong> {gig.seller.reviewCount}</li>
                      </ul>
                    ) : (
                      <div className="text-red-400">
                        <p>❌ No seller data available</p>
                        <p className="text-xs mt-1">This will cause "Gig data incomplete" error</p>
                      </div>
                    )}
                  </div>
                </div>

                {gig.category && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-white mb-2">Category</h4>
                    <Badge variant="outline">
                      {gig.category.name} ({gig.category.slug})
                    </Badge>
                  </div>
                )}

                {gig.images && gig.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-white mb-2">Images</h4>
                    <div className="flex gap-2 flex-wrap">
                      {gig.images.map((img: string, idx: number) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`Gig image ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded border border-zinc-700"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 bg-zinc-800 rounded text-xs">
                  <strong>Raw JSON:</strong>
                  <pre className="mt-2 text-zinc-400 overflow-x-auto">
                    {JSON.stringify(gig, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {gigs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
            <p className="text-zinc-400">Either no gigs exist or they were filtered out due to missing seller data</p>
          </div>
        )}
      </div>
    </div>
  );
}