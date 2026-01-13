import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { isSellerSubscriptionActive } from '@/lib/subscription';

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

    // Check if user is a seller
    if (user.role !== 'SELLER' && user.role !== 'BOTH') {
      return NextResponse.json(
        { error: 'Only sellers can create gigs' },
        { status: 403 }
      );
    }

    // Check if seller has active subscription
    const hasActiveSubscription = await isSellerSubscriptionActive(user.id);
    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: 'Active subscription required to create gigs. Please subscribe to continue.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const {
      title,
      description,
      category,
      tags,
      basicPrice,
      basicDescription,
      basicDeliveryTime,
      images,
      city,
      address,
      latitude,
      longitude,
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
        city: city || null,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
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
    const sortBy = searchParams.get('sortBy'); // 'distance', 'price-asc', 'price-desc', 'rating'
    const userLat = searchParams.get('userLat');
    const userLon = searchParams.get('userLon');
    
    console.log('🔍 API called with filters:', { 
      category, search, minPrice, maxPrice, deliveryTime, page, limit, sortBy, userLat, userLon 
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

    // Determine order by
    let orderBy: any = { createdAt: 'desc' };
    
    if (sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    }
    // Note: distance sorting is done in-memory after fetching

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
        orderBy
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
      
      // Calculate distance if user location is provided
      let distance = null;
      if (userLat && userLon && gig.latitude && gig.longitude) {
        const R = 6371; // Radius of Earth in km
        const dLat = (gig.latitude - parseFloat(userLat)) * (Math.PI / 180);
        const dLon = (gig.longitude - parseFloat(userLon)) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(parseFloat(userLat) * (Math.PI / 180)) *
            Math.cos(gig.latitude * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c; // Distance in km
      }
      
      return {
        ...gig,
        price: Number(gig.price), // Convert Decimal to number
        averageRating,
        startingPrice: Number(gig.price),
        distance
      };
    });

    // Sort by distance if requested
    if (sortBy === 'distance' && userLat && userLon) {
      gigsWithRating.sort((a, b) => {
        // Gigs without location go to the end
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    // Apply pagination after sorting
    const paginatedGigs = gigsWithRating.slice(skip, skip + limit);

    return NextResponse.json({
      gigs: paginatedGigs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(gigsWithRating.length / limit),
        totalItems: gigsWithRating.length,
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