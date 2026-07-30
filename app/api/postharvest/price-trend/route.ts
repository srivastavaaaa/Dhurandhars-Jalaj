import { NextRequest, NextResponse } from 'next/server';
import { getPriceTrends } from '@/lib/postharvest/priceAdvisor';

// GET /api/postharvest/price-trend?crop=&district=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const crop = searchParams.get('crop');
    const district = searchParams.get('district');

    if (!crop || !district) {
      return NextResponse.json({ error: 'crop and district parameters are required' }, { status: 400 });
    }

    const trends = getPriceTrends(crop, district);
    return NextResponse.json(trends);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch price trends', details: error.message }, { status: 500 });
  }
}
