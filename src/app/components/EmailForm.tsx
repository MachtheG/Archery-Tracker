"use client";
import { useState } from "react";

export default function EmailForm({ onSend, onClose }: { onSend: (email: string) => void; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0002', padding: 32, maxWidth: 400, margin: '2rem auto', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#d32f2f' }}>&times;</button>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Email Receipt</h2>
      {sent ? (
        <div style={{ color: '#006600', textAlign: 'center', fontWeight: 700, marginBottom: 12 }}>Email sent!</div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); setSent(true); onSend(email); }}>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16 }}
          />
          <button type="submit" style={{ background: '#FFD700', color: '#000', border: 'none', borderRadius: 6, padding: '0.7em 1.5em', fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            Send Receipt
          </button>
        </form>
      )}
    </div>
  );
}
