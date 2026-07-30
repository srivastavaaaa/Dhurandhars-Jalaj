import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/rentals/reviews - Create a rating review for a rented item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, reviewerId, rating, comment } = body;

    if (!listingId || !reviewerId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing review parameters' }, { status: 400 });
    }

    const review = await prisma.rentalReview.create({
      data: {
        listingId,
        reviewerId,
        rating: parseInt(rating),
        comment
      }
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
