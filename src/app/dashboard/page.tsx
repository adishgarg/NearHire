import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/login');
  }

  // If onboarding is not completed, redirect to onboarding
  if (!(user as any).onboardingCompleted) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-[#e6ddcf]">
      <div className="container mx-auto py-12 px-4">
        <h1 className="font-serif text-4xl font-semibold text-gray-900 mb-8">
          Welcome to your Dashboard, {user.name}!
        </h1>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-4">Your Role</h2>
          <p className="text-gray-600">
            You are registered as a <span className="text-gray-900 font-medium">{(user as any).role?.toLowerCase()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}