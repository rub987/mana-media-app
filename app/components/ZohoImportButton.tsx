"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ZohoImportButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleImport() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/zoho/clients");

    if (res.status === 401) {
      // Pas encore connecté à ZOHO → lancer l'auth
      window.location.href = "/api/zoho/auth";
      return;
    }

    const data = await res.json();

    if (!data.clients || data.clients.length === 0) {
      setMessage("Aucun compte trouvé dans ZOHO.");
      setLoading(false);
      return;
    }

    // Importer chaque client dans Supabase
    const res2 = await fetch("/api/zoho/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clients: data.clients }),
    });

    const result = await res2.json();
    setMessage(`✓ ${result.imported} client(s) importé(s) depuis ZOHO`);
    setLoading(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button
        onClick={handleImport}
        disabled={loading}
        style={{
          background: loading ? "#f0f0f0" : "#fff",
          color: "#1a1a2e",
          border: "1px solid #1a1a2e",
          padding: "9px 18px",
          borderRadius: "6px",
          fontSize: "13px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {loading ? "Import en cours…" : "🔄 Importer depuis ZOHO"}
      </button>
      {message && (
        <span style={{ fontSize: "12px", color: "#16a34a" }}>{message}</span>
      )}
    </div>
  );
}
