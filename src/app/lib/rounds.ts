// ===== Official World Archery Target Colors (Pantone) =====
const WA_GOLD   = "#FFE552"; // Pantone 107
const WA_RED    = "#F65058"; // Pantone 032
const WA_BLUE   = "#00B4E4"; // Pantone 306
const WA_BLACK  = "#000000";
const WA_WHITE  = "#FFFFFF";
const FIELD_YELLOW = "#FFE552";
const FIELD_BLACK  = "#1A1A1A";

// ===== Target Face Configurations =====
export type TargetRing = {
  score: number;
  fill: string;
  stroke: string;
  textColor: string; // for score buttons
};

export type TargetFaceConfig = {
  id: string;
  name: string;
  rings: TargetRing[]; // from OUTSIDE (lowest score) to INSIDE (highest score)
  hasXRing: boolean;
  xRingFraction: number; // fraction of innermost ring radius that counts as X
  missScore: number;
  maxArrowScore: number;
  bgFill: string;
};

export const TARGET_FACES: Record<string, TargetFaceConfig> = {
  // ── Standard 10-ring (Recurve / Barebow) ──
  "standard-10": {
    id: "standard-10",
    name: "Standard 10-Ring",
    rings: [
      { score: 1, fill: WA_WHITE, stroke: "#999", textColor: "#111" },
      { score: 2, fill: WA_WHITE, stroke: "#999", textColor: "#111" },
      { score: 3, fill: WA_BLACK, stroke: "#333", textColor: "#fff" },
      { score: 4, fill: WA_BLACK, stroke: "#333", textColor: "#fff" },
      { score: 5, fill: WA_BLUE,  stroke: "#0088bb", textColor: "#fff" },
      { score: 6, fill: WA_BLUE,  stroke: "#0088bb", textColor: "#fff" },
      { score: 7, fill: WA_RED,   stroke: "#c01020", textColor: "#fff" },
      { score: 8, fill: WA_RED,   stroke: "#c01020", textColor: "#fff" },
      { score: 9, fill: WA_GOLD,  stroke: "#ccaa00", textColor: "#111" },
      { score: 10, fill: WA_GOLD, stroke: "#ccaa00", textColor: "#111" },
    ],
    hasXRing: true,
    xRingFraction: 0.5,
    missScore: 0,
    maxArrowScore: 10,
    bgFill: "#e8e5e0",
  },

  // ── Compound 6-Ring (Inner 10) ──
  // Only rings 5-10 are visible. X-ring is smaller.
  "compound-6": {
    id: "compound-6",
    name: "Compound Inner 10",
    rings: [
      { score: 5, fill: WA_BLUE,  stroke: "#0088bb", textColor: "#fff" },
      { score: 6, fill: WA_BLUE,  stroke: "#0088bb", textColor: "#fff" },
      { score: 7, fill: WA_RED,   stroke: "#c01020", textColor: "#fff" },
      { score: 8, fill: WA_RED,   stroke: "#c01020", textColor: "#fff" },
      { score: 9, fill: WA_GOLD,  stroke: "#ccaa00", textColor: "#111" },
      { score: 10, fill: WA_GOLD, stroke: "#ccaa00", textColor: "#111" },
    ],
    hasXRing: true,
    xRingFraction: 0.25, // Compound X-ring is much smaller than recurve
    missScore: 0,
    maxArrowScore: 10,
    bgFill: "#e8e5e0",
  },

  // ── Field Archery (4-zone: 3-4 black, 5-6 yellow) ──
  "field-4": {
    id: "field-4",
    name: "Field Target",
    rings: [
      { score: 3, fill: FIELD_BLACK,  stroke: "#333", textColor: "#fff" },
      { score: 4, fill: FIELD_BLACK,  stroke: "#333", textColor: "#fff" },
      { score: 5, fill: FIELD_YELLOW, stroke: "#ccaa00", textColor: "#111" },
      { score: 6, fill: FIELD_YELLOW, stroke: "#ccaa00", textColor: "#111" },
    ],
    hasXRing: false,
    xRingFraction: 0,
    missScore: 0,
    maxArrowScore: 6,
    bgFill: "#d5d0c8",
  },
};

export function getTargetFace(id: string): TargetFaceConfig {
  return TARGET_FACES[id] || TARGET_FACES["standard-10"];
}

// ===== Score Values per Target Face =====
export type ScoreValue = { label: string; value: number; isX: boolean };

export function getScoreValues(faceId: string): ScoreValue[] {
  const face = getTargetFace(faceId);
  const values: ScoreValue[] = [];

  if (face.hasXRing) {
    values.push({ label: "X", value: face.maxArrowScore, isX: true });
  }

  // Add ring scores from highest to lowest
  const scores = [...new Set(face.rings.map(r => r.score))].sort((a, b) => b - a);
  scores.forEach(s => values.push({ label: String(s), value: s, isX: false }));

  values.push({ label: "M", value: 0, isX: false });
  return values;
}

// Get button color for a given score on a given target face
export function getScoreColor(faceId: string, value: number, isX: boolean): { bg: string; text: string } {
  const face = getTargetFace(faceId);
  if (value === 0) return { bg: "#ccc", text: "#111" };
  const ring = face.rings.find(r => r.score === value) || face.rings[face.rings.length - 1];
  if (isX) {
    const inner = face.rings[face.rings.length - 1];
    return { bg: inner.fill, text: inner.textColor };
  }
  return { bg: ring.fill, text: ring.textColor };
}

// ===== Round Definitions =====
export type Round = {
  id: string;
  name: string;
  distance: number;
  targetFace: string;        // size label, e.g. "122cm", "80cm"
  targetFaceType: string;    // key into TARGET_FACES
  discipline: "recurve" | "compound" | "barebow" | "field";
  arrowsPerEnd: number;
  totalEnds: number;
  maxScore: number;
  category: "outdoor" | "indoor" | "field" | "practice";
  description: string;
};

export const ROUNDS: Round[] = [
  // ═══ RECURVE OUTDOOR ═══
  {
    id: "recurve-70m",
    name: "Recurve 70m Outdoor",
    distance: 70,
    targetFace: "122cm",
    targetFaceType: "standard-10",
    discipline: "recurve",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "Standard WA recurve outdoor ranking round. 72 arrows at 70m on 122cm face.",
  },
  {
    id: "recurve-60m",
    name: "Recurve 60m Outdoor",
    distance: 60,
    targetFace: "122cm",
    targetFaceType: "standard-10",
    discipline: "recurve",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "WA 60m recurve ranking round. 72 arrows on 122cm face.",
  },
  {
    id: "recurve-50m",
    name: "Recurve 50m Outdoor",
    distance: 50,
    targetFace: "80cm",
    targetFaceType: "standard-10",
    discipline: "recurve",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "WA 50m recurve round on 80cm face. 72 arrows.",
  },
  {
    id: "recurve-30m",
    name: "Recurve 30m",
    distance: 30,
    targetFace: "80cm",
    targetFaceType: "standard-10",
    discipline: "recurve",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "WA 30m round for beginners and juniors. 72 arrows.",
  },

  // ═══ RECURVE INDOOR ═══
  {
    id: "recurve-18m-indoor",
    name: "Recurve 18m Indoor",
    distance: 18,
    targetFace: "40cm",
    targetFaceType: "standard-10",
    discipline: "recurve",
    arrowsPerEnd: 3,
    totalEnds: 20,
    maxScore: 600,
    category: "indoor",
    description: "Standard WA indoor round. 60 arrows at 18m, 3 arrows per end on 40cm face.",
  },
  {
    id: "recurve-25m-indoor",
    name: "Recurve 25m Indoor",
    distance: 25,
    targetFace: "60cm",
    targetFaceType: "standard-10",
    discipline: "recurve",
    arrowsPerEnd: 3,
    totalEnds: 20,
    maxScore: 600,
    category: "indoor",
    description: "WA 25m indoor round. 60 arrows on 60cm face.",
  },

  // ═══ COMPOUND OUTDOOR ═══
  {
    id: "compound-50m",
    name: "Compound 50m Outdoor",
    distance: 50,
    targetFace: "80cm 6-ring",
    targetFaceType: "compound-6",
    discipline: "compound",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "WA compound outdoor round. 72 arrows at 50m on 80cm 6-ring (inner 10) face. Compound X-ring is smaller than recurve.",
  },
  {
    id: "compound-30m",
    name: "Compound 30m",
    distance: 30,
    targetFace: "80cm 6-ring",
    targetFaceType: "compound-6",
    discipline: "compound",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "WA compound 30m round on 6-ring face. 72 arrows.",
  },

  // ═══ COMPOUND INDOOR ═══
  {
    id: "compound-18m-indoor",
    name: "Compound 18m Indoor",
    distance: 18,
    targetFace: "40cm 6-ring",
    targetFaceType: "compound-6",
    discipline: "compound",
    arrowsPerEnd: 3,
    totalEnds: 20,
    maxScore: 600,
    category: "indoor",
    description: "WA compound indoor round. 60 arrows at 18m on 40cm single-spot 6-ring face.",
  },

  // ═══ BAREBOW ═══
  {
    id: "barebow-50m",
    name: "Barebow 50m Outdoor",
    distance: 50,
    targetFace: "122cm",
    targetFaceType: "standard-10",
    discipline: "barebow",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "WA barebow outdoor round. 72 arrows at 50m on 122cm full face.",
  },
  {
    id: "barebow-30m",
    name: "Barebow 30m",
    distance: 30,
    targetFace: "122cm",
    targetFaceType: "standard-10",
    discipline: "barebow",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "WA barebow 30m round on 122cm face. 72 arrows.",
  },
  {
    id: "barebow-18m-indoor",
    name: "Barebow 18m Indoor",
    distance: 18,
    targetFace: "40cm",
    targetFaceType: "standard-10",
    discipline: "barebow",
    arrowsPerEnd: 3,
    totalEnds: 20,
    maxScore: 600,
    category: "indoor",
    description: "WA barebow indoor round. 60 arrows on 40cm face.",
  },

  // ═══ FIELD ARCHERY ═══
  {
    id: "field-marked",
    name: "WA Field Round (Marked)",
    distance: 0,
    targetFace: "Various",
    targetFaceType: "field-4",
    discipline: "field",
    arrowsPerEnd: 3,
    totalEnds: 24,
    maxScore: 432,
    category: "field",
    description: "WA Field Round — 24 targets at marked distances (5–60m). 3 arrows per target. Scoring: 6-5-4-3-M.",
  },
  {
    id: "field-hunter",
    name: "WA Hunter Round (Unmarked)",
    distance: 0,
    targetFace: "Various",
    targetFaceType: "field-4",
    discipline: "field",
    arrowsPerEnd: 3,
    totalEnds: 24,
    maxScore: 432,
    category: "field",
    description: "WA Hunter Round — 24 targets at unmarked distances. 3 arrows per target. Scoring: 6-5-4-3-M.",
  },
  {
    id: "field-half",
    name: "Half Field Round (12 targets)",
    distance: 0,
    targetFace: "Various",
    targetFaceType: "field-4",
    discipline: "field",
    arrowsPerEnd: 3,
    totalEnds: 12,
    maxScore: 216,
    category: "field",
    description: "Half field round — 12 targets, 3 arrows each. Scoring: 6-5-4-3-M.",
  },

  // ═══ PRACTICE ═══
  {
    id: "half-70m",
    name: "Half 70m (36 arrows)",
    distance: 70,
    targetFace: "122cm",
    targetFaceType: "standard-10",
    discipline: "recurve",
    arrowsPerEnd: 6,
    totalEnds: 6,
    maxScore: 360,
    category: "practice",
    description: "Half ranking round at 70m. 36 arrows, 6 ends.",
  },
  {
    id: "half-50m",
    name: "Half 50m (36 arrows)",
    distance: 50,
    targetFace: "80cm",
    targetFaceType: "standard-10",
    discipline: "recurve",
    arrowsPerEnd: 6,
    totalEnds: 6,
    maxScore: 360,
    category: "practice",
    description: "Half round at 50m. 36 arrows, 6 ends.",
  },
  {
    id: "practice-custom",
    name: "Practice (Custom)",
    distance: 0,
    targetFace: "122cm",
    targetFaceType: "standard-10",
    discipline: "recurve",
    arrowsPerEnd: 6,
    totalEnds: 6,
    maxScore: 360,
    category: "practice",
    description: "Custom practice round. Edit distance and number of ends.",
  },
];

export function getRoundById(id: string): Round | undefined {
  return ROUNDS.find(r => r.id === id);
}

// Backward compat — now dynamic per face
export const SCORE_VALUES = getScoreValues("standard-10");
