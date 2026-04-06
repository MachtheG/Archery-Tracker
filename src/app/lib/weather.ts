export type WeatherResult = {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  conditions: string;
};

// Uses Open-Meteo free API (no API key required)
export async function fetchWeather(lat: number, lon: number): Promise<WeatherResult> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,weather_code`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather");
  const data = await res.json();

  return {
    temperature: data.current.temperature_2m,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    humidity: data.current.relative_humidity_2m,
    conditions: weatherCodeToDescription(data.current.weather_code),
  };
}

export function getCurrentPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}

export function getWindDirectionLabel(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function weatherCodeToDescription(code: number): string {
  // WMO Weather interpretation codes
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] || "Unknown";
}

export function getWeatherEmoji(conditions: string): string {
  const lower = conditions.toLowerCase();
  if (lower.includes("clear") || lower.includes("sunny")) return "☀️";
  if (lower.includes("partly")) return "⛅";
  if (lower.includes("cloud") || lower.includes("overcast")) return "☁️";
  if (lower.includes("rain") || lower.includes("drizzle")) return "🌧️";
  if (lower.includes("thunder")) return "⛈️";
  if (lower.includes("fog")) return "🌫️";
  if (lower.includes("snow")) return "❄️";
  return "🌤️";
}
