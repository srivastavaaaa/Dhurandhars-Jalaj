import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ farmerId: string }> }
) {
  try {
    const { farmerId } = await params;

    // 1. Bookings placed by the farmer (as Renter)
    const renterBookings = await prisma.rentalBooking.findMany({
      where: { renterId: farmerId },
      include: {
        listing: {
          include: {
            owner: {
              select: {
                name: true,
                phone: true,
                village: true,
                district: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Bookings on listings owned by this farmer (as Owner)
    const ownerBookings = await prisma.rentalBooking.findMany({
      where: {
        listing: {
          ownerId: farmerId
        }
      },
      include: {
        listing: true,
        renter: {
          select: {
            name: true,
            phone: true,
            village: true,
            district: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Listings owned by this farmer
    const ownedListings = await prisma.rentalListing.findMany({
      where: { ownerId: farmerId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ renterBookings, ownerBookings, ownedListings });
  } catch (error: any) {
    console.error('Error fetching farmer bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings ledger' }, { status: 500 });
  }
}
