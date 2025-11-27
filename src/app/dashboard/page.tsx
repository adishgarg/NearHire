'use client';

import { useSession } from 'next-auth/react';
import { SellerDashboard } from '@/components/SellerDashboard';
import { PageLayout } from '@/components/PageLayout';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (!session) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl text-white mb-4">Please sign in</h1>
            <a href="/auth/login" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">
              Sign In
            </a>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SellerDashboard />
    </PageLayout>
  );
}