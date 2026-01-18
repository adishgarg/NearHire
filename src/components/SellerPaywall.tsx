'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, TrendingUp, Shield, ArrowRight } from 'lucide-react';

interface SellerPaywallProps {
  onClose?: () => void;
}

export function SellerPaywall({ onClose }: SellerPaywallProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl border-gray-200 bg-white rounded-3xl shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center mb-6">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl text-gray-900 mb-3 font-serif">
            Start Selling on NearHire
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Unlock the ability to create gigs and earn money by subscribing to a seller plan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              What You'll Get:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Create Unlimited Gigs</p>
                  <p className="text-sm text-gray-600">Showcase your services and skills to thousands of buyers</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="h-3.5 w-3.5 text-white" />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Professional Dashboard</p>
                  <p className="text-sm text-gray-600">Manage orders and grow your business</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
            <p className="text-sm text-blue-900">
              <strong>💡 Pro Tip:</strong> Start with our basic plan to test the waters, or go premium for maximum visibility and features!
            </p>
          </div>

          <div className="flex gap-3">
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
              >
                Maybe Later
              </Button>
            )}
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-lg py-6"
            >
              View Subscription Plans
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
