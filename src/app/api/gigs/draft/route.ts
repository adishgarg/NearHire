import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      basicRevisions,
      images,
      city,
      address,
      latitude,
      longitude,
    } = body;

    // Minimal validation for drafts
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.gig.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Get first category (or default)
    const firstCategory = await prisma.category.findFirst();
    if (!firstCategory) {
      return NextResponse.json(
        { error: 'No categories available' },
        { status: 500 }
      );
    }

    // Create draft gig with isActive: false
    const gig = await prisma.gig.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        slug,
        categoryId: category || firstCategory.id,
        sellerId: session.user.id,
        price: basicPrice || 0,
        deliveryTime: basicDeliveryTime || 1,
        tags: tags || [],
        features: [],
        images: images || [],
        city: city || null,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
        isActive: false, // Draft status
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json({ gig });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
