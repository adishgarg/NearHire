'use client';

import { ProfilePage } from '@/components/ProfilePage';
import { PageLayout } from '@/components/PageLayout';

export default function Profile() {
  return (
    <PageLayout>
      <ProfilePage isOwnProfile={true} />
    </PageLayout>
  );
}