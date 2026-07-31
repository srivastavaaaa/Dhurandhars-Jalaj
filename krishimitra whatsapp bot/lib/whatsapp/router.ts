import { formatSchemesReply } from "../knowledge/schemes";
import { formatCropInfoReply, findMentionedCrop, CROPS } from "../knowledge/crops";
import { formatEquipmentReply } from "../knowledge/equipment";
import { getCropAdviceReply } from "../weather";
import { askGemini } from "../ai/gemini";
import { getAwaiting, setAwaiting, clearAwaiting } from "./sessionState";

const SCHEME_KEYWORDS = ["scheme", "yojana", "sarkari", "government scheme", "subsidy", "pm kisan", "pmfby"];
const EQUIPMENT_KEYWORDS = ["equipment", "tractor", "rent", "rental", "machine", "harvester", "tiller", "rotavator"];
const WEATHER_CROP_KEYWORDS = ["which crop", "what crop", "should i plant", "should i sow", "weather", "season", "sow now", "grow now"];

const HELP_TEXT =
  `Namaste! I can help you with:\n\n` +
  `1️⃣ Government schemes\n` +
  `2️⃣ Crop advice for current weather\n` +
  `3️⃣ Equipment rental\n` +
  `4️⃣ Crop information\n\n` +
  `Reply with a number (1-4), or just type your question directly.`;

function includesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function extractLocation(text: string): string | null {
  const match = text.match(/\b(?:in|near|at)\s+([a-zA-Z\s]{3,25})/i);
  if (match) return match[1].trim();
  return null;
}

export async function routeFarmerQuestion(text: string, phone: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return HELP_TEXT;
  const lower = trimmed.toLowerCase();

  // If we're waiting on a follow-up answer, handle that first
  const awaiting = getAwaiting(phone);

  if (awaiting === "location") {
    clearAwaiting(phone);
    return await getCropAdviceReply(trimmed);
  }

  if (awaiting === "crop") {
    clearAwaiting(phone);
    const mentioned = findMentionedCrop(trimmed);
    if (mentioned) {
      const reply = formatCropInfoReply(mentioned);
      if (reply) return reply;
    }
    const available = Object.keys(CROPS).join(", ");
    return `I don't have info on "${trimmed}" yet. I currently know about: ${available}.`;
  }

  // Greetings / menu
  if (["hi", "hello", "hey", "namaste", "help", "menu"].includes(lower)) {
    return HELP_TEXT;
  }

  // Numbered menu selection
  if (lower === "1") {
    return formatSchemesReply();
  }
  if (lower === "2") {
    setAwaiting(phone, "location");
    return "Sure — what's your village or district name? I'll check current weather and suggest suitable crops.";
  }
  if (lower === "3") {
    return formatEquipmentReply();
  }
  if (lower === "4") {
    setAwaiting(phone, "crop");
    const available = Object.keys(CROPS).join(", ");
    return `Which crop would you like to know about? I currently know: ${available}.`;
  }

  // Free-text intent matching
  if (includesAny(trimmed, SCHEME_KEYWORDS)) {
    return formatSchemesReply();
  }

  if (includesAny(trimmed, EQUIPMENT_KEYWORDS)) {
    return formatEquipmentReply();
  }

  if (includesAny(trimmed, WEATHER_CROP_KEYWORDS)) {
    const location = extractLocation(trimmed);
    if (location) return await getCropAdviceReply(location);
    setAwaiting(phone, "location");
    return "Sure — what's your village or district name? I'll check current weather and suggest suitable crops.";
  }

  const mentionedCrop = findMentionedCrop(trimmed);
  if (mentionedCrop) {
    const reply = formatCropInfoReply(mentionedCrop);
    if (reply) return reply;
  }

  // ── Anything else: let Gemini answer it ──
  return await askGemini(trimmed);
}
