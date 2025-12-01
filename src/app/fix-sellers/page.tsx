'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SellerData {
  totalGigs: number;
  gigsWithSellers: number;
  gigsWithoutSellers: number;
  problematicGigs: Array<{
    id: string;
    title: string;
    sellerId: string;
  }>;
}

export default function FixSellersPage() {
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [message, setMessage] = useState('');

  const checkSellerIssues = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/fix-sellers');
      if (response.ok) {
        const data = await response.json();
        setSellerData(data);
        setMessage('Seller data loaded successfully');
      } else {
        setMessage('Failed to load seller data');
      }
    } catch (error) {
      setMessage('Error loading seller data: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const fixSellerRelationships = async () => {
    setFixing(true);
    setMessage('');
    try {
      const response = await fetch('/api/fix-sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'fix' }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`Successfully fixed ${data.fixedGigs} gigs with missing sellers`);
        // Refresh the data
        await checkSellerIssues();
      } else {
        const error = await response.json();
        setMessage('Failed to fix seller relationships: ' + error.error);
      }
    } catch (error) {
      setMessage('Error fixing seller relationships: ' + error);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Fix Gig Seller Relationships</h1>
        
        <Card className="border-zinc-800 bg-zinc-900 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">Seller Relationship Diagnostics</h2>
          
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={checkSellerIssues}
              disabled={loading}
              variant="outline"
              className="border-zinc-700"
            >
              {loading ? 'Checking...' : 'Check Seller Issues'}
            </Button>
            
            {sellerData && sellerData.gigsWithoutSellers > 0 && (
              <Button 
                onClick={fixSellerRelationships}
                disabled={fixing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {fixing ? 'Fixing...' : `Fix ${sellerData.gigsWithoutSellers} Gigs`}
              </Button>
            )}
          </div>

          {message && (
            <Alert className="mb-4 border-zinc-700 bg-zinc-800">
              <AlertDescription className="text-zinc-300">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {sellerData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-zinc-700 bg-zinc-950 p-4">
                <h3 className="text-lg font-semibold text-emerald-400">Total Gigs</h3>
                <p className="text-2xl">{sellerData.totalGigs}</p>
              </Card>
              
              <Card className="border-zinc-700 bg-zinc-950 p-4">
                <h3 className="text-lg font-semibold text-green-400">Gigs with Sellers</h3>
                <p className="text-2xl">{sellerData.gigsWithSellers}</p>
              </Card>
              
              <Card className="border-zinc-700 bg-zinc-950 p-4">
                <h3 className="text-lg font-semibold text-red-400">Gigs without Sellers</h3>
                <p className="text-2xl">{sellerData.gigsWithoutSellers}</p>
              </Card>
            </div>
          )}

          {sellerData && sellerData.problematicGigs.length > 0 && (
            <Card className="border-zinc-700 bg-zinc-950 p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-4">
                Problematic Gigs ({sellerData.problematicGigs.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sellerData.problematicGigs.map((gig) => (
                  <div key={gig.id} className="p-3 bg-zinc-900 rounded border border-zinc-700">
                    <p className="font-semibold text-white">{gig.title}</p>
                    <p className="text-sm text-zinc-400">ID: {gig.id}</p>
                    <p className="text-sm text-zinc-400">Seller ID: {gig.sellerId}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">How This Fix Works</h2>
          <div className="space-y-3 text-zinc-300">
            <p>• <strong>Check:</strong> Identifies gigs that don't have valid seller relationships</p>
            <p>• <strong>Fix:</strong> Assigns orphaned gigs to the current logged-in user</p>
            <p>• <strong>Backup:</strong> Creates a default seller if needed</p>
            <p>• <strong>Result:</strong> All gigs will have valid seller data for proper marketplace display</p>
          </div>
        </Card>
      </div>
    </div>
  );
}