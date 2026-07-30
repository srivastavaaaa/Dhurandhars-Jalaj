import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/schemes/[id]/apply - Apply for a matched government scheme
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Scheme id or SchemeMatch id
    const farmerId = req.cookies.get('krishi_farmer_id')?.value;

    if (!farmerId) {
      return NextResponse.json({ error: 'Farmer session missing' }, { status: 401 });
    }

    // Find the SchemeMatch record
    const match = await prisma.schemeMatch.findFirst({
      where: {
        farmerId,
        schemeId: id
      }
    });

    if (!match) {
      return NextResponse.json({ error: 'Scheme match not found for this farmer' }, { status: 404 });
    }

    // Update status to 'applied'
    const updatedMatch = await prisma.schemeMatch.update({
      where: { id: match.id },
      data: {
        status: 'applied',
        matchedAt: new Date() // Treat as date of application update
      }
    });

    // Create an in-app notification
    await prisma.notification.create({
      data: {
        farmerId,
        type: 'scheme',
        channel: 'in-app',
        content: `Application status updated: You have applied for "${(await prisma.scheme.findUnique({ where: { id } }))?.name}".`
      }
    });

    return NextResponse.json({ success: true, data: updatedMatch });
  } catch (error: any) {
    console.error('Error applying for scheme:', error);
    return NextResponse.json({ error: 'Failed to apply for scheme', details: error.message }, { status: 500 });
  }
}
