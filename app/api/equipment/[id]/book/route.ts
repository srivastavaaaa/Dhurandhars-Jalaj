import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/equipment/[id]/book - Rent a machinery item
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { startDate, endDate } = body;
    const farmerId = req.cookies.get('krishi_farmer_id')?.value;

    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer session missing. Log in to book.' }, { status: 401 });
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
    }

    // 1. Fetch listing details
    const listing = await prisma.equipmentListing.findUnique({
      where: { id }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Equipment listing not found' }, { status: 404 });
    }

    // 2. Extract dates to book
    const datesToBook: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      datesToBook.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    // 3. Verify calendar conflicts
    const bookedDates: string[] = JSON.parse(listing.availabilityCalendar || '[]');
    const isConflict = datesToBook.some(date => bookedDates.includes(date));

    if (isConflict) {
      return NextResponse.json({ error: 'Equipment is already booked during these dates' }, { status: 400 });
    }

    // 4. Create booking & update calendar in transaction
    const totalDays = datesToBook.length;
    const priceQuoted = listing.pricePerDay * totalDays;

    const result = await prisma.$transaction(async (tx) => {
      // Create booking record
      const booking = await tx.booking.create({
        data: {
          listingId: id,
          farmerId,
          startDate: start,
          endDate: end,
          status: 'confirmed',
          priceQuoted
        }
      });

      // Update listing's booked dates
      const updatedCalendar = [...bookedDates, ...datesToBook];
      await tx.equipmentListing.update({
        where: { id },
        data: {
          availabilityCalendar: JSON.stringify(updatedCalendar)
        }
      });

      // Create notification
      await tx.notification.create({
        data: {
          farmerId,
          type: 'booking',
          channel: 'in-app',
          content: `Equipment Rent Confirmed: Booked ${listing.equipmentType} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}. Total: ₹${priceQuoted}.`
        }
      });

      return booking;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error booking equipment:', error);
    return NextResponse.json({ error: 'Booking transaction failed', details: error.message }, { status: 500 });
  }
}
