'use client';

import { MessagesPage } from '@/components/MessagesPage';
import { PageLayout } from '@/components/PageLayout';

export default function Messages() {
  return (
    <PageLayout showFooter={false}>
      <MessagesPage />
    </PageLayout>
  );
}