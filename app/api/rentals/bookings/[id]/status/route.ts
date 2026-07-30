import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body; // "confirmed" | "completed" | "cancelled"

    if (!status) {
      return NextResponse.json({ error: 'Missing status payload' }, { status: 400 });
    }

    const booking = await prisma.rentalBooking.findUnique({
      where: { id },
      include: { listing: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Rental booking not found' }, { status: 404 });
    }

    // Update status
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id },
      data: { status }
    });

    // If confirmed, add dates to the calendar
    if (status === 'confirmed') {
      const listing = booking.listing;
      let bookedDates: string[] = [];
      try {
        bookedDates = JSON.parse(listing.availabilityCalendar || '[]');
      } catch (e) {
        bookedDates = [];
      }

      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!bookedDates.includes(dateStr)) {
          bookedDates.push(dateStr);
        }
      }

      await prisma.rentalListing.update({
        where: { id: listing.id },
        data: {
          availabilityCalendar: JSON.stringify(bookedDates)
        }
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error('Error updating rental status:', error);
    return NextResponse.json({ error: 'Failed to update rental status' }, { status: 500 });
  }
}
