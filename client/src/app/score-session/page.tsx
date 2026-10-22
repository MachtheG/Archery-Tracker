"use client";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ROUNDS, getRoundById, getScoreValues, getScoreColor, getTargetFace } from "../lib/rounds";
import { saveSession, getEquipmentList } from "../lib/storage";
import type { ArrowScore, End, WeatherData, ScoreSession, Equipment } from "../lib/storage";
import VirtualTarget from "../components/VirtualTarget";
import WeatherWidget from "../components/WeatherWidget";
import Link from "next/link";

type Step = "setup" | "scoring" | "review";

export default function ScoreSessionPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("setup");

  // Setup
  const [roundId, setRoundId] = useState("");
  const [customDistance, setCustomDistance] = useState(30);
  const [customEnds, setCustomEnds] = useState(6);
  const [customFaceType, setCustomFaceType] = useState("standard-10");
  const [weather, setWeather] = useState<WeatherData>({ isManual: false });
  const [equipmentId, setEquipmentId] = useState("");
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  // Scoring
  const [ends, setEnds] = useState<End[]>([]);
  const [currentArrows, setCurrentArrows] = useState<ArrowScore[]>([]);
  const [notes, setNotes] = useState("");

  // Load equipment on mount
  useEffect(() => {
    getEquipmentList().then(setEquipmentList);
  }, []);

  const round = getRoundById(roundId);
  const isCustom = roundId === "practice-custom";
  const arrowsPerEnd = round ? round.arrowsPerEnd : 6;
  const totalEnds = isCustom ? customEnds : (round?.totalEnds || 6);
  const distance = isCustom ? customDistance : (round?.distance || 0);
  const faceType = isCustom ? customFaceType : (round?.targetFaceType || "standard-10");
  const face = getTargetFace(faceType);
  const scoreValues = getScoreValues(faceType);

  const currentEndNum = ends.length + 1;
  const endComplete = currentArrows.length >= arrowsPerEnd;
  const sessionComplete = ends.length >= totalEnds;

  // Running totals
  const endsTotalScore = ends.reduce((s, e) => s + e.arrows.reduce((as, a) => as + a.value, 0), 0);
  const currentEndScore = currentArrows.reduce((s, a) => s + a.value, 0);

  const handleArrowPlaced = useCallback((arrow: ArrowScore) => {
    if (endComplete || sessionComplete) return;
    setCurrentArrows(prev => [...prev, arrow]);
  }, [endComplete, sessionComplete]);

  const handleScoreButton = (value: number, isX: boolean) => {
    if (endComplete || sessionComplete) return;
    const ringCount = face.rings.length;
    const ringWidth = MAX_RADIUS / ringCount;

    let ringDist: number;
    if (value === 0) {
      ringDist = MAX_RADIUS + 10;
    } else if (isX) {
      ringDist = Math.random() * ringWidth * face.xRingFraction;
    } else {
      // Find the ring index for this score
      const ringIdx = face.rings.findIndex(r => r.score === value);
      if (ringIdx >= 0) {
        // rings are outside-to-inside: idx 0 = outermost
        const fromCenter = ringCount - ringIdx;
        ringDist = (fromCenter - 1) * ringWidth + Math.random() * ringWidth;
      } else {
        ringDist = MAX_RADIUS * 0.5;
      }
    }

    const angle = Math.random() * 2 * Math.PI;
    const x = CENTER + Math.cos(angle) * ringDist;
    const y = CENTER + Math.sin(angle) * ringDist;

    handleArrowPlaced({ value, isX, position: { x, y } });
  };

  const nextEnd = () => {
    setEnds(prev => [...prev, { arrows: currentArrows }]);
    setCurrentArrows([]);
  };

  const undoArrow = () => {
    setCurrentArrows(prev => prev.slice(0, -1));
  };

  const startScoring = () => {
    if (!roundId) return;
    setEnds([]);
    setCurrentArrows([]);
    setStep("scoring");
  };

  const finishSession = () => {
    let finalEnds = [...ends];
    if (currentArrows.length > 0) {
      finalEnds.push({ arrows: currentArrows });
    }
    setEnds(finalEnds);
    setStep("review");
  };

  const saveAndExit = async () => {
    let finalEnds = step === "review" ? ends : [...ends];
    if (step !== "review" && currentArrows.length > 0) {
      finalEnds.push({ arrows: currentArrows });
    }

    let totalScore = 0, xCount = 0, tenCount = 0;
    finalEnds.forEach(e => e.arrows.forEach(a => {
      totalScore += a.value;
      if (a.isX) xCount++;
      if (a.value === face.maxArrowScore) tenCount++;
    }));

    const session: ScoreSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      roundId,
      roundName: round?.name || "Practice",
      distance,
      targetFace: round?.targetFace || "122cm",
      ends: finalEnds,
      totalScore,
      xCount,
      tenCount,
      weather,
      equipmentId: equipmentId || undefined,
      notes,
    };

    await saveSession(session);
    setStep("setup");
    setRoundId("");
    setEnds([]);
    setCurrentArrows([]);
    setNotes("");
  };

  if (!user) {
    return (
      <div className="page-wrap" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1 className="page-title">Score Session</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Please log in to start scoring.</p>
        <Link href="/login" className="btn btn-green">Log In</Link>
      </div>
    );
  }

  // ── SETUP ──
  if (step === "setup") {
    return (
      <div className="page-wrap" style={{ maxWidth: 640 }}>
        <h1 className="page-title">New Score Session</h1>
        <p className="page-subtitle">Select your round and conditions</p>

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Round Selection</h2>

          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Round Type</label>
          <select className="select" value={roundId} onChange={e => setRoundId(e.target.value)} style={{ marginBottom: 12 }}>
            <option value="">— Select a round —</option>
            <optgroup label="🏹 Recurve Outdoor">
              {ROUNDS.filter(r => r.discipline === "recurve" && r.category === "outdoor").map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.arrowsPerEnd}×{r.totalEnds})</option>
              ))}
            </optgroup>
            <optgroup label="🏹 Recurve Indoor">
              {ROUNDS.filter(r => r.discipline === "recurve" && r.category === "indoor").map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.arrowsPerEnd}×{r.totalEnds})</option>
              ))}
            </optgroup>
            <optgroup label="🎯 Compound Outdoor">
              {ROUNDS.filter(r => r.discipline === "compound" && r.category === "outdoor").map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.arrowsPerEnd}×{r.totalEnds})</option>
              ))}
            </optgroup>
            <optgroup label="🎯 Compound Indoor">
              {ROUNDS.filter(r => r.discipline === "compound" && r.category === "indoor").map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.arrowsPerEnd}×{r.totalEnds})</option>
              ))}
            </optgroup>
            <optgroup label="🏹 Barebow">
              {ROUNDS.filter(r => r.discipline === "barebow").map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.arrowsPerEnd}×{r.totalEnds})</option>
              ))}
            </optgroup>
            <optgroup label="🌲 Field Archery">
              {ROUNDS.filter(r => r.category === "field").map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.arrowsPerEnd}×{r.totalEnds})</option>
              ))}
            </optgroup>
            <optgroup label="⚙️ Practice">
              {ROUNDS.filter(r => r.category === "practice").map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </optgroup>
          </select>

          {round && (
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 12 }}>{round.description}</div>
          )}

          {/* Preview target face */}
          {round && (
            <div style={{
              display: "flex", gap: 16, alignItems: "center",
              padding: 12, background: "var(--bg-primary)", borderRadius: "var(--radius-sm)", marginBottom: 12,
            }}>
              <div style={{ width: 80, flexShrink: 0 }}>
                <VirtualTarget arrows={[]} disabled size={80} targetFaceType={faceType} />
              </div>
              <div style={{ fontSize: "0.85rem" }}>
                <div><strong>Discipline:</strong> {round.discipline.charAt(0).toUpperCase() + round.discipline.slice(1)}</div>
                <div><strong>Target:</strong> {round.targetFace} — {face.name}</div>
                <div><strong>Scoring:</strong> {face.hasXRing ? `X, ${face.maxArrowScore}` : face.maxArrowScore}–{face.rings[0].score}, M</div>
                {round.distance > 0 && <div><strong>Distance:</strong> {round.distance}m</div>}
                <div><strong>Arrows:</strong> {round.arrowsPerEnd * round.totalEnds}</div>
              </div>
            </div>
          )}

          {isCustom && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Distance (m)</label>
                <input className="input" type="number" value={customDistance} onChange={e => setCustomDistance(+e.target.value)} min={5} max={100} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Ends</label>
                <input className="input" type="number" value={customEnds} onChange={e => setCustomEnds(+e.target.value)} min={1} max={30} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Target Face</label>
                <select className="select" value={customFaceType} onChange={e => setCustomFaceType(e.target.value)}>
                  <option value="standard-10">Standard 10-Ring</option>
                  <option value="compound-6">Compound 6-Ring</option>
                  <option value="field-4">Field 4-Zone</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Weather */}
        <div style={{ marginBottom: 20 }}>
          <WeatherWidget weather={weather} onChange={setWeather} />
        </div>

        {/* Equipment */}
        {equipmentList.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>Equipment</h2>
            <select className="select" value={equipmentId} onChange={e => setEquipmentId(e.target.value)}>
              <option value="">— No equipment selected —</option>
              {equipmentList.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name} ({eq.bowType})</option>
              ))}
            </select>
          </div>
        )}

        <button onClick={startScoring} disabled={!roundId} className="btn btn-green" style={{ width: "100%", padding: "14px", fontSize: "1rem" }}>
          Start Scoring
        </button>
      </div>
    );
  }

  // ── SCORING ──
  if (step === "scoring") {
    return (
      <div className="page-wrap" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>{round?.name || "Practice"}</h1>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {round?.category === "field" ? `Target ${Math.min(currentEndNum, totalEnds)}` : `End ${Math.min(currentEndNum, totalEnds)}`} of {totalEnds}
              {distance > 0 ? ` • ${distance}m` : ""}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--ke-green)" }}>{endsTotalScore + currentEndScore}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Running Total</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          {/* Left: Virtual Target */}
          <div>
            <VirtualTarget
              arrows={currentArrows}
              onArrowPlaced={handleArrowPlaced}
              disabled={endComplete || sessionComplete}
              targetFaceType={faceType}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={undoArrow} disabled={currentArrows.length === 0} className="btn btn-outline" style={{ fontSize: "0.8rem", flex: 1 }}>
                Undo Last Arrow
              </button>
            </div>
          </div>

          {/* Right: Score buttons + current end */}
          <div>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 10 }}>
              {round?.category === "field" ? `Target ${Math.min(currentEndNum, totalEnds)}` : `End ${Math.min(currentEndNum, totalEnds)}`} — {currentArrows.length}/{arrowsPerEnd} arrows
            </h3>

            {/* Dynamic score buttons */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(scoreValues.length, 5)}, 1fr)`, gap: 6, marginBottom: 16 }}>
              {scoreValues.map(sv => {
                const colors = getScoreColor(faceType, sv.value, sv.isX);
                return (
                  <button
                    key={sv.label}
                    onClick={() => handleScoreButton(sv.value, sv.isX)}
                    disabled={endComplete || sessionComplete}
                    className="btn"
                    style={{
                      background: colors.bg,
                      color: colors.text,
                      padding: "10px 4px",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      border: sv.value === 0 ? "1px solid var(--border-light)" : "1px solid transparent",
                    }}
                  >
                    {sv.label}
                  </button>
                );
              })}
            </div>

            {/* Current end arrows */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {currentArrows.map((a, i) => {
                const colors = getScoreColor(faceType, a.value, a.isX);
                return (
                  <span key={i} style={{
                    display: "inline-flex", width: 36, height: 36,
                    alignItems: "center", justifyContent: "center",
                    borderRadius: "50%", fontWeight: 700, fontSize: "0.85rem",
                    background: colors.bg, color: colors.text,
                    border: "2px solid var(--bg-card)", boxShadow: "var(--shadow-sm)",
                  }}>
                    {a.isX ? "X" : a.value === 0 ? "M" : a.value}
                  </span>
                );
              })}
              {Array.from({ length: arrowsPerEnd - currentArrows.length }).map((_, i) => (
                <span key={`e-${i}`} style={{
                  display: "inline-flex", width: 36, height: 36,
                  alignItems: "center", justifyContent: "center",
                  borderRadius: "50%", border: "2px dashed var(--border-light)",
                  color: "var(--text-muted)", fontSize: "0.75rem",
                }}>—</span>
              ))}
              <span style={{ display: "flex", alignItems: "center", fontWeight: 700, marginLeft: 4 }}>
                = {currentEndScore}
              </span>
            </div>

            {/* End/Session controls */}
            {endComplete && !sessionComplete && (
              <button onClick={nextEnd} className="btn btn-green" style={{ width: "100%", marginBottom: 8 }}>
                {round?.category === "field" ? "Next Target →" : "Next End →"}
              </button>
            )}
            {sessionComplete && (
              <button onClick={finishSession} className="btn btn-gold" style={{ width: "100%", marginBottom: 8 }}>
                Finish & Review
              </button>
            )}
            {!sessionComplete && ends.length > 0 && (
              <button onClick={finishSession} className="btn btn-outline" style={{ width: "100%", fontSize: "0.8rem" }}>
                End Early & Review
              </button>
            )}
          </div>
        </div>

        {/* Completed ends scorecard */}
        {ends.length > 0 && (
          <div className="card" style={{ marginTop: 24, padding: 0, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "var(--ke-black)", color: "var(--ke-white)" }}>
                  <th style={{ padding: "8px 12px" }}>{round?.category === "field" ? "Tgt" : "End"}</th>
                  {Array.from({ length: arrowsPerEnd }).map((_, i) => (
                    <th key={i} style={{ padding: "8px 6px", textAlign: "center" }}>A{i + 1}</th>
                  ))}
                  <th style={{ padding: "8px 12px" }}>{round?.category === "field" ? "Tgt" : "End"}</th>
                  <th style={{ padding: "8px 12px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {ends.map((end, ei) => {
                  const endScore = end.arrows.reduce((s, a) => s + a.value, 0);
                  const runningTotal = ends.slice(0, ei + 1).reduce((s, e) => s + e.arrows.reduce((as, a) => as + a.value, 0), 0);
                  return (
                    <tr key={ei} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{ei + 1}</td>
                      {end.arrows.map((a, ai) => (
                        <td key={ai} style={{
                          padding: "8px 6px", textAlign: "center",
                          fontWeight: a.isX || a.value >= face.maxArrowScore ? 700 : 400,
                          color: a.isX ? "var(--ke-gold)" : a.value >= face.maxArrowScore ? "var(--ke-green)" : undefined,
                        }}>
                          {a.isX ? "X" : a.value === 0 ? "M" : a.value}
                        </td>
                      ))}
                      <td style={{ padding: "8px 12px", fontWeight: 700 }}>{endScore}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 700, color: "var(--ke-green)" }}>{runningTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── REVIEW ──
  const allArrowsReview = ends.flatMap(e => e.arrows);
  const totalScore = allArrowsReview.reduce((s, a) => s + a.value, 0);
  const xCount = allArrowsReview.filter(a => a.isX).length;
  const tenCount = allArrowsReview.filter(a => a.value === face.maxArrowScore).length;
  const totalArrowsCount = allArrowsReview.length;
  const maxScore = totalArrowsCount * face.maxArrowScore;
  const percentage = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(1) : "0";
  const avgPerArrow = totalArrowsCount > 0 ? (totalScore / totalArrowsCount).toFixed(2) : "0";

  return (
    <div className="page-wrap" style={{ maxWidth: 800 }} id="score-report">
      <h1 className="page-title">Session Review</h1>
      <p className="page-subtitle">{round?.name || "Practice"} — {new Date().toLocaleDateString()}</p>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Score", value: `${totalScore}/${maxScore}`, color: "var(--ke-green)" },
          { label: "Percentage", value: `${percentage}%`, color: "var(--ke-gold)" },
          { label: "Avg/Arrow", value: avgPerArrow, color: "var(--ke-red)" },
          ...(face.hasXRing ? [{ label: "X Count", value: String(xCount), color: "var(--ke-gold)" }] : []),
          { label: `${face.maxArrowScore}${face.hasXRing ? "+X" : ""} Count`, value: String(tenCount), color: "var(--ke-green)" },
          { label: "Arrows Shot", value: String(totalArrowsCount), color: "var(--text-primary)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "14px 10px" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Virtual target with all arrows */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>Shot Grouping</h2>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <VirtualTarget arrows={allArrowsReview} disabled size={340} targetFaceType={faceType} />
        </div>
      </div>

      {/* Full scorecard */}
      <div className="card" style={{ marginBottom: 24, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "var(--ke-black)", color: "var(--ke-white)" }}>
              <th style={{ padding: "8px 12px" }}>{round?.category === "field" ? "Tgt" : "End"}</th>
              {Array.from({ length: arrowsPerEnd }).map((_, i) => (
                <th key={i} style={{ padding: "8px 6px", textAlign: "center" }}>A{i + 1}</th>
              ))}
              <th style={{ padding: "8px 12px" }}>{round?.category === "field" ? "Tgt" : "End"}</th>
              <th style={{ padding: "8px 12px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {ends.map((end, ei) => {
              const endScore = end.arrows.reduce((s, a) => s + a.value, 0);
              const runningTotal = ends.slice(0, ei + 1).reduce((s, e) => s + e.arrows.reduce((as, a) => as + a.value, 0), 0);
              return (
                <tr key={ei} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{ei + 1}</td>
                  {end.arrows.map((a, ai) => (
                    <td key={ai} style={{
                      padding: "8px 6px", textAlign: "center",
                      fontWeight: a.isX || a.value >= face.maxArrowScore ? 700 : 400,
                      color: a.isX ? "var(--ke-gold)" : a.value >= face.maxArrowScore ? "var(--ke-green)" : undefined,
                    }}>
                      {a.isX ? "X" : a.value === 0 ? "M" : a.value}
                    </td>
                  ))}
                  <td style={{ padding: "8px 12px", fontWeight: 700 }}>{endScore}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 700, color: "var(--ke-green)" }}>{runningTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 10 }}>Session Notes</h2>
        <textarea className="textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this session..." rows={3} />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={saveAndExit} className="btn btn-green" style={{ fontSize: "1rem", padding: "12px 32px" }}>
          Save Session
        </button>
        <button onClick={() => window.print()} className="btn btn-dark" style={{ fontSize: "0.9rem" }}>
          📄 Export PDF
        </button>
        <button onClick={() => setStep("setup")} className="btn btn-outline">
          Discard
        </button>
      </div>
    </div>
  );
}

// Constants used in handleScoreButton
const CENTER = 200;
const MAX_RADIUS = 180;
