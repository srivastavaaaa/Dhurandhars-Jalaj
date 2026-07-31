// Calls Google's Gemini API (free tier: ~1,500 requests/day, no card
// required) for open-ended questions the rule-based router can't match.
// Get a free key at https://aistudio.google.com -> "Get API key".

const SYSTEM_INSTRUCTION = `You are KrishiMitra, a helpful WhatsApp assistant for small and marginal
farmers in India. Answer clearly and simply, in short paragraphs or bullet
points (this is WhatsApp, not an essay). Focus on practical farming advice:
crops, pests, soil, irrigation, weather-related decisions, storage, and
general agricultural guidance.

Rules:
- If asked about government schemes, give general accurate info but always
  add: "Please confirm final details with your local agriculture office."
- If asked about specific local prices, equipment rental, or anything
  requiring real-time local data you cannot know, say so honestly and
  suggest contacting their local Krishi Vigyan Kendra (KVK) or agriculture
  department.
- Never invent specific scheme names, deadlines, or subsidy amounts you are
  not confident about.
- Keep replies under 150 words unless the question truly requires more.
- Reply in the same language the farmer used, if it's not English.`;

export async function askGemini(question: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return "AI assistant isn't configured yet. Please try one of the menu options (reply 'menu' to see them).";
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", errText);
      return "Sorry, I'm having trouble answering that right now. Please try again in a moment, or reply 'menu' for other options.";
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return text?.trim() || "Sorry, I couldn't generate an answer for that. Please try rephrasing, or reply 'menu' for other options.";
  } catch (err) {
    console.error("Gemini request failed:", err);
    return "Sorry, I'm having trouble answering that right now. Please try again in a moment.";
  }
}
