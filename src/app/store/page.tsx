"use client";
import { useCart } from "../contexts/CartContext";

const products = [
  { name: 'Hoyt Altus Compound Bow', priceKES: 185000 },
  { name: 'Easton X10 Arrows (Dozen)', priceKES: 95000 },
  { name: 'Shibuya Ultima Recurve Sight', priceKES: 42000 },
  { name: 'Avalon Classic Barebow Tab', priceKES: 3500 },
  { name: 'Cartel Midas Bow Stand', priceKES: 2500 },
  { name: 'Win & Win WIAWIS Limbs', priceKES: 78000 },
  { name: 'BCY 8125G Bow String', priceKES: 4500 },
  { name: 'Beiter Plunger Button', priceKES: 12000 },
];

export default function Store() {
  const { addItem } = useCart();

  return (
    <div className="page-wrap">
      <h1 className="page-title">Archery Store</h1>
      <p className="page-subtitle">Equipment and accessories for Kenyan archers</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 20,
      }}>
        {products.map((product) => (
          <div key={product.name} className="card" style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
            {/* Product icon placeholder */}
            <div style={{
              background: "linear-gradient(135deg, #f5f5f0 0%, #e8e5e0 100%)",
              borderRadius: "var(--radius-sm)",
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              fontSize: "2.5rem",
            }}>
              🏹
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 6 }}>{product.name}</h3>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ke-green)", marginBottom: 14 }}>
              KSh {product.priceKES.toLocaleString()}
            </div>
            <button
              className="btn btn-red"
              style={{ width: "100%", marginTop: "auto", fontSize: "0.85rem" }}
              onClick={() => addItem({
                id: product.name,
                name: product.name,
                price: product.priceKES,
                quantity: 1,
              })}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}