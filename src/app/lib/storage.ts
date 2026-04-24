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
  sellerId: string;
  listedAt: string;
  sold: boolean;
  imageUrl?: string;
  imageEmoji?: string;
};

// ===== User-scoped storage keys =====
// All data is now keyed by userId to prevent data leaking between accounts.
function userKey(base: string, userId?: string): string {
  if (!userId) {
    // try to read current user from session storage
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("archery_user");
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.id) return `${base}_${u.id}`;
        }
      } catch { /* fallback */ }
    }
    return base; // fallback (shouldn't happen)
  }
  return `${base}_${userId}`;
}

// Global (shared) keys
const STORE_KEY = "archery_store_listings";

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

// ===== Score Sessions (user-scoped) =====
export function getSessions(userId?: string): ScoreSession[] {
  return getJSON<ScoreSession[]>(userKey("archery_sessions", userId), []);
}

export function saveSession(session: ScoreSession, userId?: string): void {
  const key = userKey("archery_sessions", userId);
  const sessions = getJSON<ScoreSession[]>(key, []);
  sessions.unshift(session);
  setJSON(key, sessions);
}

export function deleteSession(id: string, userId?: string): void {
  const key = userKey("archery_sessions", userId);
  const sessions = getJSON<ScoreSession[]>(key, []);
  setJSON(key, sessions.filter(s => s.id !== id));
}

// ===== Equipment (user-scoped) =====
export function getEquipmentList(userId?: string): Equipment[] {
  return getJSON<Equipment[]>(userKey("archery_equipment", userId), []);
}

export function saveEquipment(eq: Equipment, userId?: string): void {
  const key = userKey("archery_equipment", userId);
  const list = getJSON<Equipment[]>(key, []);
  const idx = list.findIndex(e => e.id === eq.id);
  if (idx >= 0) {
    list[idx] = eq;
  } else {
    list.push(eq);
  }
  setJSON(key, list);
}

export function deleteEquipment(id: string, userId?: string): void {
  const key = userKey("archery_equipment", userId);
  const list = getJSON<Equipment[]>(key, []);
  setJSON(key, list.filter(e => e.id !== id));
}

// ===== Tuning History (user-scoped) =====
export function getTuningEntries(equipmentId?: string, userId?: string): TuningEntry[] {
  const entries = getJSON<TuningEntry[]>(userKey("archery_tuning", userId), []);
  if (equipmentId) return entries.filter(e => e.equipmentId === equipmentId);
  return entries;
}

export function saveTuningEntry(entry: TuningEntry, userId?: string): void {
  const key = userKey("archery_tuning", userId);
  const entries = getJSON<TuningEntry[]>(key, []);
  entries.unshift(entry);
  setJSON(key, entries);
}

// ===== Store Listings (global/shared) =====
function getDefaultListings(): StoreListing[] {
  return [
    { id: "default-1", name: "Hoyt Altus Compound Bow", description: "Brand new, 2025 model. 50lb draw weight.", priceKES: 185000, condition: "new", category: "Bows", sellerName: "Archery KE Store", sellerEmail: "store@archeryke.co.ke", sellerId: "system", listedAt: "2025-01-01", sold: false, imageUrl: "/products/compound_bow.png" },
    { id: "default-2", name: "Easton X10 Arrows (Dozen)", description: "Competition-grade carbon arrows. Spine 600.", priceKES: 95000, condition: "new", category: "Arrows", sellerName: "Archery KE Store", sellerEmail: "store@archeryke.co.ke", sellerId: "system", listedAt: "2025-01-01", sold: false, imageUrl: "/products/carbon_arrows.png" },
    { id: "default-3", name: "Shibuya Ultima Recurve Sight", description: "Premium recurve sight with micro-click adjustment.", priceKES: 42000, condition: "new", category: "Accessories", sellerName: "Archery KE Store", sellerEmail: "store@archeryke.co.ke", sellerId: "system", listedAt: "2025-01-01", sold: false, imageUrl: "/products/recurve_sight.png" },
    { id: "default-4", name: "Avalon Classic Barebow Tab", description: "Leather barebow shooting tab, medium size.", priceKES: 3500, condition: "new", category: "Accessories", sellerName: "Archery KE Store", sellerEmail: "store@archeryke.co.ke", sellerId: "system", listedAt: "2025-01-01", sold: false, imageUrl: "/products/barebow_tab.png" },
    { id: "default-5", name: "Cartel Midas Bow Stand", description: "Lightweight aluminium bow stand.", priceKES: 2500, condition: "new", category: "Accessories", sellerName: "Archery KE Store", sellerEmail: "store@archeryke.co.ke", sellerId: "system", listedAt: "2025-01-01", sold: false, imageUrl: "/products/bow_stand.png" },
    { id: "default-6", name: "Win & Win WIAWIS Limbs", description: "Carbon/foam limbs, 36lb medium.", priceKES: 78000, condition: "new", category: "Limbs", sellerName: "Archery KE Store", sellerEmail: "store@archeryke.co.ke", sellerId: "system", listedAt: "2025-01-01", sold: false, imageUrl: "/products/recurve_limbs.png" },
    { id: "default-7", name: "BCY 8125G Bow String", description: "High-performance bowstring material.", priceKES: 4500, condition: "new", category: "Strings", sellerName: "Archery KE Store", sellerEmail: "store@archeryke.co.ke", sellerId: "system", listedAt: "2025-01-01", sold: false, imageUrl: "/products/bow_string.png" },
    { id: "default-8", name: "Beiter Plunger Button", description: "Competition plunger button with micro-adjustment.", priceKES: 12000, condition: "new", category: "Accessories", sellerName: "Archery KE Store", sellerEmail: "store@archeryke.co.ke", sellerId: "system", listedAt: "2025-01-01", sold: false, imageUrl: "/products/plunger_button.png" },
  ];
}

export function getStoreListings(): StoreListing[] {
  const listings = getJSON<StoreListing[]>(STORE_KEY, []);
  if (listings.length === 0) {
    const defaults = getDefaultListings();
    setJSON(STORE_KEY, defaults);
    return defaults;
  }
  return listings.filter(l => !l.sold);
}

export function getAllStoreListings(): StoreListing[] {
  const listings = getJSON<StoreListing[]>(STORE_KEY, []);
  if (listings.length === 0) {
    const defaults = getDefaultListings();
    setJSON(STORE_KEY, defaults);
    return defaults;
  }
  return listings;
}

export function addStoreListing(listing: StoreListing): void {
  const listings = getJSON<StoreListing[]>(STORE_KEY, []);
  listings.unshift(listing);
  setJSON(STORE_KEY, listings);
}

export function markListingSold(id: string): void {
  const listings = getJSON<StoreListing[]>(STORE_KEY, []);
  const idx = listings.findIndex(l => l.id === id);
  if (idx >= 0) {
    listings[idx].sold = true;
    setJSON(STORE_KEY, listings);
  }
}

export function removeStoreListing(id: string): void {
  const listings = getJSON<StoreListing[]>(STORE_KEY, []);
  setJSON(STORE_KEY, listings.filter(l => l.id !== id));
}

// ===== Computed Stats =====
export function computeSessionStats(session: ScoreSession) {
  const totalArrows = session.ends.reduce((s, e) => s + e.arrows.length, 0);
  const maxScore = totalArrows * 10;
  const avgPerArrow = totalArrows > 0 ? session.totalScore / totalArrows : 0;
  return { totalArrows, maxScore, avgPerArrow, percentage: maxScore > 0 ? (session.totalScore / maxScore) * 100 : 0 };
}
