"use client";
const KENYA_COLORS = {
  black: '#000',
  red: '#d32f2f',
  green: '#006600',
  white: '#fff',
  gold: '#FFD700',
};

// Mock product data (sampled from Merlin Archery, prices converted to KES)
const products = [
  {
    name: 'Hoyt Altus Compound Bow',
    image: 'https://www.merlinarchery.co.uk/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/h/o/hoyt-altus-2021.jpg',
    priceKES: 185000,
  },
  {
    name: 'Easton X10 Arrows (Dozen)',
    image: 'https://www.merlinarchery.co.uk/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/e/a/easton-x10-arrow.jpg',
    priceKES: 95000,
  },
  {
    name: 'Shibuya Ultima Recurve Sight',
    image: 'https://www.merlinarchery.co.uk/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/s/h/shibuya-ultima-ii-recurve-sight.jpg',
    priceKES: 42000,
  },
  {
    name: 'Avalon Classic Barebow Tab',
    image: 'https://www.merlinarchery.co.uk/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/a/v/avalon-classic-barebow-tab.jpg',
    priceKES: 3500,
  },
  {
    name: 'Cartel Midas Bow Stand',
    image: 'https://www.merlinarchery.co.uk/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/c/a/cartel-midas-bow-stand.jpg',
    priceKES: 2500,
  },
];

import { useCart } from "../contexts/CartContext";

export default function Store() {
  const { addItem } = useCart();
  return (
    <main style={{
      padding: '2rem',
      background: `linear-gradient(135deg, ${KENYA_COLORS.green} 0%, ${KENYA_COLORS.gold} 100%)`,
      minHeight: '100vh',
    }}>
      <h1 style={{ color: KENYA_COLORS.black, fontWeight: 800, marginBottom: 32 }}>Archery Store</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
        {products.map((product) => (
          <div key={product.name} style={{ background: KENYA_COLORS.white, borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 20, minWidth: 260, maxWidth: 300, textAlign: 'center' }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
            <h2 style={{ color: KENYA_COLORS.green, fontSize: '1.1rem', marginBottom: 8 }}>{product.name}</h2>
            <div style={{ color: KENYA_COLORS.red, fontWeight: 700, fontSize: 18, marginBottom: 12 }}>KSh {product.priceKES.toLocaleString()}</div>
            <button
              style={{ background: KENYA_COLORS.red, color: KENYA_COLORS.white, padding: '0.6rem 1.5rem', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
              onClick={() => addItem({
                id: product.name,
                name: product.name,
                price: product.priceKES,
                quantity: 1,
                image: product.image,
              })}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}