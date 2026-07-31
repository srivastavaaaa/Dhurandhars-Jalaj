// Static crop reference data. Expand this list as needed.

export const CROPS: Record<

  string,
  { season: string; sowing: string; harvest: string; tips: string }
> = {
  wheat: {
    season: "Rabi (winter)",
    sowing: "Late October to November",
    harvest: "March to April",
    tips: "Needs cool weather while growing and warm weather at harvest. Water at critical stages: crown root initiation (~21 days), tillering, and grain filling.",
  },
  rice: {
    season: "Kharif (monsoon)",
    sowing: "June to July (with monsoon)",
    harvest: "October to November",
    tips: "Needs standing water for most of the season. Transplant 25-30 day old seedlings for best yield. Watch for blast disease in humid conditions.",
  },
  maize: {
    season: "Kharif or Rabi (grown in both)",
    sowing: "June-July (Kharif) or October-November (Rabi)",
    harvest: "90-110 days after sowing",
    tips: "Needs well-drained soil. Avoid waterlogging. Apply nitrogen in split doses for better yield.",
  },
  cotton: {
    season: "Kharif",
    sowing: "April to June depending on region",
    harvest: "October to January (picked in multiple rounds)",
    tips: "Needs warm weather, 180-200 frost-free days. Watch for bollworm and whitefly — monitor weekly.",
  },
  soybean: {
    season: "Kharif",
    sowing: "June to July with onset of monsoon",
    harvest: "September to October",
    tips: "Needs well-drained soil, sensitive to waterlogging. Rotate with wheat/gram for soil health.",
  },
  sugarcane: {
    season: "Year-round planting (main season Oct-Nov and Feb-Mar)",
    sowing: "October-November (autumn) or February-March (spring)",
    harvest: "10-12 months after planting",
    tips: "Heavy water and nutrient requirement. Earthing up and proper spacing improve yield significantly.",
  },
  potato: {
    season: "Rabi",
    sowing: "October to November",
    harvest: "January to February (90-120 days)",
    tips: "Needs cool weather, well-drained loamy soil. Avoid water stress during tuber formation.",
  },
  tomato: {
    season: "Grown in multiple seasons depending on region",
    sowing: "Varies by region and variety",
    harvest: "60-90 days after transplanting",
    tips: "Needs staking for better yield and disease control. Watch for early/late blight in humid weather.",
  },
  onion: {
    season: "Rabi (main) and Kharif (some regions)",
    sowing: "October-November (Rabi)",
    harvest: "March-April (Rabi), 120-150 days after sowing",
    tips: "Needs well-drained soil, avoid waterlogging. Cure bulbs properly after harvest to reduce storage loss.",
  },
  gram: {
    season: "Rabi",
    sowing: "October to November",
    harvest: "February to March",
    tips: "Drought-tolerant, good rotation crop after rice. Avoid excess irrigation which increases vegetative growth over pod formation.",
  },
};

export function formatCropInfoReply(cropKey: string): string | null {
  const crop = CROPS[cropKey];
  if (!crop) return null;
  return (
    `*${cropKey.charAt(0).toUpperCase() + cropKey.slice(1)}*\n` +
    `Season: ${crop.season}\n` +
    `Sowing time: ${crop.sowing}\n` +
    `Harvest time: ${crop.harvest}\n` +
    `Tips: ${crop.tips}`
  );
}

export function findMentionedCrop(text: string): string | null {
  const lower = text.toLowerCase();
  for (const key of Object.keys(CROPS)) {
    if (lower.includes(key)) return key;
  }
  return null;
}
