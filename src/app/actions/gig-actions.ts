"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { generateSlug } from "@/lib/utils"

const createGigSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  categoryId: z.string(),
  subcategoryId: z.string().optional(),
  price: z.number().min(5).max(100000),
  deliveryTime: z.number().min(1).max(30),
  tags: z.array(z.string()).max(5),
  features: z.array(z.string()).max(10),
  images: z.array(z.string()).min(1).max(5),
})

export async function createGig(data: z.infer<typeof createGigSchema>) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const validatedData = createGigSchema.parse(data)
  
  try {
    const slug = generateSlug(validatedData.title)
    
    const gig = await prisma.gig.create({
      data: {
        ...validatedData,
        slug: `${slug}-${Date.now()}`,
        sellerId: session.user.id,
      },
    })

    revalidatePath("/dashboard/gigs")
    return { success: true, gigId: gig.id }
  } catch (error) {
    console.error("Error creating gig:", error)
    throw new Error("Failed to create gig")
  }
}

export async function updateGig(
  gigId: string, 
  data: Partial<z.infer<typeof createGigSchema>>
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Verify ownership
  const existingGig = await prisma.gig.findFirst({
    where: {
      id: gigId,
      sellerId: session.user.id,
    },
  })

  if (!existingGig) {
    throw new Error("Gig not found or unauthorized")
  }

  try {
    const updateData: any = { ...data }
    
    if (data.title && data.title !== existingGig.title) {
      updateData.slug = `${generateSlug(data.title)}-${Date.now()}`
    }

    const gig = await prisma.gig.update({
      where: { id: gigId },
      data: updateData,
    })

    revalidatePath("/dashboard/gigs")
    revalidatePath(`/gigs/${gig.slug}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating gig:", error)
    throw new Error("Failed to update gig")
  }
}

export async function deleteGig(gigId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Verify ownership and check for active orders
  const gig = await prisma.gig.findFirst({
    where: {
      id: gigId,
      sellerId: session.user.id,
    },
    include: {
      orders: {
        where: {
          status: {
            in: ["PENDING", "IN_PROGRESS"],
          },
        },
      },
    },
  })

  if (!gig) {
    throw new Error("Gig not found or unauthorized")
  }

  if (gig.orders.length > 0) {
    throw new Error("Cannot delete gig with active orders")
  }

  try {
    await prisma.gig.delete({
      where: { id: gigId },
    })

    revalidatePath("/dashboard/gigs")
    return { success: true }
  } catch (error) {
    console.error("Error deleting gig:", error)
    throw new Error("Failed to delete gig")
  }
}

export async function searchGigs(params: {
  query?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  deliveryTime?: number
  location?: { latitude: number; longitude: number; radius: number }
  page?: number
  limit?: number
}) {
  const {
    query,
    categoryId,
    minPrice,
    maxPrice,
    deliveryTime,
    location,
    page = 1,
    limit = 12,
  } = params

  const skip = (page - 1) * limit

  const where: any = {
    isActive: true,
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { tags: { has: query } },
    ]
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  if (deliveryTime) {
    where.deliveryTime = { lte: deliveryTime }
  }

  try {
    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              rating: true,
              reviewCount: true,
              level: true,
              verified: true,
              isOnline: true,
              latitude: true,
              longitude: true,
            },
          },
          category: true,
          subcategory: true,
        },
        skip,
        take: limit,
        orderBy: [
          { isFeatured: "desc" },
          { rating: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.gig.count({ where }),
    ])

    // Filter by location if provided
    let filteredGigs = gigs
    if (location) {
      const { latitude, longitude, radius } = location
      filteredGigs = gigs.filter((gig: any) => {
        if (!gig.seller.latitude || !gig.seller.longitude) return false
        
        const distance = calculateDistance(
          latitude,
          longitude,
          gig.seller.latitude,
          gig.seller.longitude
        )
        
        return distance <= radius
      })
    }

    return {
      gigs: filteredGigs,
      total: location ? filteredGigs.length : total,
      page,
      totalPages: Math.ceil((location ? filteredGigs.length : total) / limit),
    }
  } catch (error) {
    console.error("Error searching gigs:", error)
    throw new Error("Failed to search gigs")
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}