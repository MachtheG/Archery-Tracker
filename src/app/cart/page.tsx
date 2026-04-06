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
    <div className="page-wrap">
      <h1 className="page-title">Your Cart</h1>
      <p className="page-subtitle">{items.length === 0 ? "Your cart is empty." : `${items.length} item${items.length > 1 ? "s" : ""} in your cart`}</p>

      {items.length > 0 && (
        <>
          {/* Cart items */}
          <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--ke-black)", color: "var(--ke-white)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.85rem" }}>Product</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, fontSize: "0.85rem" }}>Qty</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, fontSize: "0.85rem" }}>Price</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, fontSize: "0.85rem" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 500 }}>{item.name}</td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 600 }}>KSh {(item.price * item.quantity).toLocaleString()}</td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <button onClick={() => removeItem(item.id)} className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "4px 10px" }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>Total: </span>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--ke-green)" }}>KSh {total.toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
            <button onClick={clearCart} className="btn btn-dark" style={{ fontSize: "0.85rem" }}>Clear Cart</button>
            <button onClick={() => setShowInvoice(true)} className="btn btn-gold" style={{ fontSize: "0.85rem" }}>View Invoice</button>
            <button onClick={() => setShowReceipt(true)} className="btn btn-green" style={{ fontSize: "0.85rem" }}>View Receipt</button>
            <button onClick={() => setShowEmail(true)} className="btn btn-red" style={{ fontSize: "0.85rem" }}>Email Receipt</button>
          </div>

          {showInvoice && <Invoice onClose={() => setShowInvoice(false)} />}
          {showReceipt && <Receipt onClose={() => setShowReceipt(false)} />}
          {showEmail && <EmailForm onSend={() => setEmailSent(true)} onClose={() => setShowEmail(false)} />}
          {emailSent && <div style={{ color: "var(--ke-green)", textAlign: "center", fontWeight: 700, marginTop: 16 }}>Receipt sent to your email!</div>}
        </>
      )}
    </div>
  );
}