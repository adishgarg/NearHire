import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        latitude: true,
        longitude: true,
        website: true,
        phone: true,
        rating: true,
        reviewCount: true,
        level: true,
        verified: true,
        totalEarnings: true,
        activeOrders: true,
        responseTime: true,
        lastSeen: true,
        isOnline: true,
        createdAt: true,
        updatedAt: true,
        gigs: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            rating: true,
            reviewCount: true,
            images: true,
            isActive: true,
            category: {
              select: {
                name: true,
                slug: true
              }
            },
            seller: {
              select: {
                id: true,
                name: true,
                image: true,
                rating: true,
                reviewCount: true,
                verified: true,
                level: true
              }
            }
          },
          where: {
            isActive: true
          }
        },
        receivedReviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
    
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      username,
      bio,
      location,
      website,
      phone,
      skills,
      hourlyRate,
      experience,
      availability
    } = body

    // Validate username uniqueness if provided
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: {
            email: session.user.email
          }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (website !== undefined) updateData.website = website
    if (phone !== undefined) updateData.phone = phone
    if (skills !== undefined) updateData.skills = skills
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate
    if (experience !== undefined) updateData.experience = experience
    if (availability !== undefined) updateData.availability = availability

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        phone: true,
        skills: true,
        hourlyRate: true,
        experience: true,
        availability: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ 
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}