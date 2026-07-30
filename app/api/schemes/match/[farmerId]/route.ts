import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { evaluateSchemeEligibility } from '@/lib/schemes/matcher';

const prisma = new PrismaClient();

// GET /api/schemes/match/[farmerId] - Re-run and fetch matching schemes for farmer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ farmerId: string }> }
) {
  try {
    const { farmerId } = await params;

    // 1. Fetch Farmer + Farms + Crops
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        farms: {
          include: {
            crops: true
          }
        }
      }
    });

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const state = farmer.state;
    const landSizeAcres = farmer.landSizeAcres;
    const category = farmer.category;
    const crops = farmer.farms.flatMap(f => f.crops.map(c => c.cropName));

    // 2. Fetch all active schemes
    const schemes = await prisma.scheme.findMany({
      where: { isActive: true }
    });

    const matchesResult = [];

    // 3. Match each scheme
    for (const scheme of schemes) {
      const match = evaluateSchemeEligibility(scheme.eligibilityRules, {
        state,
        landSizeAcres,
        category,
        crops
      });

      if (match.eligible) {
        // Find or create match record
        let matchRecord = await prisma.schemeMatch.findFirst({
          where: { farmerId, schemeId: scheme.id }
        });

        if (matchRecord) {
          matchRecord = await prisma.schemeMatch.update({
            where: { id: matchRecord.id },
            data: {
              eligibilityScore: match.score
            }
          });
        } else {
          matchRecord = await prisma.schemeMatch.create({
            data: {
              farmerId,
              schemeId: scheme.id,
              eligibilityScore: match.score,
              status: 'suggested'
            }
          });
        }

        matchesResult.push({
          id: matchRecord.id,
          scheme,
          eligibilityScore: match.score,
          status: matchRecord.status,
          reasons: match.reasons
        });
      }
    }

    return NextResponse.json(matchesResult);
  } catch (error: any) {
    console.error('Error running matches:', error);
    return NextResponse.json({ error: 'Scheme matching execution failed', details: error.message }, { status: 500 });
  }
}
