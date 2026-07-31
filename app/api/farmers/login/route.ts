import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/farmers/login - Verify phone profile existence and set session cookies
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const farmer = await prisma.farmer.findUnique({
      where: { phone }
    });

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, farmer });
    
    // Set cookies to establish the session
    response.cookies.set('krishi_user_role', 'farmer', { path: '/', maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set('krishi_user_registered', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set('krishi_farmer_phone', phone, { path: '/', maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set('krishi_farmer_id', farmer.id, { path: '/', maxAge: 60 * 60 * 24 * 30 });

    return response;
  } catch (error: any) {
    console.error('Error logging in farmer:', error);
    return NextResponse.json({ error: 'Login verification failed' }, { status: 500 });
  }
}
