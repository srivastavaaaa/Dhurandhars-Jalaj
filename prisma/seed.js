const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // 1. Clean existing data
  await prisma.notification.deleteMany();
  await prisma.reviewQueueItem.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.equipmentListing.deleteMany();
  await prisma.storageFacility.deleteMany();
  await prisma.harvestAdvisory.deleteMany();
  await prisma.cropDiagnosis.deleteMany();
  await prisma.schemeMatch.deleteMany();
  await prisma.scheme.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.farmer.deleteMany();

  console.log('Cleared existing tables.');

  // 2. Seed Schemes
  const schemes = [
    {
      name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      level: 'Central',
      description: 'An initiative by the Government of India that provides up to ₹6,000 per year in three equal installments to small and marginal farmers.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 5.0,
        states: [], // Applicable to all states
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify([
        'Aadhaar Card',
        'Land Ownership Documents (Jamabandi/RoR)',
        'Bank Account Details'
      ]),
      deadline: new Date('2026-12-31T23:59:59Z'),
      applyUrl: 'https://pmkisan.gov.in/',
      isActive: true,
      source: 'Ministry of Agriculture and Farmers Welfare'
    },
    {
      name: 'PM Fasal Bima Yojana (PMFBY)',
      level: 'Central',
      description: 'A government-sponsored crop insurance scheme that integrates multiple stakeholders to protect farmers against crop loss due to natural calamities.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 100.0,
        states: [],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify([
        'Land Sowing Certificate',
        'Aadhaar Card',
        'Bank Passbook copy',
        'Land tenancy agreement (for tenant farmers)'
      ]),
      deadline: new Date('2026-08-31T23:59:59Z'),
      applyUrl: 'https://pmfby.gov.in/',
      isActive: true,
      source: 'Ministry of Agriculture and Farmers Welfare'
    },
    {
      name: 'YSR Rythu Bharosa - PM Kisan',
      level: 'State',
      description: 'An Andhra Pradesh government program providing financial assistance of ₹13,500 per year to cultivator families, including tenant farmers.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 5.0,
        states: ['Andhra Pradesh'],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify([
        'Aadhaar Card',
        'Pattadar Passbook',
        'Bank Account Details',
        'Tenant agreement (if lease)'
      ]),
      deadline: new Date('2026-10-15T23:59:59Z'),
      applyUrl: 'https://ysrrythubharosa.ap.gov.in/',
      isActive: true,
      source: 'Government of Andhra Pradesh'
    },
    {
      name: 'MahaDBT Farmer Schemes (Tractor Subsidy)',
      level: 'State',
      description: 'Subsidy scheme under the Maharashtra government offering 40% to 50% subsidy on buying new agricultural machinery like tractors, rotavators, and tillers.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 7.5,
        states: ['Maharashtra'],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify([
        '7/12 Extract (Land record)',
        '8A Extract',
        'Quotations of machinery from authorized dealer',
        'Aadhaar Card'
      ]),
      deadline: new Date('2026-11-30T23:59:59Z'),
      applyUrl: 'https://mahadbt.maharashtra.gov.in/',
      isActive: true,
      source: 'Government of Maharashtra'
    }
  ];

  for (const s of schemes) {
    await prisma.scheme.create({ data: s });
  }
  console.log('Seeded Schemes.');

  // 3. Seed Storage Facilities
  const storageFacilities = [
    {
      name: 'Wardha Warehouse & Cold Storage Ltd.',
      district: 'Wardha',
      state: 'Maharashtra',
      location: 'Plot No. 12, MIDC Area, Sevagram Road, Wardha',
      capacity: '5000 Metric Tons',
      contactInfo: '+91 94221 87654',
      costPerUnit: 120.0, // ₹120 per quintal per month
      latitude: 20.7453,
      longitude: 78.6022
    },
    {
      name: 'Vidarbha Agri Preservation Hub',
      district: 'Wardha',
      state: 'Maharashtra',
      location: 'Near Railway Crossing, Deoli, Wardha',
      capacity: '2000 Metric Tons',
      contactInfo: '+91 94033 12123',
      costPerUnit: 110.0,
      latitude: 20.6588,
      longitude: 78.4764
    },
    {
      name: 'Guntur Spices Cold Storage',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      location: 'Guntur Chili Yard Bypass, Guntur',
      capacity: '12000 Metric Tons',
      contactInfo: '+91 86322 11445',
      costPerUnit: 150.0, // More expensive for Chili storage
      latitude: 16.3067,
      longitude: 80.4365
    },
    {
      name: 'Amaravati Farmer Storage Cooperative',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      location: 'Mangalagiri Road, Guntur District',
      capacity: '4000 Metric Tons',
      contactInfo: '+91 86325 99887',
      costPerUnit: 130.0,
      latitude: 16.4258,
      longitude: 80.5622
    }
  ];

  for (const f of storageFacilities) {
    await prisma.storageFacility.create({ data: f });
  }
  console.log('Seeded Storage Facilities.');

  // 4. Seed Equipment Listings (CHC - Custom Hiring Centers and Government Inventories)
  const equipmentListings = [
    {
      ownerId: null, // Institutional
      equipmentType: 'Tractor',
      location: 'Deoli CHC, Wardha District',
      district: 'Wardha',
      state: 'Maharashtra',
      pricePerDay: 1200.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'CHC',
      imageUrl: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400',
      latitude: 20.6588,
      longitude: 78.4764
    },
    {
      ownerId: null,
      equipmentType: 'Harvester',
      location: 'Wardha Block-1 CHC, Wardha',
      district: 'Wardha',
      state: 'Maharashtra',
      pricePerDay: 3500.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'government',
      imageUrl: 'https://images.unsplash.com/photo-1594498653385-d5172b53adc7?auto=format&fit=crop&q=80&w=400',
      latitude: 20.7453,
      longitude: 78.6022
    },
    {
      ownerId: null,
      equipmentType: 'Tiller',
      location: 'Seloo Farmer Service Coop, Wardha',
      district: 'Wardha',
      state: 'Maharashtra',
      pricePerDay: 600.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'CHC',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400',
      latitude: 20.8402,
      longitude: 78.7042
    },
    {
      ownerId: null,
      equipmentType: 'Tractor',
      location: 'Guntur Chili Market Yard CHC',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      pricePerDay: 1300.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'CHC',
      imageUrl: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400',
      latitude: 16.3067,
      longitude: 80.4365
    },
    {
      ownerId: null,
      equipmentType: 'Rotavator',
      location: 'Tenali CHC, Guntur District',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      pricePerDay: 800.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'government',
      imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400',
      latitude: 16.2435,
      longitude: 80.6433
    }
  ];

  for (const eq of equipmentListings) {
    await prisma.equipmentListing.create({ data: eq });
  }
  console.log('Seeded Equipment Listings.');

  // 5. Seed Agents
  const agents = [
    {
      name: 'Suresh Rao',
      role: 'extension worker',
      assignedRegion: 'Wardha',
      contactInfo: '+91 98901 23456'
    },
    {
      name: 'K. Venkatesh',
      role: 'FPO coordinator',
      assignedRegion: 'Guntur',
      contactInfo: '+91 89781 12233'
    }
  ];

  for (const a of agents) {
    await prisma.agent.create({ data: a });
  }
  console.log('Seeded Agents.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
