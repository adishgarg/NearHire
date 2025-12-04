import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database  
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For now, allow any authenticated user to create gigs
    // TODO: Implement proper role checking once onboarding is complete

    const body = await request.json();
    
    const {
      title,
      description,
      category,
      tags,
      basicPrice,
      basicDescription,
      basicDeliveryTime,
      images
    } = body;

    // Validation
    if (!title || !description || !category || !basicPrice || !basicDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (basicPrice < 5) {
      return NextResponse.json(
        { error: 'Minimum price is $5' },
        { status: 400 }
      );
    }

    // Find or create category
    let categoryRecord = await prisma.category.findFirst({
      where: { slug: category }
    });

    if (!categoryRecord) {
      // Create a basic category if it doesn't exist
      categoryRecord = await prisma.category.create({
        data: {
          name: category.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          slug: category,
          icon: '📂',
          image: '/placeholder-category.jpg',
        }
      });
    }

    // Generate unique slug for the gig
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.gig.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create gig
    const gig = await prisma.gig.create({
      data: {
        title,
        description,
        slug,
        categoryId: categoryRecord.id,
        tags: tags || [],
        images: images || [],
        price: basicPrice,
        deliveryTime: basicDeliveryTime || 3,
        sellerId: user.id,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        }
      }
    });

    // Double-check that seller data was properly included
    if (!gig.seller) {
      console.error('Critical: Gig created but seller not found!', { gigId: gig.id, sellerId: user.id });
      // Try to fetch the user again to debug
      const userRecheck = await prisma.user.findUnique({ where: { id: user.id } });
      console.log('User recheck:', userRecheck ? 'EXISTS' : 'MISSING');
    }

    return NextResponse.json({ 
      success: true, 
      gig,
      message: 'Gig created successfully' 
    });

  } catch (error) {
    console.error('Gig creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const deliveryTime = searchParams.get('deliveryTime');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    console.log('🔍 API called with filters:', { 
      category, search, minPrice, maxPrice, deliveryTime, page, limit 
    });
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        const min = parseFloat(minPrice);
        where.price.gte = min;
        console.log('📈 Min price filter:', min);
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        where.price.lte = max;
        console.log('📉 Max price filter:', max);
      }
    }

    if (deliveryTime) {
      const maxDelivery = parseInt(deliveryTime);
      where.deliveryTime = { lte: maxDelivery };
      console.log('⏰ Delivery time filter (lte):', maxDelivery);
    }

    console.log('🔍 Final where clause:', JSON.stringify(where, null, 2));

    // Get gigs with filters
    const [gigs, totalCount] = await Promise.all([
      prisma.gig.findMany({
        where,
        include: {
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
              reviewCount: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.gig.count({ where })
    ]);

    // Log any gigs that don't have seller data for debugging
    const gigsWithoutSellers = gigs.filter(gig => !gig.seller);
    if (gigsWithoutSellers.length > 0) {
      console.warn(`Found ${gigsWithoutSellers.length} gigs without seller data:`, gigsWithoutSellers.map(g => ({ id: g.id, title: g.title, sellerId: g.sellerId })));
      
      // Try to find what happened to these sellers
      for (const orphanGig of gigsWithoutSellers) {
        const sellerExists = await prisma.user.findUnique({
          where: { id: orphanGig.sellerId },
          select: { id: true, name: true, email: true }
        });
        console.log(`Seller ${orphanGig.sellerId} for gig ${orphanGig.id}:`, sellerExists ? 'EXISTS' : 'MISSING');
      }
    }

    // Filter out gigs without sellers and calculate average rating
    const validGigs = gigs.filter(gig => gig.seller);
    const gigsWithRating = validGigs.map(gig => {
      const totalRating = gig.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      const averageRating = gig.reviews.length > 0 ? totalRating / gig.reviews.length : 0;
      
      return {
        ...gig,
        price: Number(gig.price), // Convert Decimal to number
        averageRating,
        startingPrice: Number(gig.price)
      };
    });

    return NextResponse.json({
      gigs: gigsWithRating,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Gigs fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}