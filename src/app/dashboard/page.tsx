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
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">
          Welcome to your Dashboard, {user.name}!
        </h1>
        
        <div className="bg-zinc-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Your Role</h2>
          <p className="text-zinc-300">
            You are registered as a <span className="text-emerald-400">{(user as any).role?.toLowerCase()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}