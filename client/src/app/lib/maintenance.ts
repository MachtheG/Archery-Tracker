export type MaintenanceTip = {
  id: string;
  category: string;
  title: string;
  content: string;
  brands: string[];
  kenyanAvailability: string;
};

export const MAINTENANCE_CATEGORIES = [
  "String & Serving",
  "Limb Care",
  "Sight & Rest",
  "Arrow Maintenance",
  "General Bow Care",
  "Climate Tips (Kenya)",
];

export const MAINTENANCE_TIPS: MaintenanceTip[] = [
  // String & Serving
  {
    id: "m1",
    category: "String & Serving",
    title: "Wax Your Bowstring Regularly",
    content: "Apply bowstring wax every 100–200 shots or when the string looks fuzzy. In Kenya's warm climate, wax softens faster — use a harder wax compound. Work the wax in with your fingers until the strands look smooth and slightly glossy. Avoid over-waxing the serving area.",
    brands: ["BCY 8125G", "Flex Bowstring Wax", "Bohning Seal-Tite"],
    kenyanAvailability: "BCY strings available through Nairobi archery dealers. Bohning wax can be ordered online through local importers.",
  },
  {
    id: "m2",
    category: "String & Serving",
    title: "Check Serving Separation",
    content: "Inspect the center serving and nocking point area for separation or fraying before each session. Loose serving can cause inconsistent nocking and arrow flight. Re-serve using BCY #2 or Ist Superserve material.",
    brands: ["BCY #2 Serving", "Angel Majesty"],
    kenyanAvailability: "Serving thread available at Archery Den Nairobi or through online order from Lancaster Archery.",
  },
  // Limb Care
  {
    id: "m3",
    category: "Limb Care",
    title: "Inspect Limbs for Cracks",
    content: "Before stringing, inspect both limbs for any cracks, delamination, or twist. Run your fingernail across the surface — if you feel any ridges or hear scraping, the limb may be damaged. Kenya's UV exposure can accelerate limb degradation on fibreglass bows.",
    brands: ["Win&Win", "Hoyt", "WNS", "Cartel"],
    kenyanAvailability: "Win&Win and WNS limbs available from Kenya Archery Federation partners. Cartel limbs are a budget option available locally.",
  },
  {
    id: "m4",
    category: "Limb Care",
    title: "Never Leave Your Bow Strung",
    content: "Always unstring your bow after shooting, especially recurve bows. Leaving a bow strung causes limb fatigue and permanent set. In high-temperature environments like parts of Kenya, the risk is even higher. Use a bow stringer every time.",
    brands: ["Universal"],
    kenyanAvailability: "Bow stringers available at most archery shops in Nairobi.",
  },
  // Sight & Rest
  {
    id: "m5",
    category: "Sight & Rest",
    title: "Tighten Sight Screws After Transport",
    content: "Vibrations during travel (matatu, boda boda, or car over rough roads) can loosen sight locking screws. Always check and re-tighten your sight before shooting at the range. Use a hex key set to torque evenly.",
    brands: ["Shibuya", "Avalon", "Cartel"],
    kenyanAvailability: "Shibuya Ultima and Avalon sights available from authorized dealers. Cartel sights are budget-friendly and locally stocked.",
  },
  {
    id: "m6",
    category: "Sight & Rest",
    title: "Clean Your Arrow Rest",
    content: "Dust and grit from outdoor ranges (common on Kenyan ranges) can clog magnetic rests or blade rests. Wipe down the rest with a soft cloth after every session. For compound blade rests, check the launcher blade for bending.",
    brands: ["Shibuya DX", "AAE Cavalier", "Zniper"],
    kenyanAvailability: "Shibuya and AAE rests stocked by Nairobi dealers. Zniper rests are an affordable Korean alternative.",
  },
  // Arrow Maintenance
  {
    id: "m7",
    category: "Arrow Maintenance",
    title: "Check Arrow Straightness Monthly",
    content: "Roll each arrow on a flat surface (glass table or granite) and watch for wobble. Bent aluminium arrows should be retired. Carbon arrows with visible cracks must be discarded immediately — they can shatter and cause injury.",
    brands: ["Easton", "Gold Tip", "Carbon Express"],
    kenyanAvailability: "Easton arrows (X10, ACE, Tribute) available through Kenyan importers. Gold Tip available online.",
  },
  {
    id: "m8",
    category: "Arrow Maintenance",
    title: "Re-fletch Vanes After 500 Shots",
    content: "Vanes wear out and can peel off, especially in dusty outdoor conditions. Check adhesion by gently tugging each vane. Re-fletch using a jig and Bohning Blazer vanes or AAE Max vanes with Bohning Platinum glue.",
    brands: ["Bohning Blazer", "AAE Max", "Flex-Fletch"],
    kenyanAvailability: "Bohning products available locally. Fletching jigs (Bitzenburger, Arizona EZ-Fletch) can be ordered through archery importers.",
  },
  // General Bow Care
  {
    id: "m9",
    category: "General Bow Care",
    title: "Store Your Bow in a Case",
    content: "Always transport and store your bow in a padded case. Kenya's red dust can get into every crevice. Bow cases from Easton, Avalon, and Legend are widely available. A hard case is recommended for air travel to competitions.",
    brands: ["Easton", "Avalon", "Legend"],
    kenyanAvailability: "Canvas and soft bow cases available in Nairobi. Hard cases from Easton/SKB available via order.",
  },
  {
    id: "m10",
    category: "General Bow Care",
    title: "Check Brace Height Weekly",
    content: "Measure your brace height with a bow square before each session. For a typical 68\" recurve, brace height should be 21–23 cm (8.25–9\"). A change of more than 3mm means your string has stretched — twist it back up.",
    brands: ["Universal"],
    kenyanAvailability: "Bow squares available at all archery shops. Beiter bow squares are the gold standard.",
  },
  // Climate Tips (Kenya)
  {
    id: "m11",
    category: "Climate Tips (Kenya)",
    title: "Shooting in Nairobi's Altitude",
    content: "Nairobi sits at ~1,700m elevation. Thinner air means arrows fly slightly faster and flatter than at sea level. When traveling to coastal competitions (Mombasa, Lamu), expect arrows to drop more. Adjust sight marks accordingly.",
    brands: [],
    kenyanAvailability: "N/A — knowledge tip.",
  },
  {
    id: "m12",
    category: "Climate Tips (Kenya)",
    title: "Dealing with Equatorial Sun",
    content: "UV radiation is intense year-round in Kenya. Wear a hat and sunglasses (they reduce glare on the target). Use sunscreen to protect the bow arm. Store your bow in shade between ends — prolonged heat can soften limb adhesives.",
    brands: [],
    kenyanAvailability: "N/A — knowledge tip.",
  },
  {
    id: "m13",
    category: "Climate Tips (Kenya)",
    title: "Rainy Season Preparation",
    content: "During the long rains (March–May) and short rains (Oct–Dec), always bring a towel and waterproof bow cover. Wipe your string immediately after rain exposure. Aluminium arrows are less affected than carbon in wet conditions but still check for corrosion.",
    brands: [],
    kenyanAvailability: "Waterproof bow sleeves available from Avalon and Cartel.",
  },
  {
    id: "m14",
    category: "Climate Tips (Kenya)",
    title: "Dust Management at Outdoor Ranges",
    content: "Many Kenyan ranges have dusty conditions, especially during dry season. Bring a microfibre cloth to wipe down your riser, sight, and arrows. Apply a light coat of silicone spray on metal parts to prevent corrosion from dust and sweat.",
    brands: ["WD-40 Specialist", "Silicone spray"],
    kenyanAvailability: "WD-40 readily available in most hardware stores across Kenya.",
  },
];

export function getTipsByCategory(category: string): MaintenanceTip[] {
  return MAINTENANCE_TIPS.filter(t => t.category === category);
}
