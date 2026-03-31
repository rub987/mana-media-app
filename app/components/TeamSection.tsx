"use client";

import { useState, useEffect } from "react";

type Admin = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  invited: boolean;
};

function getInitials(email: string) {
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function TeamSection() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function loadAdmins() {
    const res = await fetch("/api/admin/list");
    const data = await res.json();
    if (data.admins) setAdmins(data.admins);
    setLoading(false);
  }

  useEffect(() => { loadAdmins(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setSending(false);

    if (data.error) {
      setError(data.error);
    } else {
      setSuccess(`Invitation envoyée à ${email}`);
      setEmail("");
      loadAdmins();
    }
  }

  return (
    <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
        Équipe
      </div>

      {/* Liste des admins */}
      <div style={{ padding: "8px 20px" }}>
        {loading ? (
          <div style={{ padding: "16px 0", fontSize: "13px", color: "#aaa" }}>Chargement…</div>
        ) : admins.map((admin) => (
          <div key={admin.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #7b9fff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
              {getInitials(admin.email || "")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {admin.email}
              </div>
              <div style={{ fontSize: "11px", color: "#888" }}>
                {admin.invited ? "Invitation en attente" : `Dernière connexion : ${admin.last_sign_in_at ? formatDate(admin.last_sign_in_at) : "—"}`}
              </div>
            </div>
            <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: admin.invited ? "#fff7ed" : "#dcfce7", color: admin.invited ? "#c2410c" : "#16a34a", flexShrink: 0 }}>
              {admin.invited ? "En attente" : "Actif"}
            </span>
          </div>
        ))}
      </div>

      {/* Formulaire invitation */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>
          Inviter un nouveau membre de l'équipe
        </div>
        <form onSubmit={handleInvite} style={{ display: "flex", gap: "8px" }}>
          <input
            type="email"
            placeholder="email@redsoyu.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", outline: "none" }}
          />
          <button
            type="submit"
            disabled={sending}
            style={{ padding: "8px 16px", background: sending ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: sending ? "not-allowed" : "pointer" }}
          >
            {sending ? "Envoi…" : "Inviter"}
          </button>
        </form>
        {success && <p style={{ fontSize: "12px", color: "#16a34a", marginTop: "8px", fontWeight: 600 }}>✓ {success}</p>}
        {error && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "8px" }}>{error}</p>}
      </div>
    </div>
  );
}
