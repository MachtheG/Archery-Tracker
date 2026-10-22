"use client";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { markListingSold, getAllStoreListings } from "../lib/storage";
import type { StoreListing } from "../lib/storage";
import { apiUrl } from "../lib/api";
import Link from "next/link";

export default function Cart() {
  const { items, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "confirmed">("cart");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerNotes, setBuyerNotes] = useState("");
  const [confirmedItems, setConfirmedItems] = useState<{ name: string; price: number; sellerEmail: string; sellerName: string }[]>([]);

  const handleCheckout = () => {
    if (!user) return;
    if (items.length === 0) return;
    setCheckoutStep("checkout");
  };

  const handleConfirmPurchase = async () => {
    if (!user) return;

    const allListings = await getAllStoreListings();
    const confirmed: typeof confirmedItems = [];
    const sellers: Record<string, any> = {};

    // Mark each purchased listing as sold and gather seller info
    for (const item of items) {
      const listing = allListings.find(l => l.id === item.id);
      let sellerEmail = "store@archeryke.co.ke";
      let sellerName = "Archery KE Store";

      if (listing) {
        await markListingSold(listing.id);
        sellerEmail = listing.sellerEmail;
        sellerName = listing.sellerName;
      }

      confirmed.push({
        name: item.name,
        price: item.price,
        sellerEmail,
        sellerName,
      });

      if (!sellers[sellerEmail]) {
        sellers[sellerEmail] = { sellerName, items: [] };
      }
      sellers[sellerEmail].items.push({ name: item.name, price: item.price });
    }

    try {
      await fetch(apiUrl("/api/orders/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          buyer: {
            name: user.name,
            email: user.email,
            phone: buyerPhone,
            notes: buyerNotes
          },
          sellers
        }),
      });
    } catch (err) {
      console.error("Failed to send order emails", err);
    }

    setConfirmedItems(confirmed);
    clearCart();
    setCheckoutStep("confirmed");
  };

  // ── CONFIRMED ──
  if (checkoutStep === "confirmed") {
    // Group by seller
    const sellerMap = new Map<string, { sellerName: string; sellerEmail: string; items: { name: string; price: number }[] }>();
    confirmedItems.forEach(ci => {
      const existing = sellerMap.get(ci.sellerEmail) || { sellerName: ci.sellerName, sellerEmail: ci.sellerEmail, items: [] };
      existing.items.push({ name: ci.name, price: ci.price });
      sellerMap.set(ci.sellerEmail, existing);
    });

    const totalPaid = confirmedItems.reduce((s, ci) => s + ci.price, 0);

    return (
      <div className="page-wrap" style={{ maxWidth: 640 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
          <h1 className="page-title">Order Confirmed!</h1>
          <p className="page-subtitle">Your order has been placed. The sellers have been notified.</p>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Order Summary</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {confirmedItems.map((ci, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                <span>{ci.name}</span>
                <span style={{ fontWeight: 700 }}>KSh {ci.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: "1.1rem", fontWeight: 800 }}>
            <span>Total</span>
            <span style={{ color: "var(--ke-green)" }}>KSh {totalPaid.toLocaleString()}</span>
          </div>
        </div>

        {/* Seller notifications */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>📧 Seller Notifications</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 14 }}>
            The following sellers have been emailed about your purchase:
          </p>
          {[...sellerMap.values()].map((seller, i) => (
            <div key={i} style={{
              padding: "12px 16px",
              marginBottom: 8,
              background: "var(--bg-primary)",
              borderRadius: "var(--radius-sm)",
              borderLeft: "3px solid var(--ke-green)",
            }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{seller.sellerName}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                📧 {seller.sellerEmail}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 4 }}>
                Items: {seller.items.map(it => it.name).join(", ")}
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: "var(--ke-green)",
                fontWeight: 600,
                marginTop: 6,
                padding: "4px 10px",
                background: "rgba(0,107,63,0.06)",
                borderRadius: 4,
                display: "inline-block",
              }}>
                ✅ Email notification sent
              </div>
            </div>
          ))}
        </div>

        {user && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>Your Details</h2>
            <div style={{ fontSize: "0.9rem" }}>
              <div><strong>Name:</strong> {user.name}</div>
              <div><strong>Email:</strong> {user.email}</div>
              {buyerPhone && <div><strong>Phone:</strong> {buyerPhone}</div>}
              {buyerNotes && <div><strong>Notes:</strong> {buyerNotes}</div>}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/store" className="btn btn-green" style={{ fontSize: "0.9rem" }}>
            Back to Store
          </Link>
          <button onClick={() => window.print()} className="btn btn-dark" style={{ fontSize: "0.85rem" }}>
            📄 Print Receipt
          </button>
        </div>
      </div>
    );
  }

  // ── CHECKOUT ──
  if (checkoutStep === "checkout") {
    return (
      <div className="page-wrap" style={{ maxWidth: 640 }}>
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Review your order and confirm</p>

        {/* Order summary */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Order Summary</h2>
          {items.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-light)", fontSize: "0.9rem" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Qty: {item.quantity}</div>
              </div>
              <div style={{ fontWeight: 700 }}>KSh {(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: "1.15rem", fontWeight: 800 }}>
            <span>Total</span>
            <span style={{ color: "var(--ke-green)" }}>KSh {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Buyer info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Your Details</h2>
          {user && (
            <div style={{ fontSize: "0.9rem", marginBottom: 12 }}>
              <div><strong>Name:</strong> {user.name}</div>
              <div><strong>Email:</strong> {user.email}</div>
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Phone Number (optional)</label>
            <input className="input" type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="e.g. +254 712 345 678" />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Notes for Seller (optional)</label>
            <textarea className="textarea" value={buyerNotes} onChange={e => setBuyerNotes(e.target.value)} placeholder="Preferred meetup location, shipping preferences..." rows={2} />
          </div>
        </div>

        {/* Info about what happens */}
        <div style={{
          padding: "14px 18px",
          background: "rgba(204, 153, 0, 0.06)",
          border: "1px solid var(--ke-gold)",
          borderRadius: "var(--radius-sm)",
          marginBottom: 20,
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
        }}>
          <strong style={{ color: "var(--ke-gold)" }}>ℹ️ How it works:</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.8 }}>
            <li>Each seller will receive an email notification with your contact details.</li>
            <li>Items will be removed from the store once purchased.</li>
            <li>You and the seller arrange payment and delivery directly.</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={handleConfirmPurchase} className="btn btn-green" style={{ fontSize: "1rem", padding: "12px 32px" }}>
            ✅ Confirm Purchase
          </button>
          <button onClick={() => setCheckoutStep("cart")} className="btn btn-outline">
            ← Back to Cart
          </button>
        </div>
      </div>
    );
  }

  // ── CART ──
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
            {user ? (
              <button onClick={handleCheckout} className="btn btn-green" style={{ fontSize: "1rem", padding: "12px 32px" }}>
                Proceed to Checkout →
              </button>
            ) : (
              <Link href="/login" className="btn btn-green" style={{ fontSize: "0.9rem" }}>
                Log in to Checkout
              </Link>
            )}
            <button onClick={clearCart} className="btn btn-outline" style={{ fontSize: "0.85rem" }}>Clear Cart</button>
          </div>
        </>
      )}

      {items.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: 20 }}>
          <Link href="/store" className="btn btn-green">Browse Store →</Link>
        </div>
      )}
    </div>
  );
}