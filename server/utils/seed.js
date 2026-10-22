const StoreListing = require('../models/StoreListing');

const DEFAULT_LISTINGS = [
  { name: "Hoyt Altus Compound Bow", description: "Brand new, 2025 model. 50lb draw weight.", priceKES: 185000, condition: "new", category: "Bows", imageUrl: "/products/compound_bow.png" },
  { name: "Easton X10 Arrows (Dozen)", description: "Competition-grade carbon arrows. Spine 600.", priceKES: 95000, condition: "new", category: "Arrows", imageUrl: "/products/carbon_arrows.png" },
  { name: "Shibuya Ultima Recurve Sight", description: "Premium recurve sight with micro-click adjustment.", priceKES: 42000, condition: "new", category: "Accessories", imageUrl: "/products/recurve_sight.png" },
  { name: "Avalon Classic Barebow Tab", description: "Leather barebow shooting tab, medium size.", priceKES: 3500, condition: "new", category: "Accessories", imageUrl: "/products/barebow_tab.png" },
  { name: "Cartel Midas Bow Stand", description: "Lightweight aluminium bow stand.", priceKES: 2500, condition: "new", category: "Accessories", imageUrl: "/products/bow_stand.png" },
  { name: "Win & Win WIAWIS Limbs", description: "Carbon/foam limbs, 36lb medium.", priceKES: 78000, condition: "new", category: "Limbs", imageUrl: "/products/recurve_limbs.png" },
  { name: "BCY 8125G Bow String", description: "High-performance bowstring material.", priceKES: 4500, condition: "new", category: "Strings", imageUrl: "/products/bow_string.png" },
  { name: "Beiter Plunger Button", description: "Competition plunger button with micro-adjustment.", priceKES: 12000, condition: "new", category: "Accessories", imageUrl: "/products/plunger_button.png" },
];

async function seedStoreListings() {
  const count = await StoreListing.count();
  if (count > 0) return;

  await StoreListing.bulkCreate(
    DEFAULT_LISTINGS.map((l) => ({
      ...l,
      sellerId: null,
      sellerName: "Archery KE Store",
      sellerEmail: "store@archeryke.co.ke",
    }))
  );
  console.log(`Seeded ${DEFAULT_LISTINGS.length} default store listings`);
}

module.exports = { seedStoreListings };
