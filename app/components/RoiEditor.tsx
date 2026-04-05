"use client";

import { useState } from "react";

export default function RoiEditor({ clientId, initialRoi }: { clientId: string; initialRoi: string | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialRoi || "");
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(initialRoi || "");

  async function save() {
    setSaving(true);
    await fetch("/api/clients/update-roi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clientId, roi: value }),
    });
    setCurrent(value);
    setEditing(false);
    setSaving(false);
  }

  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ex : ×2.8"
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          style={{ width: "90px", border: "1px solid #d1d5db", borderRadius: "5px", padding: "4px 8px", fontSize: "13px", outline: "none" }}
        />
        <button
          onClick={save}
          disabled={saving}
          style={{ padding: "4px 10px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
        >
          {saving ? "…" : "OK"}
        </button>
        <button
          onClick={() => setEditing(false)}
          style={{ padding: "4px 8px", background: "transparent", border: "1px solid #d1d5db", borderRadius: "5px", fontSize: "12px", cursor: "pointer", color: "#888" }}
        >
          ✕
        </button>
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
