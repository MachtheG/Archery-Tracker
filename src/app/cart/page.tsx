"use client";

import { useCart } from "../contexts/CartContext";
import { useState } from "react";
import Invoice from "../components/Invoice";
import Receipt from "../components/Receipt";
import EmailForm from "../components/EmailForm";

export default function Cart() {
  const { items, removeItem, clearCart, total } = useCart();
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  return (
    <main style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 800, marginBottom: 24 }}>Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table style={{ width: '100%', marginBottom: 24, borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #0001' }}>
            <thead>
              <tr style={{ background: '#006600', color: '#fff' }}>
                <th style={{ padding: 12, borderRadius: '8px 0 0 0' }}>Product</th>
                <th style={{ padding: 12 }}>Qty</th>
                <th style={{ padding: 12 }}>Price</th>
                <th style={{ padding: 12 }}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>{item.quantity}</td>
                  <td style={{ padding: 12 }}>KSh {(item.price * item.quantity).toLocaleString()}</td>
                  <td style={{ padding: 12 }}>
                    <button onClick={() => removeItem(item.id)} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: '0.3em 0.8em', cursor: 'pointer' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', marginBottom: 24, fontWeight: 700, fontSize: 20 }}>
            Total: <span style={{ color: '#d32f2f' }}>KSh {total.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
            <button onClick={clearCart} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7em 1.5em', fontWeight: 700, cursor: 'pointer' }}>Clear Cart</button>
            <button onClick={() => setShowInvoice(true)} style={{ background: '#FFD700', color: '#000', border: 'none', borderRadius: 6, padding: '0.7em 1.5em', fontWeight: 700, cursor: 'pointer' }}>View Invoice</button>
            <button onClick={() => setShowReceipt(true)} style={{ background: '#006600', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7em 1.5em', fontWeight: 700, cursor: 'pointer' }}>View Receipt</button>
            <button onClick={() => setShowEmail(true)} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7em 1.5em', fontWeight: 700, cursor: 'pointer' }}>Email Receipt</button>
          </div>
          {showInvoice && <Invoice onClose={() => setShowInvoice(false)} />}
          {showReceipt && <Receipt onClose={() => setShowReceipt(false)} />}
          {showEmail && <EmailForm onSend={() => setEmailSent(true)} onClose={() => setShowEmail(false)} />}
          {emailSent && <div style={{ color: '#006600', textAlign: 'center', fontWeight: 700, marginTop: 16 }}>Receipt sent to your email!</div>}
        </>
      )}
    </main>
  );
}