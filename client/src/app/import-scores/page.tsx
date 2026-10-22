"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ROUNDS } from "../lib/rounds";
import { saveSession } from "../lib/storage";
import type { ScoreSession } from "../lib/storage";
import Link from "next/link";

type CsvRow = {
  date: string;
  roundId: string;
  roundName: string;
  totalScore: number;
  arrowsShot: number;
  xCount: number;
  tenCount: number;
  notes: string;
};

const CSV_TEMPLATE = "date,round,totalScore,arrowsShot,xCount,tenCount,notes\n2026-03-14,recurve-70m,612,72,8,30,Windy afternoon session\n2026-02-02,recurve-18m-indoor,560,60,,,\n";

function parseCsv(text: string): { rows: CsvRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const errors: string[] = [];
  if (lines.length < 2) {
    return { rows: [], errors: ["CSV needs a header row and at least one data row."] };
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const idx = {
    date: col("date"),
    round: col("round"),
    totalScore: col("totalscore"),
    arrowsShot: col("arrowsshot"),
    xCount: col("xcount"),
    tenCount: col("tencount"),
    notes: col("notes"),
  };
  if (idx.date === -1 || idx.round === -1 || idx.totalScore === -1 || idx.arrowsShot === -1) {
    errors.push("Header row must include: date, round, totalScore, arrowsShot (xCount, tenCount, notes are optional).");
    return { rows: [], errors };
  }

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.trim());
    const date = cells[idx.date];
    const roundRaw = cells[idx.round];
    const totalScore = Number(cells[idx.totalScore]);
    const arrowsShot = Number(cells[idx.arrowsShot]);
    const xCount = idx.xCount >= 0 ? Number(cells[idx.xCount] || 0) : 0;
    const tenCount = idx.tenCount >= 0 ? Number(cells[idx.tenCount] || 0) : 0;
    const notes = idx.notes >= 0 ? (cells[idx.notes] || "") : "";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`Row ${i + 1}: date "${date}" must be YYYY-MM-DD.`);
      continue;
    }
    if (!Number.isFinite(totalScore) || totalScore < 0) {
      errors.push(`Row ${i + 1}: totalScore "${cells[idx.totalScore]}" is not a valid number.`);
      continue;
    }
    if (!Number.isFinite(arrowsShot) || arrowsShot <= 0) {
      errors.push(`Row ${i + 1}: arrowsShot "${cells[idx.arrowsShot]}" must be a positive number.`);
      continue;
    }

    const matchedRound = ROUNDS.find((r) => r.id === roundRaw);
    rows.push({
      date,
      roundId: matchedRound ? matchedRound.id : "imported",
      roundName: matchedRound ? matchedRound.name : (roundRaw || "Imported Session"),
      totalScore,
      arrowsShot,
      xCount,
      tenCount,
      notes,
    });
  }

  return { rows, errors };
}

export default function ImportScores() {
  const { user } = useAuth();

  // CSV upload
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  // Manual single entry
  const [manual, setManual] = useState({ date: "", roundId: "", totalScore: "", arrowsShot: "", xCount: "", tenCount: "", notes: "" });
  const [manualSaved, setManualSaved] = useState(false);

  if (!user) {
    return (
      <div className="page-wrap" style={{ textAlign: "center", paddingTop: 80 }}>
        <h1 className="page-title">Import Previous Scores</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Please log in to import your scores.</p>
        <Link href="/login" className="btn btn-green">Log In</Link>
      </div>
    );
  }

  const handleFile = async (file: File) => {
    const text = await file.text();
    setCsvText(text);
    const { rows, errors } = parseCsv(text);
    setPreview(rows);
    setCsvErrors(errors);
    setImportedCount(null);
  };

  const handleImportCsv = async () => {
    setImporting(true);
    let count = 0;
    for (const row of preview) {
      const session: ScoreSession = {
        id: `import-${Date.now()}-${count}`,
        date: row.date,
        roundId: row.roundId,
        roundName: row.roundName,
        distance: 0,
        targetFace: "",
        ends: [],
        totalScore: row.totalScore,
        xCount: row.xCount,
        tenCount: row.tenCount,
        weather: { isManual: false },
        notes: row.notes,
        imported: true,
        arrowsShot: row.arrowsShot,
      };
      await saveSession(session);
      count++;
    }
    setImportedCount(count);
    setPreview([]);
    setCsvText("");
    setImporting(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "archery-scores-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedRound = ROUNDS.find((r) => r.id === manual.roundId);
    const session: ScoreSession = {
      id: `import-${Date.now()}`,
      date: manual.date,
      roundId: manual.roundId || "imported",
      roundName: matchedRound ? matchedRound.name : "Imported Session",
      distance: matchedRound?.distance || 0,
      targetFace: matchedRound?.targetFace || "",
      ends: [],
      totalScore: Number(manual.totalScore) || 0,
      xCount: Number(manual.xCount) || 0,
      tenCount: Number(manual.tenCount) || 0,
      weather: { isManual: false },
      notes: manual.notes,
      imported: true,
      arrowsShot: Number(manual.arrowsShot) || 1,
    };
    await saveSession(session);
    setManual({ date: "", roundId: "", totalScore: "", arrowsShot: "", xCount: "", tenCount: "", notes: "" });
    setManualSaved(true);
    setTimeout(() => setManualSaved(false), 3000);
  };

  return (
    <div className="page-wrap" style={{ maxWidth: 720 }}>
      <h1 className="page-title">Import Previous Scores</h1>
      <p className="page-subtitle">
        Already have training scores on paper or in a spreadsheet? Bring them into Archery Kenya so your history,
        analytics, and leaderboard eligibility reflect your real progress.
      </p>

      {/* CSV upload */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Bulk Upload (CSV)</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 12 }}>
          Columns: <code>date, round, totalScore, arrowsShot, xCount, tenCount, notes</code>.{" "}
          <code>round</code> should match a round ID (e.g. <code>recurve-70m</code>) if you want it matched to a known round — otherwise it's stored as free text.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <button type="button" onClick={downloadTemplate} className="btn btn-outline" style={{ fontSize: "0.85rem" }}>
            Download CSV Template
          </button>
          <label className="btn btn-green" style={{ fontSize: "0.85rem", cursor: "pointer" }}>
            Choose CSV File
            <input
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        </div>

        {csvErrors.length > 0 && (
          <div className="error-text" style={{ marginBottom: 12 }}>
            {csvErrors.map((err, i) => <div key={i}>{err}</div>)}
          </div>
        )}

        {preview.length > 0 && (
          <>
            <div style={{ overflow: "auto", marginBottom: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "var(--bg-primary)" }}>
                    <th style={{ padding: "6px 10px", textAlign: "left" }}>Date</th>
                    <th style={{ padding: "6px 10px", textAlign: "left" }}>Round</th>
                    <th style={{ padding: "6px 10px" }}>Score</th>
                    <th style={{ padding: "6px 10px" }}>Arrows</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "6px 10px" }}>{r.date}</td>
                      <td style={{ padding: "6px 10px" }}>{r.roundName}</td>
                      <td style={{ padding: "6px 10px", textAlign: "center" }}>{r.totalScore}</td>
                      <td style={{ padding: "6px 10px", textAlign: "center" }}>{r.arrowsShot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handleImportCsv} disabled={importing} className="btn btn-green">
              {importing ? "Importing..." : `Import ${preview.length} Session${preview.length !== 1 ? "s" : ""}`}
            </button>
          </>
        )}

        {importedCount !== null && (
          <div style={{ marginTop: 12, color: "var(--ke-green)", fontWeight: 600, fontSize: "0.9rem" }}>
            ✅ Imported {importedCount} session{importedCount !== 1 ? "s" : ""}. View them on your{" "}
            <Link href="/dashboard" style={{ color: "var(--ke-green)" }}>dashboard</Link>.
          </div>
        )}
      </div>

      {/* Manual single entry */}
      <div className="card">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>Add One Past Session</h2>
        <form onSubmit={handleManualSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Date</label>
            <input type="date" className="input" required value={manual.date} onChange={(e) => setManual({ ...manual, date: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Round</label>
            <select className="select" value={manual.roundId} onChange={(e) => setManual({ ...manual, roundId: e.target.value })}>
              <option value="">— Other / not listed —</option>
              {ROUNDS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Total Score</label>
            <input type="number" className="input" required min={0} value={manual.totalScore} onChange={(e) => setManual({ ...manual, totalScore: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Arrows Shot</label>
            <input type="number" className="input" required min={1} value={manual.arrowsShot} onChange={(e) => setManual({ ...manual, arrowsShot: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>X Count (optional)</label>
            <input type="number" className="input" min={0} value={manual.xCount} onChange={(e) => setManual({ ...manual, xCount: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>10s (optional)</label>
            <input type="number" className="input" min={0} value={manual.tenCount} onChange={(e) => setManual({ ...manual, tenCount: e.target.value })} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Notes (optional)</label>
            <textarea className="textarea" rows={2} value={manual.notes} onChange={(e) => setManual({ ...manual, notes: e.target.value })} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="btn btn-green">Add Past Session</button>
            {manualSaved && <span style={{ marginLeft: 12, color: "var(--ke-green)", fontWeight: 600, fontSize: "0.85rem" }}>✅ Added</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
