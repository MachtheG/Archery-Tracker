"use client";
import { useCart } from "../contexts/CartContext";

export default function Receipt({ onClose }: { onClose: () => void }) {
  const { items, total } = useCart();
  const now = new Date();
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0002', padding: 32, maxWidth: 400, margin: '2rem auto', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#d32f2f' }}>&times;</button>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Receipt</h2>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>Date: {now.toLocaleDateString()}<br/>Time: {now.toLocaleTimeString()}</div>
      <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: 6 }}>
            {item.name} x{item.quantity} <span style={{ float: 'right' }}>KSh {(item.price * item.quantity).toLocaleString()}</span>
          </li>
        ))}
      </ul>
      <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
        Total: <span style={{ color: '#d32f2f' }}>KSh {total.toLocaleString()}</span>
      </div>
      <div style={{ textAlign: 'center', color: '#888', fontSize: 13 }}>
        This is your official receipt.
      </div>
    </div>
  );
}
