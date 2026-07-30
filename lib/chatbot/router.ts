export type UserIntent = 'scheme_check' | 'crop_diagnosis' | 'harvest_advice' | 'equipment_rent' | 'general';

interface RouteResult {
  intent: UserIntent;
  confidence: number;
}

export function classifyIntent(text: string, currentContext?: string): RouteResult {
  const t = text.toLowerCase();

  // 1. Check Crop Diagnosis intents (images are auto-routed, but text can express it too)
  if (
    t.includes('diagnose') ||
    t.includes('disease') ||
    t.includes('pest') ||
    t.includes('health') ||
    t.includes('leaf') ||
    t.includes('insect') ||
    t.includes('fungus') ||
    t.includes('spots') ||
    t.includes('बीमारी') ||
    t.includes('कीड़ा')
  ) {
    return { intent: 'crop_diagnosis', confidence: 0.9 };
  }

  // 2. Check Scheme Check intents
  if (
    t.includes('scheme') ||
    t.includes('yojana') ||
    t.includes('eligible') ||
    t.includes('subsidy') ||
    t.includes('government') ||
    t.includes('pm-kisan') ||
    t.includes('योजना') ||
    t.includes('सरकारी') ||
    t.includes('अनुदान')
  ) {
    return { intent: 'scheme_check', confidence: 0.95 };
  }

  // 3. Check Harvest Advice intents
  if (
    t.includes('harvest') ||
    t.includes('sell') ||
    t.includes('store') ||
    t.includes('spoil') ||
    t.includes('price') ||
    t.includes('mandi') ||
    t.includes('quintal') ||
    t.includes('कोल्ड स्टोरेज') ||
    t.includes('कटाई') ||
    t.includes('बेच')
  ) {
    return { intent: 'harvest_advice', confidence: 0.92 };
  }

  // 4. Check Equipment Rental intents
  if (
    t.includes('rent') ||
    t.includes('tractor') ||
    t.includes('tiller') ||
    t.includes('harvester') ||
    t.includes('rotavator') ||
    t.includes('booking') ||
    t.includes('chc') ||
    t.includes('किराया') ||
    t.includes('ट्रैक्टर')
  ) {
    return { intent: 'equipment_rent', confidence: 0.95 };
  }

  // Default fallback to context if available, otherwise general AI assistant
  if (currentContext) {
    return { intent: currentContext as UserIntent, confidence: 0.7 };
  }

  return { intent: 'general', confidence: 0.8 };
}
