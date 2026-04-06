export type Round = {
  id: string;
  name: string;
  distance: number;
  targetFace: string;
  arrowsPerEnd: number;
  totalEnds: number;
  maxScore: number;
  category: "outdoor" | "indoor" | "practice";
  description: string;
};

export const ROUNDS: Round[] = [
  // Outdoor rounds
  {
    id: "wa-70m",
    name: "WA 70m Outdoor",
    distance: 70,
    targetFace: "122cm",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "Standard World Archery outdoor ranking round. 72 arrows at 70 metres.",
  },
  {
    id: "wa-60m",
    name: "WA 60m Outdoor",
    distance: 60,
    targetFace: "122cm",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "World Archery 60m ranking round. 72 arrows.",
  },
  {
    id: "wa-50m",
    name: "WA 50m Outdoor",
    distance: 50,
    targetFace: "80cm",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "World Archery 50m round on 80cm target face. 72 arrows.",
  },
  {
    id: "wa-30m",
    name: "WA 30m",
    distance: 30,
    targetFace: "80cm",
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720,
    category: "outdoor",
    description: "World Archery 30m round. Common for beginners and juniors. 72 arrows.",
  },
  // Indoor rounds
  {
    id: "wa-18m-indoor",
    name: "WA 18m Indoor",
    distance: 18,
    targetFace: "40cm",
    arrowsPerEnd: 3,
    totalEnds: 20,
    maxScore: 600,
    category: "indoor",
    description: "Standard World Archery indoor round. 60 arrows at 18 metres, 3 arrows per end.",
  },
  {
    id: "wa-25m-indoor",
    name: "WA 25m Indoor",
    distance: 25,
    targetFace: "60cm",
    arrowsPerEnd: 3,
    totalEnds: 20,
    maxScore: 600,
    category: "indoor",
    description: "World Archery 25m indoor round. 60 arrows.",
  },
  // Half rounds (used in practice and some local competitions)
  {
    id: "half-70m",
    name: "Half 70m (36 arrows)",
    distance: 70,
    targetFace: "122cm",
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
    arrowsPerEnd: 6,
    totalEnds: 6,
    maxScore: 360,
    category: "practice",
    description: "Half round at 50m. 36 arrows, 6 ends.",
  },
  // Practice
  {
    id: "practice-custom",
    name: "Practice (Custom)",
    distance: 0,
    targetFace: "122cm",
    arrowsPerEnd: 6,
    totalEnds: 6,
    maxScore: 360,
    category: "practice",
    description: "Custom practice round. Edit distance and number of ends as needed.",
  },
];

export function getRoundById(id: string): Round | undefined {
  return ROUNDS.find(r => r.id === id);
}

// Score labels: X, 10, 9, ..., 1, M
export const SCORE_VALUES = [
  { label: "X", value: 10, isX: true },
  { label: "10", value: 10, isX: false },
  { label: "9", value: 9, isX: false },
  { label: "8", value: 8, isX: false },
  { label: "7", value: 7, isX: false },
  { label: "6", value: 6, isX: false },
  { label: "5", value: 5, isX: false },
  { label: "4", value: 4, isX: false },
  { label: "3", value: 3, isX: false },
  { label: "2", value: 2, isX: false },
  { label: "1", value: 1, isX: false },
  { label: "M", value: 0, isX: false },
];

// Ring colors for virtual target (from outside ring 1 to inside ring 10)
export const RING_COLORS: { ring: number; fill: string; stroke: string }[] = [
  { ring: 1, fill: "#f0f0f0", stroke: "#999" },
  { ring: 2, fill: "#f0f0f0", stroke: "#999" },
  { ring: 3, fill: "#222", stroke: "#444" },
  { ring: 4, fill: "#222", stroke: "#444" },
  { ring: 5, fill: "#0077B6", stroke: "#005f8a" },
  { ring: 6, fill: "#0077B6", stroke: "#005f8a" },
  { ring: 7, fill: "#BB1600", stroke: "#8a1100" },
  { ring: 8, fill: "#BB1600", stroke: "#8a1100" },
  { ring: 9, fill: "#FFD700", stroke: "#ccaa00" },
  { ring: 10, fill: "#FFD700", stroke: "#ccaa00" },
];
