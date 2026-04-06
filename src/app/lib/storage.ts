// ===== Data Types =====

export type ArrowScore = {
  value: number; // 0 = miss, 1-10
  isX: boolean;
  position?: { x: number; y: number }; // SVG coords on virtual target
};

export type End = {
  arrows: ArrowScore[];
};

export type WeatherData = {
  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
  humidity?: number;
  conditions?: string;
  isManual: boolean;
};

export type ScoreSession = {
  id: string;
  date: string;
  roundId: string;
  roundName: string;
  distance: number;
  targetFace: string;
  ends: End[];
  totalScore: number;
  xCount: number;
  tenCount: number;
  weather: WeatherData;
  equipmentId?: string;
  notes: string;
};

export type Equipment = {
  id: string;
  name: string;
  bowType: "recurve" | "compound" | "barebow";
  drawWeight: string;
  braceHeight: string;
  tiller: string;
  arrowType: string;
  arrowSpine: string;
  arrowLength: string;
  sightSettings: string;
  notes: string;
  createdAt: string;
};

export type TuningEntry = {
  id: string;
  equipmentId: string;
  date: string;
  change: string;
  impact: string;
  notes: string;
};

// ===== localStorage Keys =====
const SESSIONS_KEY = "archery_score_sessions";
const EQUIPMENT_KEY = "archery_equipment_sets";
const TUNING_KEY = "archery_tuning_entries";

// ===== Helpers =====
function getJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== Score Sessions =====
export function getSessions(): ScoreSession[] {
  const sessions = getJSON<ScoreSession[]>(SESSIONS_KEY, []);
  // If empty, seed with sample data
  if (sessions.length === 0) {
    const seeded = generateSeedSessions();
    setJSON(SESSIONS_KEY, seeded);
    return seeded;
  }
  return sessions;
}

export function saveSession(session: ScoreSession): void {
  const sessions = getJSON<ScoreSession[]>(SESSIONS_KEY, []);
  sessions.unshift(session);
  setJSON(SESSIONS_KEY, sessions);
}

export function deleteSession(id: string): void {
  const sessions = getJSON<ScoreSession[]>(SESSIONS_KEY, []);
  setJSON(SESSIONS_KEY, sessions.filter(s => s.id !== id));
}

// ===== Equipment =====
export function getEquipmentList(): Equipment[] {
  return getJSON<Equipment[]>(EQUIPMENT_KEY, []);
}

export function saveEquipment(eq: Equipment): void {
  const list = getJSON<Equipment[]>(EQUIPMENT_KEY, []);
  const idx = list.findIndex(e => e.id === eq.id);
  if (idx >= 0) {
    list[idx] = eq;
  } else {
    list.push(eq);
  }
  setJSON(EQUIPMENT_KEY, list);
}

export function deleteEquipment(id: string): void {
  const list = getJSON<Equipment[]>(EQUIPMENT_KEY, []);
  setJSON(EQUIPMENT_KEY, list.filter(e => e.id !== id));
}

// ===== Tuning History =====
export function getTuningEntries(equipmentId?: string): TuningEntry[] {
  const entries = getJSON<TuningEntry[]>(TUNING_KEY, []);
  if (equipmentId) return entries.filter(e => e.equipmentId === equipmentId);
  return entries;
}

export function saveTuningEntry(entry: TuningEntry): void {
  const entries = getJSON<TuningEntry[]>(TUNING_KEY, []);
  entries.unshift(entry);
  setJSON(TUNING_KEY, entries);
}

// ===== Seed Data =====
function generateSeedSessions(): ScoreSession[] {
  const sessions: ScoreSession[] = [];
  const distances = [18, 50, 70];
  const roundNames: Record<number, string> = { 18: "WA 18m Indoor", 50: "WA 50m", 70: "WA 70m" };
  const faces: Record<number, string> = { 18: "40cm", 50: "80cm", 70: "122cm" };

  // Generate 12 sample sessions over the past 3 months
  for (let i = 0; i < 12; i++) {
    const daysAgo = Math.floor(i * 7 + Math.random() * 5);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dist = distances[i % 3];
    const arrowsPerEnd = dist === 18 ? 3 : 6;
    const totalEnds = dist === 18 ? 20 : 12;
    const baseAvg = dist === 70 ? 7.5 : dist === 50 ? 8.0 : 8.5;
    const improvement = (12 - i) * 0.05; // slight improvement over time

    const ends: End[] = [];
    let totalScore = 0;
    let xCount = 0;
    let tenCount = 0;

    for (let e = 0; e < totalEnds; e++) {
      const arrows: ArrowScore[] = [];
      for (let a = 0; a < arrowsPerEnd; a++) {
        const val = Math.min(10, Math.max(0, Math.round(baseAvg + improvement + (Math.random() - 0.5) * 4)));
        const isX = val === 10 && Math.random() > 0.7;
        arrows.push({ value: val, isX });
        totalScore += val;
        if (isX) xCount++;
        if (val === 10) tenCount++;
      }
      ends.push({ arrows });
    }

    sessions.push({
      id: `seed-${i}`,
      date: date.toISOString().slice(0, 10),
      roundId: `wa-${dist}m`,
      roundName: roundNames[dist],
      distance: dist,
      targetFace: faces[dist],
      ends,
      totalScore,
      xCount,
      tenCount,
      weather: {
        temperature: 20 + Math.round(Math.random() * 10),
        windSpeed: Math.round(Math.random() * 20),
        windDirection: Math.round(Math.random() * 360),
        humidity: 40 + Math.round(Math.random() * 40),
        conditions: ["Clear sky", "Partly cloudy", "Overcast"][Math.floor(Math.random() * 3)],
        isManual: false,
      },
      notes: "",
    });
  }

  return sessions.sort((a, b) => b.date.localeCompare(a.date));
}

// ===== Computed Stats =====
export function computeSessionStats(session: ScoreSession) {
  const totalArrows = session.ends.reduce((s, e) => s + e.arrows.length, 0);
  const maxScore = totalArrows * 10;
  const avgPerArrow = totalArrows > 0 ? session.totalScore / totalArrows : 0;
  return { totalArrows, maxScore, avgPerArrow, percentage: maxScore > 0 ? (session.totalScore / maxScore) * 100 : 0 };
}
