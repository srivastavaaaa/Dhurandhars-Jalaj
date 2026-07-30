import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.rentalBooking.findUnique({
      where: { id }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Rental booking not found' }, { status: 404 });
    }

    const txRef = 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create payment transaction
    const payment = await prisma.rentalPayment.create({
      data: {
        bookingId: id,
        amount: booking.totalPrice,
        status: 'completed',
        txRef
      }
    });

    // Update booking status
    const updatedBooking = await prisma.rentalBooking.update({
      where: { id },
      data: {
        paymentStatus: 'paid'
      }
    });

    return NextResponse.json({ booking: updatedBooking, payment });
  } catch (error: any) {
    console.error('Error processing rental payment:', error);
    return NextResponse.json({ error: 'Failed to process simulated payment' }, { status: 500 });
  }
}
