import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { role, buyerProfile, sellerProfile } = await request.json();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare user update data
    const updateData: any = {
      role: role,
      onboardingCompleted: true,
    };

    // Add profile fields based on role and provided data
    if (role === 'BUYER' || role === 'BOTH') {
      if (buyerProfile?.bio) updateData.bio = buyerProfile.bio;
      if (buyerProfile?.location) updateData.location = buyerProfile.location;
      if (buyerProfile?.website) updateData.website = buyerProfile.website;
      if (buyerProfile?.phone) updateData.phone = buyerProfile.phone;
      
      // Store interests as JSON if provided
      if (buyerProfile?.interests && buyerProfile.interests.length > 0) {
        updateData.interests = JSON.stringify(buyerProfile.interests);
      }
    }

    if (role === 'SELLER' || role === 'BOTH') {
      if (sellerProfile?.bio) updateData.bio = sellerProfile.bio;
      if (sellerProfile?.location) updateData.location = sellerProfile.location;
      if (sellerProfile?.website || sellerProfile?.portfolio) {
        updateData.website = sellerProfile.website || sellerProfile.portfolio;
      }
      if (sellerProfile?.phone) updateData.phone = sellerProfile.phone;
      if (sellerProfile?.hourlyRate) updateData.hourlyRate = parseFloat(sellerProfile.hourlyRate);
      if (sellerProfile?.experience) updateData.experience = sellerProfile.experience;
      if (sellerProfile?.availability) updateData.availability = sellerProfile.availability;
      
      // Store skills as JSON if provided
      if (sellerProfile?.skills && sellerProfile.skills.length > 0) {
        updateData.skills = JSON.stringify(sellerProfile.skills);
      }

      // Mark profile as completed if we have essential seller info
      if (sellerProfile?.bio && sellerProfile?.skills && sellerProfile?.hourlyRate) {
        updateData.profileCompleted = true;
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        role: (updatedUser as any).role,
        onboardingCompleted: (updatedUser as any).onboardingCompleted,
        profileCompleted: (updatedUser as any).profileCompleted
      }
    });

  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}