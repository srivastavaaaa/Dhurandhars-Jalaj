import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/farmers - Register a new farmer and create their farm + initial crop
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone,
      name,
      preferredLanguage,
      village,
      district,
      state,
      landSizeAcres,
      category,
      consentGiven,
      soilType,
      irrigationType,
      primaryCrop
    } = body;

    if (!phone || !name || !preferredLanguage || !district || !state || !consentGiven) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use a transaction to create the Farmer, their Farm, and their initial Crop
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Farmer
      const farmer = await tx.farmer.create({
        data: {
          phone,
          name,
          preferredLanguage,
          village,
          district,
          state,
          landSizeAcres: parseFloat(landSizeAcres) || 0,
          category,
          consentGiven: !!consentGiven,
        }
      });

      // 2. Create Farm
      const farm = await tx.farm.create({
        data: {
          farmerId: farmer.id,
          soilType: soilType || 'Loam',
          irrigationType: irrigationType || 'Rainfed',
        }
      });

      // 3. Create initial Crop if provided
      let crop = null;
      if (primaryCrop) {
        // Calculate expected harvest (e.g. 4 months from sowing)
        const sownDate = new Date();
        sownDate.setMonth(sownDate.getMonth() - 2); // Sown 2 months ago
        const expectedHarvestDate = new Date();
        expectedHarvestDate.setMonth(expectedHarvestDate.getMonth() + 2); // Harvest in 2 months

        crop = await tx.crop.create({
          data: {
            farmId: farm.id,
            cropName: primaryCrop,
            sownDate,
            expectedHarvestDate,
            currentStage: 'Vegetative',
            status: 'Healthy'
          }
        });
      }

      // 4. Trigger initial Government Scheme Match matches in the background
      // Find all schemes
      const schemes = await tx.scheme.findMany({ where: { isActive: true } });
      for (const scheme of schemes) {
        let matched = false;
        let score = 0;

        try {
          const rules = JSON.parse(scheme.eligibilityRules);
          
          // Deterministic scoring logic
          let matchCount = 0;
          let totalRules = 0;

          if (rules.maxLandAcres) {
            totalRules++;
            if (parseFloat(landSizeAcres) <= rules.maxLandAcres) {
              matchCount++;
            }
          }

          if (rules.states && rules.states.length > 0) {
            totalRules++;
            if (rules.states.includes(state)) {
              matchCount++;
            }
          }

          if (rules.categories && rules.categories.length > 0) {
            totalRules++;
            if (rules.categories.includes(category)) {
              matchCount++;
            }
          }

          score = totalRules > 0 ? (matchCount / totalRules) * 100 : 100;
          matched = score >= 50; // Match threshold 50%
        } catch (e) {
          score = 100;
          matched = true;
        }

        if (matched) {
          await tx.schemeMatch.create({
            data: {
              farmerId: farmer.id,
              schemeId: scheme.id,
              eligibilityScore: score,
              status: 'suggested'
            }
          });
        }
      }

      return { farmer, farm, crop };
    });

    const response = NextResponse.json({ success: true, data: result });
    
    // Set cookie on client to state they are logged in and registered
    response.cookies.set('krishi_user_role', 'farmer', { path: '/', maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set('krishi_user_registered', 'true', { path: '/', maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set('krishi_farmer_phone', phone, { path: '/', maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set('krishi_farmer_id', result.farmer.id, { path: '/', maxAge: 60 * 60 * 24 * 30 });

    return response;
  } catch (error: any) {
    console.error('Error creating farmer:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A farmer with this phone number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create farmer profile', details: error.message }, { status: 500 });
  }
}

// GET /api/farmers - Get all farmers (for Admin view)
export async function GET(req: NextRequest) {
  try {
    const farmers = await prisma.farmer.findMany({
      include: {
        farms: {
          include: {
            crops: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(farmers);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch farmers list', details: error.message }, { status: 500 });
  }
}
