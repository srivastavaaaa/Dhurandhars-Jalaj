import { NextRequest, NextResponse } from 'next/server';
import { askAssistant } from '@/lib/ai/assistant';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, imageUrl, contentType, locale } = body;

    // Retrieve farmerId from cookies to supply context
    const farmerId = req.cookies.get('krishi_farmer_id')?.value || null;

    const result = await askAssistant({
      message,
      imageUrl,
      contentType: contentType || 'text',
      locale: locale || 'en',
      farmerId
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in chatbot endpoint:', error);
    return NextResponse.json({ error: 'Chat processing failed', details: error.message }, { status: 500 });
  }
}
