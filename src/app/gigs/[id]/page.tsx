import { GigDetailPage } from '@/components/gigs/GigDetailPage';

interface GigPageProps {
  params: {
    id: string;
  };
}

export default function GigPage({ params }: GigPageProps) {
  return <GigDetailPage />;
}