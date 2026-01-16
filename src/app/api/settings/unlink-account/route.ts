import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if this is the only auth method
    if (user.accounts.length === 1 && !user.password) {
      return NextResponse.json(
        { error: 'Cannot remove the only sign-in method. Please set a password first.' },
        { status: 400 }
      );
    }

    // Find and delete the account
    const accountToDelete = user.accounts.find(acc => acc.provider === provider);

    if (!accountToDelete) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    await prisma.account.delete({
      where: {
        provider_providerAccountId: {
          provider: accountToDelete.provider,
          providerAccountId: accountToDelete.providerAccountId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account unlinked successfully',
    });
  } catch (error) {
    console.error('Error unlinking account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
