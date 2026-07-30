import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/review-queue - Fetch all items in review queue
export async function GET(req: NextRequest) {
  try {
    const items = await prisma.reviewQueueItem.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Hydrate items with their respective reference data (CropDiagnosis details)
    const hydratedItems = await Promise.all(
      items.map(async (item) => {
        if (item.type === 'diagnosis') {
          const diagnosis = await prisma.cropDiagnosis.findUnique({
            where: { id: item.referenceId },
            include: {
              crop: {
                include: {
                  farm: {
                    include: {
                      farmer: true
                    }
                  }
                }
              }
            }
          });
          return { ...item, details: diagnosis };
        }
        return item;
      })
    );

    return NextResponse.json(hydratedItems);
  } catch (error: any) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json({ error: 'Failed to fetch review queue', details: error.message }, { status: 500 });
  }
}
