'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function PageLayout({ children, showFooter = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="pt-4">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}