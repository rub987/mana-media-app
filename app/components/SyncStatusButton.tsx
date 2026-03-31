"use client";

import { useState } from "react";

export default function SyncStatusButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ updated: number; total: number } | null>(null);
  const [error, setError] = useState("");

  async function handleSync() {
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/plans/update-status", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      setResult({ updated: data.updated, total: data.total });
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <button
        onClick={handleSync}
        disabled={loading}
        style={{
          padding: "8px 16px",
          background: loading ? "#9ca3af" : "#1a1a2e",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Mise à jour…" : "↻ Synchroniser maintenant"}
      </button>
      {result !== null && (
        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
          ✓ {result.updated} plan(s) mis à jour sur {result.total}
        </span>
      )}
      {error && <span style={{ fontSize: "12px", color: "#dc2626" }}>{error}</span>}
    </div>
  );
}
