import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        onboardingCompleted: true,
        profileCompleted: true,
      }
    });

    return NextResponse.json({
      session: {
        user: session.user,
        onboardingCompleted: (session.user as any).onboardingCompleted,
      },
      database: dbUser,
      match: dbUser?.onboardingCompleted === (session.user as any).onboardingCompleted,
    });
  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Force complete onboarding (for debugging)
export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { onboardingCompleted: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding marked as complete. Please sign out and sign in again to refresh your session.',
      user: {
        email: updatedUser.email,
        onboardingCompleted: updatedUser.onboardingCompleted,
      }
    });
  } catch (error) {
    console.error('Debug force complete error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
