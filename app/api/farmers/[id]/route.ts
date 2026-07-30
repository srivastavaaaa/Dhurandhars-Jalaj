import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/farmers/[id] - Fetch detailed farmer profile
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const farmer = await prisma.farmer.findUnique({
      where: { id },
      include: {
        farms: {
          include: {
            crops: true
          }
        },
        schemeMatches: {
          include: {
            scheme: true
          }
        }
      }
    });

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    return NextResponse.json(farmer);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch farmer profile', details: error.message }, { status: 500 });
  }
}

// PATCH /api/farmers/[id] - Update farmer profile
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, preferredLanguage, village, district, state, landSizeAcres, category } = body;

    const updatedFarmer = await prisma.farmer.update({
      where: { id },
      data: {
        name,
        preferredLanguage,
        village,
        district,
        state,
        landSizeAcres: landSizeAcres !== undefined ? parseFloat(landSizeAcres) : undefined,
        category
      }
    });

    return NextResponse.json(updatedFarmer);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update farmer profile', details: error.message }, { status: 500 });
  }
}
