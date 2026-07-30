import { calculateSpoilageRisk } from '../lib/postharvest/riskModel';

export function testRiskModel() {
  console.log('Running Spoilage Risk Model tests...');

  // Test 1: Cotton base risk (low spoilage)
  const res1 = calculateSpoilageRisk({
    cropName: 'Cotton',
    daysSinceHarvest: 0,
    humidity: 50,
    temperature: 25,
    isWarehouseStored: false
  });
  // base Cotton risk: 15 + open storage: 15 = 30
  if (res1.spoilageRiskScore !== 30 || res1.recommendedAction !== 'store') {
    throw new Error(`Test 1 Failed: Expected risk score 30, got ${res1.spoilageRiskScore} and action ${res1.recommendedAction}`);
  }

  // Test 2: Sugarcane base risk (very high spoilage)
  const res2 = calculateSpoilageRisk({
    cropName: 'Sugarcane',
    daysSinceHarvest: 4,
    humidity: 50,
    temperature: 25,
    isWarehouseStored: false
  });
  // base Sugarcane: 65 + days elapsed + open storage: 15 -> should cross 60, action: 'sell'
  if (res2.spoilageRiskScore < 60 || res2.recommendedAction !== 'sell') {
    throw new Error(`Test 2 Failed: Expected risk > 60 and action 'sell', got ${res2.spoilageRiskScore} and ${res2.recommendedAction}`);
  }

  // Test 3: Warehouse reduction check
  const res3 = calculateSpoilageRisk({
    cropName: 'Rice',
    daysSinceHarvest: 10,
    humidity: 80, // high humidity (+15)
    temperature: 25,
    isWarehouseStored: true // warehouse (-20)
  });
  const res3WithoutWarehouse = calculateSpoilageRisk({
    cropName: 'Rice',
    daysSinceHarvest: 10,
    humidity: 80,
    temperature: 25,
    isWarehouseStored: false // open (+15)
  });

  if (res3.spoilageRiskScore >= res3WithoutWarehouse.spoilageRiskScore) {
    throw new Error(`Test 3 Failed: Warehouse storage did not reduce risk score. Warehouse: ${res3.spoilageRiskScore}, Open: ${res3WithoutWarehouse.spoilageRiskScore}`);
  }

  console.log('✅ Spoilage Risk Model tests passed successfully!');
}
