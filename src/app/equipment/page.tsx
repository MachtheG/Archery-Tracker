"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getEquipmentList, saveEquipment, deleteEquipment, getTuningEntries, saveTuningEntry } from "../lib/storage";
import { MAINTENANCE_CATEGORIES, getTipsByCategory } from "../lib/maintenance";
import type { Equipment, TuningEntry } from "../lib/storage";
import Link from "next/link";

type Tab = "quiver" | "tuning" | "maintenance";

export default function EquipmentPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("quiver");
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [tuning, setTuning] = useState<TuningEntry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(MAINTENANCE_CATEGORIES[0]);

  // Form state
  const [form, setForm] = useState<Partial<Equipment>>({ bowType: "recurve" });
  const [tuneForm, setTuneForm] = useState({ change: "", impact: "", notes: "" });

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    getEquipmentList().then(setEquipment);
    getTuningEntries().then(setTuning);
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    const eq: Partial<Equipment> & { name: string } = {
      id: form.id,
      name: form.name || "Unnamed Setup",
      bowType: (form.bowType as Equipment["bowType"]) || "recurve",
      drawWeight: form.drawWeight || "",
      braceHeight: form.braceHeight || "",
      tiller: form.tiller || "",
      arrowType: form.arrowType || "",
      arrowSpine: form.arrowSpine || "",
      arrowLength: form.arrowLength || "",
      sightSettings: form.sightSettings || "",
      notes: form.notes || "",
    };
    await saveEquipment(eq);
    setShowForm(false);
    setForm({ bowType: "recurve" });
    refresh();
  };

  const handleAddTuning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !tuneForm.change.trim()) return;
    await saveTuningEntry({
      equipmentId: selectedId,
      date: new Date().toISOString().slice(0, 10),
      change: tuneForm.change,
      impact: tuneForm.impact,
      notes: tuneForm.notes,
    });
    setTuneForm({ change: "", impact: "", notes: "" });
    refresh();
  };

  if (!user) {
    return (
      <div className="page-wrap" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1 className="page-title">Equipment</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Please log in to manage your equipment.</p>
        <Link href="/login" className="btn btn-green">Log In</Link>
      </div>
    );
  }

  const tabStyle = (t: Tab) => ({
    padding: "8px 20px",
    fontWeight: tab === t ? 700 : 500,
    fontSize: "0.9rem",
    background: tab === t ? "var(--ke-black)" : "transparent",
    color: tab === t ? "var(--ke-white)" : "var(--text-secondary)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer" as const,
    fontFamily: "inherit",
  });

  const selectedEq = equipment.find(e => e.id === selectedId);
  const eqTuning = tuning.filter(t => t.equipmentId === selectedId);

  return (
    <div className="page-wrap">
      <h1 className="page-title">Virtual Quiver</h1>
      <p className="page-subtitle">Manage your equipment, track adjustments, and get maintenance tips</p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28, background: "var(--bg-card)", padding: 4, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
        <button style={tabStyle("quiver")} onClick={() => setTab("quiver")}>🏹 Equipment</button>
        <button style={tabStyle("tuning")} onClick={() => setTab("tuning")}>🔧 Tuning History</button>
        <button style={tabStyle("maintenance")} onClick={() => setTab("maintenance")}>📋 Maintenance Tips</button>
      </div>

      {/* ── QUIVER TAB ── */}
      {tab === "quiver" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{equipment.length} equipment set{equipment.length !== 1 ? "s" : ""}</span>
            <button onClick={() => { setForm({ bowType: "recurve" }); setShowForm(true); }} className="btn btn-green" style={{ fontSize: "0.85rem" }}>
              + Add Equipment
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSaveEquipment} className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>{form.id ? "Edit" : "New"} Equipment</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Setup Name</label>
                  <input className="input" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Competition Recurve" required />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Bow Type</label>
                  <select className="select" value={form.bowType} onChange={e => setForm({ ...form, bowType: e.target.value as Equipment["bowType"] })}>
                    <option value="recurve">Recurve</option>
                    <option value="compound">Compound</option>
                    <option value="barebow">Barebow</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Draw Weight</label>
                  <input className="input" value={form.drawWeight || ""} onChange={e => setForm({ ...form, drawWeight: e.target.value })} placeholder="e.g. 38 lbs" />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Brace Height</label>
                  <input className="input" value={form.braceHeight || ""} onChange={e => setForm({ ...form, braceHeight: e.target.value })} placeholder="e.g. 22.5 cm" />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Tiller</label>
                  <input className="input" value={form.tiller || ""} onChange={e => setForm({ ...form, tiller: e.target.value })} placeholder="e.g. 3mm positive" />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Arrow Type</label>
                  <input className="input" value={form.arrowType || ""} onChange={e => setForm({ ...form, arrowType: e.target.value })} placeholder="e.g. Easton X10" />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Arrow Spine</label>
                  <input className="input" value={form.arrowSpine || ""} onChange={e => setForm({ ...form, arrowSpine: e.target.value })} placeholder="e.g. 600" />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Arrow Length</label>
                  <input className="input" value={form.arrowLength || ""} onChange={e => setForm({ ...form, arrowLength: e.target.value })} placeholder="e.g. 28 inches" />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Sight Settings</label>
                  <input className="input" value={form.sightSettings || ""} onChange={e => setForm({ ...form, sightSettings: e.target.value })} placeholder="e.g. 18m: 4.2, 70m: 7.8" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Notes</label>
                  <textarea className="textarea" value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={2} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button type="submit" className="btn btn-green">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
              </div>
            </form>
          )}

          {/* Equipment cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {equipment.map(eq => (
              <div key={eq.id} className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{eq.name}</h3>
                    <span className={`badge badge-${eq.bowType === "recurve" ? "archer" : eq.bowType === "compound" ? "coach" : "admin"}`}>
                      {eq.bowType}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { setForm(eq); setShowForm(true); }} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>Edit</button>
                    <button onClick={async () => { await deleteEquipment(eq.id); refresh(); }} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "4px 8px", color: "var(--ke-red)" }}>Delete</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: "0.85rem" }}>
                  {eq.drawWeight && <div><strong>Draw:</strong> {eq.drawWeight}</div>}
                  {eq.braceHeight && <div><strong>Brace:</strong> {eq.braceHeight}</div>}
                  {eq.tiller && <div><strong>Tiller:</strong> {eq.tiller}</div>}
                  {eq.arrowType && <div><strong>Arrows:</strong> {eq.arrowType}</div>}
                  {eq.arrowSpine && <div><strong>Spine:</strong> {eq.arrowSpine}</div>}
                  {eq.arrowLength && <div><strong>Length:</strong> {eq.arrowLength}</div>}
                </div>
                {eq.sightSettings && <div style={{ marginTop: 8, fontSize: "0.85rem" }}><strong>Sight:</strong> {eq.sightSettings}</div>}
                {eq.notes && <div style={{ marginTop: 6, fontSize: "0.85rem", color: "var(--text-secondary)" }}>{eq.notes}</div>}
              </div>
            ))}
            {equipment.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No equipment added yet. Add your first setup above.</p>}
          </div>
        </>
      )}

      {/* ── TUNING TAB ── */}
      {tab === "tuning" && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Select Equipment</label>
            <select className="select" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">— Select equipment —</option>
              {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name} ({eq.bowType})</option>)}
            </select>
          </div>

          {selectedId && (
            <>
              <form onSubmit={handleAddTuning} className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>Log an Adjustment</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input className="input" value={tuneForm.change} onChange={e => setTuneForm({ ...tuneForm, change: e.target.value })} placeholder="What did you change? (e.g. Moved sight 2 clicks right)" required />
                  <input className="input" value={tuneForm.impact} onChange={e => setTuneForm({ ...tuneForm, impact: e.target.value })} placeholder="Impact on performance? (e.g. Group shifted left)" />
                  <textarea className="textarea" value={tuneForm.notes} onChange={e => setTuneForm({ ...tuneForm, notes: e.target.value })} placeholder="Additional notes..." rows={2} />
                  <button type="submit" className="btn btn-green" style={{ alignSelf: "flex-start" }}>Log Adjustment</button>
                </div>
              </form>

              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>Adjustment History — {selectedEq?.name}</h3>
              {eqTuning.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No adjustments logged for this equipment.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {eqTuning.map(t => (
                    <div key={t.id} className="card" style={{ padding: "14px 18px", borderLeft: "3px solid var(--ke-gold)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{t.change}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.date}</span>
                      </div>
                      {t.impact && <div style={{ fontSize: "0.85rem", color: "var(--ke-green)", fontWeight: 600 }}>Impact: {t.impact}</div>}
                      {t.notes && <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 4 }}>{t.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {!selectedId && equipment.length === 0 && (
            <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Add equipment first in the Equipment tab.</p>
          )}
        </>
      )}

      {/* ── MAINTENANCE TAB ── */}
      {tab === "maintenance" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {MAINTENANCE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="btn"
                style={{
                  fontSize: "0.8rem",
                  padding: "6px 12px",
                  background: selectedCategory === cat ? "var(--ke-green)" : "var(--bg-card)",
                  color: selectedCategory === cat ? "var(--ke-white)" : "var(--text-secondary)",
                  border: `1px solid ${selectedCategory === cat ? "var(--ke-green)" : "var(--border-light)"}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {getTipsByCategory(selectedCategory).map(tip => (
              <div key={tip.id} className="card">
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8, color: "var(--ke-green)" }}>{tip.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: 1.7, marginBottom: 10 }}>{tip.content}</p>
                {tip.brands.length > 0 && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>
                    <strong>Brands:</strong> {tip.brands.join(", ")}
                  </div>
                )}
                <div style={{ fontSize: "0.8rem", color: "var(--ke-gold)", fontWeight: 600 }}>
                  🇰🇪 {tip.kenyanAvailability}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
