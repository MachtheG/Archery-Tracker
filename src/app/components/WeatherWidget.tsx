"use client";
import { useState, useEffect } from "react";
import { fetchWeather, getCurrentPosition, getWindDirectionLabel, getWeatherEmoji } from "../lib/weather";
import type { WeatherData } from "../lib/storage";

type Props = {
  weather: WeatherData;
  onChange: (w: WeatherData) => void;
};

export default function WeatherWidget({ weather, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAuto = async () => {
    setLoading(true);
    setError("");
    try {
      const pos = await getCurrentPosition();
      const result = await fetchWeather(pos.lat, pos.lon);
      onChange({
        temperature: result.temperature,
        windSpeed: result.windSpeed,
        windDirection: result.windDirection,
        humidity: result.humidity,
        conditions: result.conditions,
        isManual: false,
      });
    } catch (err: any) {
      setError(err.message || "Could not fetch weather. Use manual mode.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!weather.isManual && weather.temperature === undefined) {
      fetchAuto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleManual = () => {
    onChange({ ...weather, isManual: !weather.isManual });
  };

  if (weather.isManual) {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>🌤️ Conditions (Manual)</h3>
          <button onClick={toggleManual} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "3px 8px" }}>
            Auto-detect
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: 2 }}>Temp (°C)</label>
            <input className="input" type="number" value={weather.temperature ?? ""} onChange={e => onChange({ ...weather, temperature: +e.target.value })} placeholder="25" />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: 2 }}>Wind (km/h)</label>
            <input className="input" type="number" value={weather.windSpeed ?? ""} onChange={e => onChange({ ...weather, windSpeed: +e.target.value })} placeholder="10" />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: 2 }}>Wind Dir (°)</label>
            <input className="input" type="number" value={weather.windDirection ?? ""} onChange={e => onChange({ ...weather, windDirection: +e.target.value })} min={0} max={360} placeholder="180" />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: 2 }}>Humidity (%)</label>
            <input className="input" type="number" value={weather.humidity ?? ""} onChange={e => onChange({ ...weather, humidity: +e.target.value })} placeholder="50" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: 2 }}>Conditions</label>
            <input className="input" value={weather.conditions ?? ""} onChange={e => onChange({ ...weather, conditions: e.target.value })} placeholder="e.g. Partly cloudy, gusty" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>
          {weather.conditions ? getWeatherEmoji(weather.conditions) : "🌤️"} Weather
        </h3>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={fetchAuto} disabled={loading} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "3px 8px" }}>
            {loading ? "..." : "Refresh"}
          </button>
          <button onClick={toggleManual} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "3px 8px" }}>
            Manual
          </button>
        </div>
      </div>
      {error && <div className="error-text" style={{ marginBottom: 8 }}>{error}</div>}

      {weather.temperature !== undefined ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ textAlign: "center", padding: 8, background: "var(--bg-primary)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>{weather.temperature}°C</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Temperature</div>
          </div>
          <div style={{ textAlign: "center", padding: 8, background: "var(--bg-primary)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>{weather.windSpeed} <span style={{ fontSize: "0.7rem" }}>km/h</span></div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Wind {weather.windDirection !== undefined ? getWindDirectionLabel(weather.windDirection) : ""}
            </div>
          </div>
          <div style={{ textAlign: "center", padding: 8, background: "var(--bg-primary)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>{weather.humidity}%</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Humidity</div>
          </div>
          <div style={{ textAlign: "center", padding: 8, background: "var(--bg-primary)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.8 }}>{weather.conditions}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Conditions</div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 12, fontSize: "0.85rem" }}>
          {loading ? "Fetching weather..." : "Click Refresh to get weather from your location."}
        </div>
      )}
    </div>
  );
}
