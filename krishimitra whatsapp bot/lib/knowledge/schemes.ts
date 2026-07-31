// Static scheme data. In your full build (Section 4.3 of the spec) this
// moves into the Scheme table with structured eligibilityRules JSON.
// For now it's hardcoded so the bot can answer without a database.

export const SCHEMES = [
  {
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    summary:
      "₹6,000 per year paid directly to your bank account in 3 installments of ₹2,000 each. Open to all landholding farmer families, small or large.",
    howToApply: "Register at pmkisan.gov.in → Farmers Corner → New Farmer Registration, or visit your nearest Common Service Centre (CSC) for free help.",
  },
  {
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    summary:
      "Crop insurance against natural disasters, pests and disease. Premium is heavily subsidized — usually ₹100-300 per acre per season for wheat/paddy. If your crop fails, you're compensated, often within 60 days of harvest.",
    howToApply: "Apply through your bank (compulsory if you have a Kisan Credit Card loan on a notified crop, unless you opt out in writing 2 days before the deadline) or via pmfby.gov.in.",
  },
  {
    name: "KCC (Kisan Credit Card)",
    summary:
      "Farm credit up to ₹5 lakh at an effective interest rate of just 4% per year (after subsidies) for timely repayers. Covers crop production, post-harvest needs, and allied activities like dairy/poultry.",
    howToApply: "Apply at any nationalized or cooperative bank branch with land records and identity proof.",
  },
  {
    name: "PM-KMY (PM Kisan Maandhan Yojana)",
    summary:
      "Pension scheme for small/marginal farmers — ₹3,000/month after age 60, with a small monthly contribution while working.",
    howToApply: "Register at maandhan.in or through your nearest CSC.",
  },
  {
    name: "Soil Health Card Scheme",
    summary:
      "Free soil testing every 2 years, with specific fertilizer and nutrient recommendations for your land.",
    howToApply: "Contact your local Krishi Vigyan Kendra (KVK) or agriculture department office to get your soil tested.",
  },
  {
    name: "e-NAM (National Agriculture Market)",
    summary: "Online trading platform connecting you to buyers across India for better, more transparent prices than local mandis alone.",
    howToApply: "Ask your nearest registered mandi if it's e-NAM enabled, or register via enam.gov.in.",
  },
];

export function formatSchemesReply(): string {
  const lines = SCHEMES.map(
    (s, i) => `${i + 1}. *${s.name}*\n${s.summary}\nHow to apply: ${s.howToApply}`
  );
  return (
    `Here are the major central government schemes most farmers qualify for:\n\n` +
    lines.join("\n\n") +
    `\n\n_This is general information — final eligibility is confirmed by the scheme department. Reply with a scheme name for more detail._`
  );
}
