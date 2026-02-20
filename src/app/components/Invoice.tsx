"use client";
import { useCart } from "../contexts/CartContext";

export default function Invoice({ onClose }: { onClose: () => void }) {
  const { items, total } = useCart();
  const now = new Date();
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0002', padding: 32, maxWidth: 500, margin: '2rem auto', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#d32f2f' }}>&times;</button>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Invoice</h2>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>Date: {now.toLocaleDateString()}<br/>Time: {now.toLocaleTimeString()}</div>
      <table style={{ width: '100%', marginBottom: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>Product</th>
            <th style={{ padding: 8 }}>Qty</th>
            <th style={{ padding: 8 }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: 8 }}>{item.name}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>KSh {(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
        Total: <span style={{ color: '#d32f2f' }}>KSh {total.toLocaleString()}</span>
      </div>
      <div style={{ textAlign: 'center', color: '#888', fontSize: 13 }}>
        Thank you for shopping with us!
      </div>
    </div>
  );
}
