"use client";

import { useState } from "react";

export default function RoiEditor({ clientId, initialRoi }: { clientId: string; initialRoi: string | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialRoi || "");
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(initialRoi || "");
  const [error, setError] = useState("");

  function normalize(v: string) {
    return v.trim().replace(/^[xX]/, "×");
  }

  function isValid(v: string) {
    if (!v) return true; // vide = effacer
    return /^×\d+(\.\d+)?$/.test(v);
  }

  async function save() {
    const normalized = normalize(value);
    if (!isValid(normalized)) {
      setError("Format attendu : ×2.5 ou x2.5");
      return;
    }
    setError("");
    setSaving(true);
    await fetch("/api/clients/update-roi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clientId, roi: normalized || null }),
    });
    setCurrent(normalized);
    setEditing(false);
    setSaving(false);
  }

  if (editing) {
    return (
      <div style={{ marginTop: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <input
            autoFocus
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            placeholder="×2.8"
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            style={{ width: "80px", border: `1px solid ${error ? "#f87171" : "#d1d5db"}`, borderRadius: "5px", padding: "4px 8px", fontSize: "13px", outline: "none" }}
          />
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: "4px 10px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
          >
            {saving ? "…" : "OK"}
          </button>
          <button
            onClick={() => { setEditing(false); setError(""); }}
            style={{ padding: "4px 8px", background: "transparent", border: "1px solid #d1d5db", borderRadius: "5px", fontSize: "12px", cursor: "pointer", color: "#888" }}
          >
            ✕
          </button>
        </div>
        {error
          ? <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px" }}>{error} — utilise le symbole ×</div>
          : <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>Format : x2.5 ou ×2.5 · Laisse vide pour effacer</div>
        }
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "26px", fontWeight: 800, color: current.startsWith("×") ? "#16a34a" : "#1a1a2e" }}>
        {current || "—"}
      </span>
      <button
        onClick={() => setEditing(true)}
        title="Modifier le ROI"
        style={{ padding: "2px 8px", background: "transparent", border: "1px solid #e5e7eb", borderRadius: "4px", fontSize: "11px", color: "#888", cursor: "pointer" }}
      >
        {current ? "Modifier" : "Définir"}
      </button>
    </div>
  );
}
