"use client";

import { useState } from "react";

export default function CreatePortalAccessButton({ clientId, contactEmail, hasAccess }: {
  clientId: string;
  contactEmail?: string;
  hasAccess: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(hasAccess);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(contactEmail || "");
  const [showForm, setShowForm] = useState(false);

  async function handleCreate() {
    if (!email) return setError("Email requis");
    setLoading(true);
    setError("");

    const res = await fetch("/api/portal/create-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, email }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      setDone(true);
      setShowForm(false);
    }
  }

  if (done) {
    return (
      <span style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, background: "#dcfce7", color: "#16a34a" }}>
        ✓ Accès portail activé
      </span>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={{ padding: "8px 16px", background: "#7b9fff", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
      >
        Créer accès portail
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "280px" }}>
      <input
        type="email"
        placeholder="Email du client"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", outline: "none" }}
      />
      {error && <span style={{ fontSize: "12px", color: "#dc2626" }}>{error}</span>}
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={handleCreate}
          disabled={loading}
          style={{ flex: 1, padding: "8px", background: loading ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Envoi…" : "Envoyer l'invitation →"}
        </button>
        <button
          onClick={() => setShowForm(false)}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff" }}
        >
          ✕
        </button>
      </div>
      <p style={{ fontSize: "11px", color: "#888" }}>Le client recevra un email pour créer son mot de passe.</p>
    </div>
  );
}
