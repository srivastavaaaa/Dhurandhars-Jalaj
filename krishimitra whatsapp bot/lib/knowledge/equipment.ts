// Seeded institutional equipment data (CHC/government), matching the spec's
// cold-start strategy in Section 4.5. Replace district names with your real
// pilot districts. In the full build this becomes the EquipmentListing table.

export const EQUIPMENT_LISTINGS = [
  {
    type: "Tractor (35 HP)",
    district: "Balaghat",
    source: "Custom Hiring Centre (CHC)",
    pricePerDay: "₹800/day",
    contact: "Contact your local CHC office or Krishi Vigyan Kendra (KVK) Balaghat",
  },
  {
    type: "Rotavator",
    district: "Balaghat",
    source: "Custom Hiring Centre (CHC)",
    pricePerDay: "₹500/day",
    contact: "Contact your local CHC office or KVK Balaghat",
  },
  {
    type: "Combine Harvester",
    district: "Balaghat",
    source: "FPO-partner",
    pricePerDay: "₹2,200/day",
    contact: "Contact your FPO coordinator",
  },
  {
    type: "Power Tiller",
    district: "Seoni",
    source: "Custom Hiring Centre (CHC)",
    pricePerDay: "₹450/day",
    contact: "Contact your local CHC office or KVK Seoni",
  },
  {
    type: "Seed Drill",
    district: "Seoni",
    source: "Government (FARMS scheme)",
    pricePerDay: "₹300/day",
    contact: "Contact your local agriculture department office",
  },
];

export function formatEquipmentReply(): string {
  const lines = EQUIPMENT_LISTINGS.map(
    (e, i) =>
      `${i + 1}. *${e.type}* — ${e.district}\n${e.pricePerDay} | Source: ${e.source}\n${e.contact}`
  );
  return (
    `Here's equipment available for rent near our pilot districts:\n\n` +
    lines.join("\n\n") +
    `\n\n_Reply with your district name to filter results, or "book <equipment>" for booking help._`
  );
}
