"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Dynamic Prisma import to avoid build issues
async function getPrisma() {
  const { PrismaClient } = await import('@prisma/client')
  return new PrismaClient()
}

const createOrderSchema = z.object({
  gigId: z.string(),
  requirements: z.string().min(10).max(1000),
})

export async function createOrder(data: z.infer<typeof createOrderSchema>) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Type assertion since we've confirmed user exists
  const userId = session.user.id as string

  const validatedData = createOrderSchema.parse(data)
  
  try {
    // Get gig details
    const prisma = await getPrisma()
    const gig = await prisma.gig.findUnique({
      where: { id: validatedData.gigId },
      include: { seller: true },
    })

    if (!gig) {
      throw new Error("Gig not found")
    }

    if (gig.sellerId === userId) {
      throw new Error("Cannot order your own gig")
    }

    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "10") / 100
    const platformFee = Number(gig.price) * platformFeePercentage
    
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + gig.deliveryTime)

    // Create order and conversation in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const order = await tx.order.create({
        data: {
          gigId: validatedData.gigId,
          buyerId: userId,
          sellerId: gig.sellerId,
          price: gig.price,
          platformFee,
          requirements: validatedData.requirements,
          dueDate,
        },
      })

      // Create conversation for the order
      const conversation = await tx.conversation.create({
        data: {
          orderId: order.id,
          participants: {
            createMany: {
              data: [
                { userId: userId },
                { userId: gig.sellerId },
              ],
            },
          },
        },
      })

      return { order, conversation }
    })

    revalidatePath("/dashboard/orders")
    return { success: true, orderId: result.order.id }
  } catch (error) {
    console.error("Error creating order:", error)
    throw new Error("Failed to create order")
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: "IN_PROGRESS" | "DELIVERED" | "COMPLETED" | "CANCELLED"
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const prisma = await getPrisma()
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { gig: true },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    // Check permissions based on status and user role
    const isBuyer = order.buyerId === session.user.id
    const isSeller = order.sellerId === session.user.id

    if (status === "IN_PROGRESS" && !isSeller) {
      throw new Error("Only seller can start the order")
    }
    
    if (status === "DELIVERED" && !isSeller) {
      throw new Error("Only seller can deliver the order")
    }
    
    if (status === "COMPLETED" && !isBuyer) {
      throw new Error("Only buyer can complete the order")
    }
    
    if (status === "CANCELLED" && !isBuyer && !isSeller) {
      throw new Error("Unauthorized to cancel order")
    }

    const updateData: any = { status }
    
    if (status === "DELIVERED") {
      updateData.deliveredAt = new Date()
    }
    
    if (status === "COMPLETED") {
      updateData.completedAt = new Date()
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    revalidatePath("/dashboard/orders")
    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)
    throw new Error("Failed to update order status")
  }
}

export async function getOrderDetails(orderId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const prisma = await getPrisma()
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          { buyerId: session.user.id },
          { sellerId: session.user.id },
        ],
      },
      include: {
        gig: {
          include: {
            category: true,
            subcategory: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            rating: true,
            reviewCount: true,
          },
        },
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
            responseTime: true,
            isOnline: true,
          },
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 10,
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        review: true,
      },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    return order
  } catch (error) {
    console.error("Error getting order details:", error)
    throw new Error("Failed to get order details")
  }
}

export async function getUserOrders(type: "buyer" | "seller" = "buyer") {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const prisma = await getPrisma()
    const whereCondition = type === "buyer" 
      ? { buyerId: session.user.id }
      : { sellerId: session.user.id }

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            images: true,
            category: {
              select: { name: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            level: true,
            verified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return orders
  } catch (error) {
    console.error("Error getting user orders:", error)
    throw new Error("Failed to get user orders")
  }
}