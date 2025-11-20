'use client';

import { GigDetail } from '@/components/GigDetail';
import { PageLayout } from '@/components/PageLayout';

interface GigPageProps {
  params: {
    id: string;
  };
}

export default function GigPage({ params }: GigPageProps) {
  return (
    <PageLayout>
      <GigDetail gigId={params.id} />
    </PageLayout>
  );
}