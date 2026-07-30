export interface PriceTrendPoint {
  month: string;
  price: number; // INR per quintal
}

export interface PriceAdvice {
  currentMandiPrice: number;
  averageHistoricalPrice: number;
  trendDirection: 'up' | 'down' | 'flat';
  trendPoints: PriceTrendPoint[];
}

/**
 * Returns mandi pricing insights and historical trend data for regional crop varieties
 */
export function getPriceTrends(cropName: string, district: string): PriceAdvice {
  // Setup realistic mandi benchmarks
  let basePrice = 2100; // Wheat default
  if (cropName.toLowerCase() === 'cotton') {
    basePrice = 7200;
  } else if (cropName.toLowerCase() === 'chili') {
    basePrice = 18000;
  } else if (cropName.toLowerCase() === 'rice' || cropName.toLowerCase() === 'paddy') {
    basePrice = 2300;
  } else if (cropName.toLowerCase() === 'sugarcane') {
    basePrice = 315; // Sugarcane is priced lower per quintal (heavy tonnage)
  } else if (cropName.toLowerCase() === 'turmeric') {
    basePrice = 6800;
  }

  // Generate 6-month historical trend
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const trendPoints: PriceTrendPoint[] = [];

  // Simulate an upward trend for chili and cotton due to seasonal demand, flat/down for grains
  const isUpward = cropName.toLowerCase() === 'chili' || cropName.toLowerCase() === 'cotton';
  const trendDirection = isUpward ? 'up' : 'flat';

  let runningPrice = basePrice * 0.9;
  for (let i = 0; i < months.length; i++) {
    const change = isUpward 
      ? (runningPrice * (0.02 + Math.random() * 0.03)) // 2-5% increase
      : (runningPrice * (-0.01 + Math.random() * 0.02)); // -1% to 1% fluctuation
    
    runningPrice = Math.round(runningPrice + change);
    trendPoints.push({
      month: months[i],
      price: runningPrice
    });
  }

  const currentMandiPrice = trendPoints[trendPoints.length - 1].price;
  const averageHistoricalPrice = Math.round(trendPoints.reduce((acc, p) => acc + p.price, 0) / trendPoints.length);

  return {
    currentMandiPrice,
    averageHistoricalPrice,
    trendDirection,
    trendPoints
  };
}
