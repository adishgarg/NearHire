'use client';

import { SearchResults } from '@/components/SearchResults';
import { PageLayout } from '@/components/PageLayout';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <PageLayout>
      <SearchResults query={searchParams.q} category={searchParams.category} />
    </PageLayout>
  );
}