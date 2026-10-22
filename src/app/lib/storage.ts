import { apiUrl, authHeaders } from "./api";

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
  // Historical sessions imported without per-arrow detail (see /import-scores).
  // arrowsShot lets stats/leaderboard math work without a synthesized `ends` array.
  imported?: boolean;
  arrowsShot?: number;
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

// ===== Marketplace Store Listing =====
export type StoreListing = {
  id: string;
  name: string;
  description: string;
  priceKES: number;
  condition: "new" | "like-new" | "used" | "well-used";
  category: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  sellerId: string;
  listedAt: string;
  sold: boolean;
  imageUrl?: string;
  imageEmoji?: string;
};

// ===== Helpers =====
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("archery_token");
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), { headers: authHeaders(getToken()) });
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

async function apiSend<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders(getToken()) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} failed (${res.status})`);
  return res.json();
}

// ===== Score Sessions (server-side, scoped to the authenticated user) =====
type ApiSession = {
  id: string | number;
  date?: string;
  createdAt: string;
  ends?: End[];
  totals?: {
    roundId?: string;
    roundName?: string;
    distance?: number;
    targetFace?: string;
    totalScore?: number;
    xCount?: number;
    tenCount?: number;
    notes?: string;
    imported?: boolean;
    arrowsShot?: number;
  };
  environmental?: WeatherData;
  equipment?: { id?: string };
};

export async function getSessions(): Promise<ScoreSession[]> {
  try {
    const data = await apiGet<{ sessions: ApiSession[] }>("/api/sessions");
    return data.sessions.map((s) => ({
      id: s.id.toString(),
      date: (s.date || s.createdAt).toString().slice(0, 10),
      roundId: s.totals?.roundId || "",
      roundName: s.totals?.roundName || "Practice",
      distance: s.totals?.distance || 0,
      targetFace: s.totals?.targetFace || "",
      ends: s.ends || [],
      totalScore: s.totals?.totalScore || 0,
      xCount: s.totals?.xCount || 0,
      tenCount: s.totals?.tenCount || 0,
      weather: s.environmental || { isManual: false },
      equipmentId: s.equipment?.id,
      notes: s.totals?.notes || "",
      imported: s.totals?.imported || false,
      arrowsShot: s.totals?.arrowsShot,
    }));
  } catch {
    return [];
  }
}

export async function saveSession(session: ScoreSession): Promise<void> {
  await apiSend("/api/sessions", "POST", {
    sessionType: "practice",
    date: session.date,
    ends: session.ends,
    totals: {
      roundId: session.roundId,
      roundName: session.roundName,
      totalScore: session.totalScore,
      xCount: session.xCount,
      tenCount: session.tenCount,
      distance: session.distance,
      targetFace: session.targetFace,
      notes: session.notes,
      imported: session.imported || false,
      arrowsShot: session.arrowsShot,
    },
    environmental: session.weather,
    equipment: session.equipmentId ? { id: session.equipmentId } : undefined,
  });
}

// ===== Equipment (server-side, scoped to the authenticated user) =====
export async function getEquipmentList(): Promise<Equipment[]> {
  try {
    const data = await apiGet<{ equipment: Equipment[] }>("/api/equipment");
    return data.equipment;
  } catch {
    return [];
  }
}

export async function saveEquipment(eq: Partial<Equipment> & { name: string }): Promise<Equipment | null> {
  try {
    if (eq.id) {
      const data = await apiSend<{ equipment: Equipment }>(`/api/equipment/${eq.id}`, "PUT", eq);
      return data.equipment;
    }
    const data = await apiSend<{ equipment: Equipment }>("/api/equipment", "POST", eq);
    return data.equipment;
  } catch {
    return null;
  }
}

export async function deleteEquipment(id: string): Promise<void> {
  await apiSend(`/api/equipment/${id}`, "DELETE");
}

// ===== Tuning History (server-side, scoped to the authenticated user) =====
export async function getTuningEntries(equipmentId?: string): Promise<TuningEntry[]> {
  try {
    const qs = equipmentId ? `?equipmentId=${encodeURIComponent(equipmentId)}` : "";
    const data = await apiGet<{ tuning: TuningEntry[] }>(`/api/tuning${qs}`);
    return data.tuning;
  } catch {
    return [];
  }
}

export async function saveTuningEntry(entry: Omit<TuningEntry, "id">): Promise<void> {
  await apiSend("/api/tuning", "POST", entry);
}

// ===== Store Listings (server-side; public read, authenticated write) =====
export async function getStoreListings(): Promise<StoreListing[]> {
  try {
    const data = await apiGet<{ listings: StoreListing[] }>("/api/store");
    return data.listings;
  } catch {
    return [];
  }
}

export async function getAllStoreListings(): Promise<StoreListing[]> {
  try {
    const data = await apiGet<{ listings: StoreListing[] }>("/api/store/all");
    return data.listings;
  } catch {
    return [];
  }
}

export async function addStoreListing(listing: Omit<StoreListing, "id" | "listedAt" | "sold" | "sellerId" | "sellerName" | "sellerEmail">): Promise<void> {
  await apiSend("/api/store", "POST", listing);
}

export async function markListingSold(id: string): Promise<void> {
  await apiSend(`/api/store/${id}/sold`, "PATCH");
}

export async function removeStoreListing(id: string): Promise<void> {
  await apiSend(`/api/store/${id}`, "DELETE");
}

// ===== Computed Stats =====
export function computeSessionStats(session: ScoreSession) {
  const totalArrows = session.arrowsShot ?? session.ends.reduce((s, e) => s + e.arrows.length, 0);
  const maxScore = totalArrows * 10;
  const avgPerArrow = totalArrows > 0 ? session.totalScore / totalArrows : 0;
  return { totalArrows, maxScore, avgPerArrow, percentage: maxScore > 0 ? (session.totalScore / maxScore) * 100 : 0 };
}
