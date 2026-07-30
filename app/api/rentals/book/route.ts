import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/rentals/book - Create a new rental booking request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, renterId, startDate, endDate, pricingType, totalPrice } = body;

    if (!listingId || !renterId || !startDate || !endDate || !pricingType || !totalPrice) {
      return NextResponse.json({ error: 'Missing booking parameters' }, { status: 400 });
    }

    const listing = await prisma.rentalListing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Rental listing not found' }, { status: 404 });
    }

    // Verify dates conflict
    let bookedDates: string[] = [];
    try {
      bookedDates = JSON.parse(listing.availabilityCalendar || '[]');
    } catch (e) {
      bookedDates = [];
    }

    // Generate array of dates between start and end
    const start = new Date(startDate);
    const end = new Date(endDate);
    const datesToBook: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      datesToBook.push(d.toISOString().split('T')[0]);
    }

    // Check if any date is already booked
    const conflict = datesToBook.some(dateStr => bookedDates.includes(dateStr));
    if (conflict) {
      return NextResponse.json({ error: 'Selected dates conflict with existing bookings' }, { status: 400 });
    }

    // Create booking request
    const booking = await prisma.rentalBooking.create({
      data: {
        listingId,
        renterId,
        startDate: start,
        endDate: end,
        pricingType,
        totalPrice: parseFloat(totalPrice),
        status: 'pending',
        paymentStatus: 'pending'
      }
    });

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Error creating rental booking:', error);
    return NextResponse.json({ error: 'Failed to submit booking request' }, { status: 500 });
  }
}
