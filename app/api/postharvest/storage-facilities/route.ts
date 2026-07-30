import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/postharvest/storage-facilities?district=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district');

    if (!district) {
      return NextResponse.json({ error: 'District parameter is required' }, { status: 400 });
    }

    const facilities = await prisma.storageFacility.findMany({
      where: {
        district: {
          equals: district
        }
      }
    });

    return NextResponse.json(facilities);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch storage facilities', details: error.message }, { status: 500 });
  }
}
