import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateSpoilageRisk } from '@/lib/postharvest/riskModel';

const prisma = new PrismaClient();

// GET /api/postharvest/risk/[cropId] - Run spoilage risk predictor for a crop
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cropId: string }> }
) {
  try {
    const { cropId } = await params;

    // 1. Fetch Crop
    const crop = await prisma.crop.findUnique({
      where: { id: cropId }
    });

    if (!crop) {
      return NextResponse.json({ error: 'Crop record not found' }, { status: 404 });
    }

    // Determine days since sowing/harvest
    const diffTime = Math.abs(new Date().getTime() - new Date(crop.sownDate).getTime());
    const daysSinceSowing = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Simulate days since harvest if harvested, or treat as close to harvest
    const daysSinceHarvest = crop.currentStage === 'Harvested' ? 10 : 0;

    // 2. Run Spoilage Risk Model
    const risk = calculateSpoilageRisk({
      cropName: crop.cropName,
      daysSinceHarvest,
      humidity: 78,      // Mock ambient humidity
      temperature: 33,   // Mock ambient temperature
      isWarehouseStored: false
    });

    // 3. Save HarvestAdvisory record in database
    const advisory = await prisma.harvestAdvisory.create({
      data: {
        cropId: crop.id,
        spoilageRiskScore: risk.spoilageRiskScore,
        recommendedStorageDays: risk.recommendedStorageDays,
        recommendedAction: risk.recommendedAction,
        localPriceSnapshot: crop.cropName === 'Chili' ? 18200 : crop.cropName === 'Cotton' ? 7300 : 2150
      }
    });

    return NextResponse.json({
      advisory,
      riskResult: risk
    });
  } catch (error: any) {
    console.error('Error running risk advisor:', error);
    return NextResponse.json({ error: 'Risk model execution failed', details: error.message }, { status: 500 });
  }
}
