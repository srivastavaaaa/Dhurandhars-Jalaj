import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/rentals - Fetch list of active rentable items with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const district = searchParams.get('district');

    const whereClause: any = {};

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (district && district !== 'all') {
      whereClause.district = district;
    }

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } }
      ];
    }

    const listings = await prisma.rentalListing.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            name: true,
            phone: true,
            village: true,
            district: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(listings);
  } catch (error: any) {
    console.error('Error fetching rental listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST /api/rentals - Create a new rental listing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ownerId,
      title,
      description,
      category,
      priceHour,
      priceDay,
      priceWeek,
      location,
      district,
      state,
      imageUrl
    } = body;

    if (!ownerId || !title || !description || !category || !location || !district || !state) {
      return NextResponse.json({ error: 'Missing required listing parameters' }, { status: 400 });
    }

    const listing = await prisma.rentalListing.create({
      data: {
        ownerId,
        title,
        description,
        category,
        priceHour: priceHour ? parseFloat(priceHour) : null,
        priceDay: priceDay ? parseFloat(priceDay) : null,
        priceWeek: priceWeek ? parseFloat(priceWeek) : null,
        location,
        district,
        state,
        imageUrl: imageUrl || null,
        availabilityCalendar: JSON.stringify([])
      }
    });

    return NextResponse.json(listing);
  } catch (error: any) {
    console.error('Error creating rental listing:', error);
    return NextResponse.json({ error: 'Failed to create rental listing' }, { status: 500 });
  }
}

// DELETE /api/rentals?id=... - Delete a rental listing
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing listing ID' }, { status: 400 });
    }

    const deletedListing = await prisma.rentalListing.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, deletedListing });
  } catch (error: any) {
    console.error('Error deleting rental listing:', error);
    return NextResponse.json({ error: 'Failed to delete listing', details: error.message }, { status: 500 });
  }
}
