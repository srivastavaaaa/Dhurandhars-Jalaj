// Open-Meteo is a free weather API that requires NO API key or signup.
// Docs: https://open-meteo.com/

type GeoResult = { name: string; latitude: number; longitude: number } | null;

async function geocodeLocation(place: string): Promise<GeoResult> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    place
  )}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const first = data?.results?.[0];
  if (!first) return null;
  return { name: first.name, latitude: first.latitude, longitude: first.longitude };
}

async function getForecast(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

// Very simple season detector by current month (India: Kharif/Rabi/Zaid).
function currentSeason(): "Kharif" | "Rabi" | "Zaid" {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return "Kharif";
  if (month >= 11 || month <= 2) return "Rabi";
  return "Zaid";
}

const SEASON_CROP_SUGGESTIONS: Record<string, string[]> = {
  Kharif: ["Rice", "Maize", "Cotton", "Soybean", "Groundnut", "Pigeon pea (arhar)"],
  Rabi: ["Wheat", "Gram (chana)", "Mustard", "Potato", "Onion", "Peas"],
  Zaid: ["Watermelon", "Cucumber", "Moong (green gram)", "Fodder crops"],
};

export async function getCropAdviceReply(locationText: string | null): Promise<string> {
  const season = currentSeason();
  const suggestions = SEASON_CROP_SUGGESTIONS[season];

  if (!locationText) {
    return (
      `Right now it's ${season} season. Commonly suitable crops: ${suggestions.join(
        ", "
      )}.\n\n` +
      `Tell me your village or district name and I'll check the current weather for a more specific recommendation.`
    );
  }

  try {
    const geo = await geocodeLocation(locationText);
    if (!geo) {
      return (
        `I couldn't find "${locationText}" — could you check the spelling or try a nearby bigger town?\n\n` +
        `Meanwhile, for ${season} season, commonly suitable crops are: ${suggestions.join(", ")}.`
      );
    }

    const forecast = await getForecast(geo.latitude, geo.longitude);
    if (!forecast) {
      return `Found ${geo.name}, but couldn't fetch weather right now. For ${season} season, consider: ${suggestions.join(", ")}.`;
    }

    const current = forecast.current;
    const rain3day = forecast.daily?.precipitation_sum?.reduce(
      (a: number, b: number) => a + b,
      0
    );

    let advice = `Weather for ${geo.name}: ${current.temperature_2m}°C, ${current.relative_humidity_2m}% humidity, ${current.precipitation}mm rain now.\n`;
    advice += `Next 3 days expected rainfall: ${rain3day?.toFixed(1) ?? "N/A"}mm.\n\n`;
    advice += `It's ${season} season. Based on current conditions, suitable crops: ${suggestions.join(", ")}.\n`;

    if (rain3day > 30) {
      advice += `\n⚠️ Heavy rain expected — delay sowing if not yet planted, and ensure drainage in your fields.`;
    } else if (rain3day < 2 && season === "Kharif") {
      advice += `\n⚠️ Low rainfall expected for monsoon season — consider irrigation backup if available.`;
    }

    return advice;
  } catch (err) {
    return `Couldn't fetch weather right now. For ${season} season, commonly suitable crops: ${suggestions.join(", ")}.`;
  }
}
