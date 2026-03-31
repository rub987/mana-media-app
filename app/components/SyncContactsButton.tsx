"use client";

import { useState } from "react";

export default function SyncContactsButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ synced?: number; total?: number; error?: string } | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/zoho/sync-contacts", { method: "POST" });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      <button
        onClick={handleSync}
        disabled={loading}
        style={{
          padding: "8px 16px",
          background: loading ? "#9ca3af" : "#1a1a2e",
          color: "#fff",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          border: "none",
        }}
      >
        {loading ? "Synchronisation…" : "Sync contacts ZOHO → App"}
      </button>

      {result && !result.error && (
        <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 500 }}>
          ✓ {result.synced} contact{(result.synced ?? 0) > 1 ? "s" : ""} importé{(result.synced ?? 0) > 1 ? "s" : ""} sur {result.total} clients
        </span>
      )}
      {result?.error && (
        <span style={{ fontSize: "13px", color: "#dc2626" }}>{result.error}</span>
      )}
    </div>
  );
}
