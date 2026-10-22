"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { getStoreListings, addStoreListing } from "../lib/storage";
import type { StoreListing } from "../lib/storage";
import { apiUrl } from "../lib/api";
import Link from "next/link";

const CATEGORIES = ["All", "Bows", "Arrows", "Limbs", "Strings", "Accessories", "Apparel", "Other"];

export default function Store() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [listings, setListings] = useState<StoreListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSellForm, setShowSellForm] = useState(false);

  // Sell form state
  const [sellName, setSellName] = useState("");
  const [sellDesc, setSellDesc] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [sellCondition, setSellCondition] = useState<StoreListing["condition"]>("used");
  const [sellCategory, setSellCategory] = useState("Accessories");
  const [sellImage, setSellImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sellSuccess, setSellSuccess] = useState(false);

  useEffect(() => {
    getStoreListings().then(setListings);
  }, []);

  const refresh = () => getStoreListings().then(setListings);

  const filtered = selectedCategory === "All"
    ? listings
    : listings.filter(l => l.category === selectedCategory);

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUploading(true);
    let uploadedImageUrl = undefined;

    if (sellImage) {
      const formData = new FormData();
      formData.append("image", sellImage);

      try {
        const res = await fetch(apiUrl("/api/uploads"), {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedImageUrl = data.imageUrl;
        } else {
          console.error("Failed to upload image");
        }
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    }

    await addStoreListing({
      name: sellName,
      description: sellDesc,
      priceKES: parseInt(sellPrice) || 0,
      condition: sellCondition,
      category: sellCategory,
      imageUrl: uploadedImageUrl,
      imageEmoji: sellCategory === "Bows" ? "🏹" : sellCategory === "Arrows" ? "➡️" : "🎯",
    });

    // Reset form
    setSellName("");
    setSellDesc("");
    setSellPrice("");
    setSellCondition("used");
    setSellCategory("Accessories");
    setSellImage(null);
    setIsUploading(false);
    setShowSellForm(false);
    setSellSuccess(true);
    setTimeout(() => setSellSuccess(false), 4000);
    refresh();
  };

  const conditionLabel = (c: string) => {
    switch (c) {
      case "new": return "New";
      case "like-new": return "Like New";
      case "used": return "Used";
      case "well-used": return "Well Used";
      default: return c;
    }
  };

  const conditionColor = (c: string) => {
    switch (c) {
      case "new": return "var(--ke-green)";
      case "like-new": return "var(--ke-gold)";
      case "used": return "var(--ke-red)";
      case "well-used": return "var(--text-muted)";
      default: return "var(--text-muted)";
    }
  };

  return (
    <div className="page-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Archery Marketplace</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>New equipment & second-hand gear from the community</p>
        </div>
        {user && (
          <button
            onClick={() => setShowSellForm(!showSellForm)}
            className="btn btn-green"
            style={{ fontSize: "0.9rem" }}
          >
            {showSellForm ? "Cancel" : "🏷️ Sell an Item"}
          </button>
        )}
      </div>

      {sellSuccess && (
        <div style={{
          marginTop: 16,
          padding: "12px 20px",
          background: "rgba(0, 107, 63, 0.08)",
          border: "1px solid var(--ke-green)",
          borderRadius: "var(--radius-sm)",
          color: "var(--ke-green)",
          fontWeight: 600,
          fontSize: "0.9rem",
        }}>
          ✅ Your item has been listed! Buyers will contact you via email.
        </div>
      )}

      {/* Sell form */}
      {showSellForm && user && (
        <form onSubmit={handleSellSubmit} className="card" style={{ marginTop: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 14 }}>📦 List an Item for Sale</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 14 }}>
            Selling as <strong>{user.name}</strong> ({user.email}). Buyers will be able to contact you at this email.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Item Name</label>
              <input className="input" value={sellName} onChange={e => setSellName(e.target.value)} placeholder="e.g. Hoyt Exceed Riser, 25 inch" required />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Description</label>
              <textarea className="textarea" value={sellDesc} onChange={e => setSellDesc(e.target.value)} placeholder="Describe condition, specs, reason for selling..." rows={3} required />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Price (KSh)</label>
              <input className="input" type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="e.g. 35000" required min={100} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Condition</label>
              <select className="select" value={sellCondition} onChange={e => setSellCondition(e.target.value as StoreListing["condition"])}>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="used">Used</option>
                <option value="well-used">Well Used</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Category</label>
              <select className="select" value={sellCategory} onChange={e => setSellCategory(e.target.value)}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Image (Optional)</label>
              <input type="file" className="input" accept="image/*" onChange={e => setSellImage(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button type="submit" className="btn btn-green" disabled={isUploading}>
              {isUploading ? "Uploading..." : "List for Sale"}
            </button>
            <button type="button" onClick={() => setShowSellForm(false)} className="btn btn-outline" disabled={isUploading}>Cancel</button>
          </div>
        </form>
      )}

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, marginTop: 20, marginBottom: 24, flexWrap: "wrap" }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="btn"
            style={{
              fontSize: "0.8rem",
              padding: "5px 12px",
              background: selectedCategory === cat ? "var(--ke-black)" : "var(--bg-card)",
              color: selectedCategory === cat ? "var(--ke-white)" : "var(--text-secondary)",
              border: `1px solid ${selectedCategory === cat ? "var(--ke-black)" : "var(--border-light)"}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listings grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 20,
      }}>
        {filtered.map((listing) => {
          const isMine = user && listing.sellerId === user.id;
          return (
            <div key={listing.id} className="card" style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
              {/* Image placeholder */}
              <div style={{
                background: "linear-gradient(135deg, #f5f5f0 0%, #e8e5e0 100%)",
                borderRadius: "var(--radius-sm)",
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
                fontSize: "2.5rem",
                position: "relative",
                overflow: "hidden",
              }}>
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  listing.imageEmoji || "🏹"
                )}
                {/* Condition badge */}
                <span style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 12,
                  background: "var(--bg-card)",
                  color: conditionColor(listing.condition),
                  border: `1px solid ${conditionColor(listing.condition)}`,
                  zIndex: 2,
                }}>
                  {conditionLabel(listing.condition)}
                </span>
              </div>

              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>{listing.name}</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.5, flex: 1 }}>
                {listing.description}
              </p>

              {/* Seller info */}
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8 }}>
                {listing.sellerId === "system" ? "Official Store" : `Sold by ${listing.sellerName}`}
                {listing.listedAt && ` • ${listing.listedAt}`}
              </div>

              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--ke-green)", marginBottom: 14 }}>
                KSh {listing.priceKES.toLocaleString()}
              </div>

              {isMine ? (
                <div style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--ke-gold)",
                  textAlign: "center",
                  padding: "8px",
                  border: "1px dashed var(--ke-gold)",
                  borderRadius: "var(--radius-sm)",
                }}>
                  📌 Your listing
                </div>
              ) : (
                <button
                  className="btn btn-red"
                  style={{ width: "100%", marginTop: "auto", fontSize: "0.85rem" }}
                  onClick={() => addItem({
                    id: listing.id,
                    name: listing.name,
                    price: listing.priceKES,
                    quantity: 1,
                  })}
                >
                  Add to Cart
                </button>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            No items in this category. {user ? "Be the first to list something!" : ""}
          </div>
        )}
      </div>

      {/* Prompt to login */}
      {!user && (
        <div style={{ textAlign: "center", marginTop: 32, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <Link href="/login" className="btn btn-green" style={{ marginRight: 8 }}>Log in</Link> to sell your own equipment
        </div>
      )}
    </div>
  );
}