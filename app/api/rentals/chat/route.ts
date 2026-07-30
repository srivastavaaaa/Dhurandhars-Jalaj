import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/rentals/chat?bookingId=... - Retrieve conversation history for a booking
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId parameter' }, { status: 400 });
    }

    const messages = await prisma.rentalChat.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/rentals/chat - Send a new chat message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, senderId, senderRole, message } = body;

    if (!bookingId || !senderId || !senderRole || !message) {
      return NextResponse.json({ error: 'Missing message parameters' }, { status: 400 });
    }

    const chatMessage = await prisma.rentalChat.create({
      data: {
        bookingId,
        senderId,
        senderRole,
        message
      }
    });

    return NextResponse.json(chatMessage);
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
