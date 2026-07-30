import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/equipment - Fetch and search equipment listings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const district = searchParams.get('district');
    const date = searchParams.get('date'); // YYYY-MM-DD

    // Build filter query
    const where: any = {};
    if (type && type !== 'all') {
      where.equipmentType = type;
    }
    if (district) {
      where.district = district;
    }

    const listings = await prisma.equipmentListing.findMany({
      where,
      orderBy: { pricePerDay: 'asc' }
    });

    // If a date filter is provided, filter out listings that are already booked on that date
    let filteredListings = listings;
    if (date) {
      filteredListings = listings.filter((listing) => {
        try {
          const bookedDates: string[] = JSON.parse(listing.availabilityCalendar || '[]');
          return !bookedDates.includes(date);
        } catch (e) {
          return true;
        }
      });
    }

    return NextResponse.json(filteredListings);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch equipment listings', details: error.message }, { status: 500 });
  }
}

// POST /api/equipment - Create a new peer listing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { equipmentType, location, district, state, pricePerDay, imageUrl } = body;
    const farmerId = req.cookies.get('krishi_farmer_id')?.value;

    if (!equipmentType || !location || !district || !state || !pricePerDay) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const listing = await prisma.equipmentListing.create({
      data: {
        ownerId: farmerId || null, // null means FPO/institutional if not logged in
        equipmentType,
        location,
        district,
        state,
        pricePerDay: parseFloat(pricePerDay),
        availabilityCalendar: JSON.stringify([]),
        source: farmerId ? 'peer' : 'CHC',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400'
      }
    });

    return NextResponse.json(listing);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create listing', details: error.message }, { status: 500 });
  }
}
