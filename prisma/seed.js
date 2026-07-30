const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with multi-state pilot data...');

  // 1. Clean existing tables
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

  console.log('Cleared all tables.');

  // 2. Seed Government Schemes (Central + State Specific for locales)
  const schemes = [
    // Central
    {
      name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      level: 'Central',
      description: 'Provides ₹6,000 per year in three equal installments directly to the bank accounts of small and marginal farmers.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 5.0,
        states: [],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify(['Aadhaar Card', 'Land Registry Jamabandi/RoR', 'Active Bank Passbook']),
      deadline: new Date('2026-12-31T23:59:59Z'),
      applyUrl: 'https://pmkisan.gov.in/',
      isActive: true,
      source: 'Ministry of Agriculture and Farmers Welfare'
    },
    {
      name: 'PM Fasal Bima Yojana (PMFBY)',
      level: 'Central',
      description: 'Crop insurance protection cover against yield losses due to natural disasters, pests, and local calamities.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 100.0,
        states: [],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify(['Sowing Certificate', 'Land Ownership Records', 'Aadhaar Card', 'Bank Passbook']),
      deadline: new Date('2026-08-15T23:59:59Z'),
      applyUrl: 'https://pmfby.gov.in/',
      isActive: true,
      source: 'Ministry of Agriculture and Farmers Welfare'
    },
    {
      name: 'PM Krishi Sinchayee Yojana (PMKSY) - Micro Irrigation',
      level: 'Central',
      description: 'Offers subsidies up to 55% to small/marginal farmers for installing drip and sprinkler irrigation systems.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 12.5,
        states: [],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify(['Land Map Layout', 'Water source certificate', 'Machinery quotation', 'Aadhaar Card']),
      deadline: new Date('2026-10-31T23:59:59Z'),
      applyUrl: 'https://pmksy.gov.in/',
      isActive: true,
      source: 'Department of Agriculture and Cooperation'
    },
    // Maharashtra (Marathi)
    {
      name: 'Namo Shetkari Mahasanman Nidhi Yojana',
      level: 'State',
      description: 'Maharashtra government addition of ₹6,000 per year matching the central PM-KISAN, totaling ₹12,000 for state farmers.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 5.0,
        states: ['Maharashtra'],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify(['PM-KISAN Registration ID', 'Aadhaar Card', '7/12 Extract', '8A Land record']),
      deadline: new Date('2026-12-15T23:59:59Z'),
      applyUrl: 'https://mahadbt.maharashtra.gov.in/',
      isActive: true,
      source: 'Government of Maharashtra'
    },
    // Andhra Pradesh (Telugu)
    {
      name: 'YSR Rythu Bharosa - PM Kisan',
      level: 'State',
      description: 'Financial benefit of ₹13,500 per year to cultivating farmer families in Andhra Pradesh, including tenant farmers.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 5.0,
        states: ['Andhra Pradesh'],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify(['Aadhaar Card', 'Pattadar Passbook', 'Tenant Lease Agreement (if applicable)']),
      deadline: new Date('2026-10-15T23:59:59Z'),
      applyUrl: 'https://ysrrythubharosa.ap.gov.in/',
      isActive: true,
      source: 'Government of Andhra Pradesh'
    },
    // Telangana (Telugu)
    {
      name: 'Rythu Bandhu (Investment Support)',
      level: 'State',
      description: 'Financial grant of ₹10,000 per acre per year to Telangana farmers to purchase seeds, fertilizers, and field inputs.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 25.0,
        states: ['Telangana'],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify(['New Pattadar Dharani Passbook', 'Bank Account details', 'Aadhaar Card']),
      deadline: new Date('2026-09-30T23:59:59Z'),
      applyUrl: 'https://rythubandhu.telangana.gov.in/',
      isActive: true,
      source: 'Government of Telangana'
    },
    // Tamil Nadu (Tamil)
    {
      name: 'Tamil Nadu Crop Loan Interest Subvention Scheme',
      level: 'State',
      description: 'Interest-free crop loans up to ₹3 Lakhs disbursed through co-operative banks for farmers repaying on time.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 10.0,
        states: ['Tamil Nadu'],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify(['Chitta/Adangal Land record', 'Aadhaar Card', 'Cooperative membership card']),
      deadline: new Date('2026-11-15T23:59:59Z'),
      applyUrl: 'https://www.tn.gov.in/departments/agri',
      isActive: true,
      source: 'Government of Tamil Nadu'
    },
    // Karnataka (Kannada)
    {
      name: 'Karnataka Krishi Bhagya Yojana',
      level: 'State',
      description: 'Subsidies up to 80% to set up farm ponds, polythene lining, diesel pumps, and micro-irrigation in dry rainfed zones.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 12.5,
        states: ['Karnataka'],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify(['RTC (Pahani) Land Record', 'Aadhaar Card', 'FRUITS ID Registry card']),
      deadline: new Date('2026-09-15T23:59:59Z'),
      applyUrl: 'https://fruits.karnataka.gov.in/',
      isActive: true,
      source: 'Government of Karnataka'
    },
    // Odisha (Odia)
    {
      name: 'KALIA Scheme (Krushak Assistance for Livelihood)',
      level: 'State',
      description: 'Direct financial assistance of ₹25,000 over five seasons for small/marginal farmers, plus support for landless workers.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 5.0,
        states: ['Odisha'],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify(['Aadhaar Card', 'Odisha Land RoR (Patta)', 'Ration Card copy']),
      deadline: new Date('2026-10-31T23:59:59Z'),
      applyUrl: 'https://kalia.odisha.gov.in/',
      isActive: true,
      source: 'Government of Odisha'
    },
    // Uttar Pradesh (Hindi)
    {
      name: 'UP Kisan Karj Mafi Yojana (Loan Waiver)',
      level: 'State',
      description: 'Waiver of agricultural crop loans up to ₹1,00,000 taken from state cooperative banks for marginal farmers.',
      eligibilityRules: JSON.stringify({
        maxLandAcres: 5.0,
        states: ['Uttar Pradesh'],
        categories: ['General', 'OBC', 'SC', 'ST']
      }),
      requiredDocuments: JSON.stringify(['Crop Loan Account Book', 'Aadhaar Card', 'Khatauni Land record']),
      deadline: new Date('2026-08-31T23:59:59Z'),
      applyUrl: 'https://upkisankarjrahat.upsdc.gov.in/',
      isActive: true,
      source: 'Government of Uttar Pradesh'
    }
  ];

  for (const s of schemes) {
    await prisma.scheme.create({ data: s });
  }
  console.log('Seeded 10 core Government Schemes.');

  // 3. Seed Storage Facilities (covering locales)
  const storageFacilities = [
    {
      name: 'Wardha Cold Storage Cooperative Ltd.',
      district: 'Wardha',
      state: 'Maharashtra',
      location: 'MIDC Phase-1, Sevagram Road, Wardha',
      capacity: '4,500 MT',
      contactInfo: '+91 94220 11223',
      costPerUnit: 120.0,
      latitude: 20.7453,
      longitude: 78.6022
    },
    {
      name: 'Guntur Chili Preservation Yard',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      location: 'Chili Bypass Ring Road, Guntur',
      capacity: '15,000 MT',
      contactInfo: '+91 86322 99887',
      costPerUnit: 155.0,
      latitude: 16.3067,
      longitude: 80.4365
    },
    {
      name: 'Warangal Grain Storage Warehouse',
      district: 'Warangal',
      state: 'Telangana',
      location: 'Enumamula Market Yard, Warangal',
      capacity: '8,000 MT',
      contactInfo: '+91 87024 33221',
      costPerUnit: 110.0,
      latitude: 18.0001,
      longitude: 79.5881
    },
    {
      name: 'Coimbatore Horticulture Preservation Unit',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      location: 'Mettupalayam Agri Market, Coimbatore',
      capacity: '6,000 MT',
      contactInfo: '+91 94430 45678',
      costPerUnit: 135.0,
      latitude: 11.0168,
      longitude: 76.9558
    },
    {
      name: 'Tumkur Coconut Cold Storage',
      district: 'Tumkur',
      state: 'Karnataka',
      location: 'APMC Yard, Tumkur City',
      capacity: '5,000 MT',
      contactInfo: '+91 81622 77665',
      costPerUnit: 125.0,
      latitude: 13.3379,
      longitude: 77.1173
    },
    {
      name: 'Cuttack Paddy Godown Hub',
      district: 'Cuttack',
      state: 'Odisha',
      location: 'Jagatpur Industrial Estate, Cuttack',
      capacity: '10,000 MT',
      contactInfo: '+91 67122 54321',
      costPerUnit: 100.0,
      latitude: 20.4625,
      longitude: 85.8793
    },
    {
      name: 'Bareilly Grain Storage & Cold House',
      district: 'Bareilly',
      state: 'Uttar Pradesh',
      location: 'Dohra Road, Near APMC, Bareilly',
      capacity: '7,500 MT',
      contactInfo: '+91 58123 99887',
      costPerUnit: 115.0,
      latitude: 28.364,
      longitude: 79.415
    }
  ];

  for (const f of storageFacilities) {
    await prisma.storageFacility.create({ data: f });
  }
  console.log('Seeded Storage Facilities across 6 regions.');

  // 4. Seed CHC and Peer Equipment Listings
  const equipmentListings = [
    // Maharashtra
    {
      ownerId: null,
      equipmentType: 'Tractor',
      location: 'Wardha CHC, Wardha',
      district: 'Wardha',
      state: 'Maharashtra',
      pricePerDay: 1200.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'CHC',
      imageUrl: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400',
      latitude: 20.7453,
      longitude: 78.6022
    },
    {
      ownerId: null,
      equipmentType: 'Harvester',
      location: 'Deoli Sub-center CHC, Wardha',
      district: 'Wardha',
      state: 'Maharashtra',
      pricePerDay: 3500.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'government',
      imageUrl: 'https://images.unsplash.com/photo-1594498653385-d5172b53adc7?auto=format&fit=crop&q=80&w=400',
      latitude: 20.6588,
      longitude: 78.4764
    },
    // Andhra Pradesh
    {
      ownerId: null,
      equipmentType: 'Tractor',
      location: 'Guntur Chili Yard CHC, Guntur',
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
      location: 'Tenali Government Seed Farm, Guntur',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      pricePerDay: 800.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'government',
      imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400',
      latitude: 16.2435,
      longitude: 80.6433
    },
    // Telangana
    {
      ownerId: null,
      equipmentType: 'Thresher',
      location: 'Warangal Main CHC, Telangana',
      district: 'Warangal',
      state: 'Telangana',
      pricePerDay: 1000.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'CHC',
      imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400',
      latitude: 18.0001,
      longitude: 79.5881
    },
    // Tamil Nadu
    {
      ownerId: null,
      equipmentType: 'Tiller',
      location: 'Coimbatore Cooperative CHC',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pricePerDay: 700.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'government',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400',
      latitude: 11.0168,
      longitude: 76.9558
    },
    // Karnataka
    {
      ownerId: null,
      equipmentType: 'Tractor',
      location: 'Tumkur CHC, Tumkur',
      district: 'Tumkur',
      state: 'Karnataka',
      pricePerDay: 1250.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'CHC',
      imageUrl: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400',
      latitude: 13.3379,
      longitude: 77.1173
    },
    // Odisha
    {
      ownerId: null,
      equipmentType: 'Rotavator',
      location: 'Cuttack Sadar block CHC',
      district: 'Cuttack',
      state: 'Odisha',
      pricePerDay: 850.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'CHC',
      imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400',
      latitude: 20.4625,
      longitude: 85.8793
    },
    // Uttar Pradesh
    {
      ownerId: null,
      equipmentType: 'Tractor',
      location: 'Bareilly Block-A CHC, Bareilly',
      district: 'Bareilly',
      state: 'Uttar Pradesh',
      pricePerDay: 1100.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'CHC',
      imageUrl: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400',
      latitude: 28.364,
      longitude: 79.415
    },
    {
      ownerId: null,
      equipmentType: 'Thresher',
      location: 'Bareilly Block-B CHC, Bareilly',
      district: 'Bareilly',
      state: 'Uttar Pradesh',
      pricePerDay: 950.0,
      availabilityCalendar: JSON.stringify([]),
      source: 'government',
      imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400',
      latitude: 28.375,
      longitude: 79.428
    }
  ];

  for (const eq of equipmentListings) {
    await prisma.equipmentListing.create({ data: eq });
  }
  console.log('Seeded CHC Equipment Listings for all 6 states.');

  // 5. Seed regional Extension Agents
  const agents = [
    { name: 'Suresh Rao', role: 'extension worker', assignedRegion: 'Wardha', contactInfo: '+91 98901 23456' },
    { name: 'K. Venkatesh', role: 'FPO coordinator', assignedRegion: 'Guntur', contactInfo: '+91 89781 12233' },
    { name: 'P. Srinivas', role: 'extension worker', assignedRegion: 'Warangal', contactInfo: '+91 88902 44332' },
    { name: 'M. Selvan', role: 'extension worker', assignedRegion: 'Coimbatore', contactInfo: '+91 99881 22334' },
    { name: 'H. Ramesh', role: 'FPO coordinator', assignedRegion: 'Tumkur', contactInfo: '+91 88772 33445' },
    { name: 'B. Senapati', role: 'extension worker', assignedRegion: 'Cuttack', contactInfo: '+91 77665 44321' },
    { name: 'R. P. Mishra', role: 'extension worker', assignedRegion: 'Bareilly', contactInfo: '+91 95400 11223' }
  ];

  for (const a of agents) {
    await prisma.agent.create({ data: a });
  }
  console.log('Seeded Extension Agents.');

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
