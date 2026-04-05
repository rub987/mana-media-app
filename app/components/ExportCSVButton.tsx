"use client";

import { useState } from "react";

export default function ExportCSVButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const res = await fetch("/api/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || "export.csv";
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        padding: "8px 16px",
        background: loading ? "#9ca3af" : "#fff",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: 500,
        color: loading ? "#fff" : "#374151",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {loading ? "Export…" : "↓ Export CSV"}
    </button>
  );
}
