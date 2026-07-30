import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const schemes = await prisma.scheme.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' }
    });
    return NextResponse.json(schemes);
  } catch (error: any) {
    console.error('Error fetching schemes:', error);
    return NextResponse.json({ error: 'Failed to fetch schemes' }, { status: 500 });
  }
}
