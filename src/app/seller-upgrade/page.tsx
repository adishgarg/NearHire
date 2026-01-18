'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, TrendingUp, Shield, ArrowRight, Loader2, Zap, Star, CheckCircle2 } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';

export default function SellerUpgradePage() {
  const router = useRouter();
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <PageLayout>
        <div className="min-h-screen bg-[#e6ddcf] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
        </div>
      </PageLayout>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#e6ddcf] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-200 bg-white rounded-3xl shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gray-900 flex items-center justify-center mb-6">
              <Lock className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-3">
              Subscription Required
            </h2>
            
            <p className="text-gray-600 mb-8">
              Subscribe to a seller plan to create gigs and start earning
            </p>

            <Button
              onClick={() => router.push('/subscription')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full text-base font-semibold py-6 shadow-lg hover:shadow-xl transition-all"
            >
              View Subscription Plans
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
