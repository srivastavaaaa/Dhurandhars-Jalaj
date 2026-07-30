export interface CropRiskParams {
  cropName: string;
  daysSinceHarvest: number;
  humidity: number; // percentage
  temperature: number; // in Celsius
  isWarehouseStored: boolean;
}

export interface RiskOutput {
  spoilageRiskScore: number; // 0 to 100
  recommendedStorageDays: number;
  recommendedAction: 'sell' | 'store';
  reasons: string[];
}

/**
 * Computes post-harvest spoilage risk and storage longevity guidelines
 */
export function calculateSpoilageRisk(params: CropRiskParams): RiskOutput {
  const { cropName, daysSinceHarvest, humidity, temperature, isWarehouseStored } = params;
  const reasons: string[] = [];
  let score = 0;
  let longevityDays = 0;

  // 1. Establish base crop risk and storage duration
  switch (cropName.toLowerCase()) {
    case 'cotton':
      score += 15;
      longevityDays = 180;
      reasons.push('Cotton has low natural spoilage rates under dry conditions.');
      break;
    case 'rice':
    case 'paddy':
      score += 30;
      longevityDays = 120;
      reasons.push('Paddy grain is susceptible to mold if moisture levels rise.');
      break;
    case 'wheat':
      score += 20;
      longevityDays = 150;
      reasons.push('Wheat grain holds well but requires insect pest control.');
      break;
    case 'chili':
      score += 40;
      longevityDays = 90;
      reasons.push('Red chilies require temperature control to retain color and spice index.');
      break;
    case 'sugarcane':
      score += 65;
      longevityDays = 7; // Extremely short shelf life once cut
      reasons.push('Sugarcane sucrose degrades rapidly within days post-harvest.');
      break;
    case 'turmeric':
      score += 15;
      longevityDays = 270;
      reasons.push('Processed turmeric has excellent natural shelf life.');
      break;
    default:
      score += 25;
      longevityDays = 60;
      reasons.push('Standard commodity base shelf life applied.');
  }

  // 2. Adjust for elapsed days
  if (daysSinceHarvest > 0) {
    const elapsedPercentage = daysSinceHarvest / longevityDays;
    const addedRisk = Math.round(elapsedPercentage * 50);
    score += addedRisk;
    if (addedRisk > 0) {
      reasons.push(`Elapsed storage time (${daysSinceHarvest} days) has increased risk by ${addedRisk}%.`);
    }
  }

  // 3. Adjust for temperature & humidity (weather factors)
  if (humidity > 70) {
    score += 15;
    reasons.push(`High ambient humidity (${humidity}%) encourages fungal growth.`);
  }
  if (temperature > 32) {
    score += 10;
    reasons.push(`High temperature (${temperature}°C) speeds up biological decay.`);
  }

  // 4. Adjust for storage environment
  if (isWarehouseStored) {
    score = Math.max(5, score - 20); // Warehouse reduces risk
    reasons.push('Stored in secure, dry cold storage facility (-20% risk reduction).');
  } else {
    score += 15;
    reasons.push('Stored in open/uncontrolled space, exposed to pests and humidity.');
  }

  // Clamp score
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine action
  // If shelf-life is nearing expiry or risk is high (>60%), recommend selling
  let recommendedAction: 'sell' | 'store' = 'store';
  if (finalScore >= 60 || daysSinceHarvest >= longevityDays * 0.8) {
    recommendedAction = 'sell';
  }

  // Adjust recommended storage days remaining
  const remainingDays = Math.max(0, longevityDays - daysSinceHarvest);

  return {
    spoilageRiskScore: finalScore,
    recommendedStorageDays: remainingDays,
    recommendedAction,
    reasons
  };
}
