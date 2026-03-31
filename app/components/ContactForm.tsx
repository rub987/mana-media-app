"use client";

import { useState } from "react";

const inputStyle = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  padding: "10px 12px",
  fontSize: "13px",
  color: "#374151",
  outline: "none",
  boxSizing: "border-box" as const,
};

export default function ContactForm() {
  const [form, setForm] = useState({ entreprise: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "32px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>✓</div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#15803d", marginBottom: "6px" }}>Message envoyé !</div>
        <div style={{ fontSize: "13px", color: "#16a34a" }}>Nous vous répondrons dans les plus brefs délais.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "14px", padding: "32px", border: "1px solid #e5e7eb", textAlign: "left" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>Nom de votre entreprise</label>
          <input
            required
            placeholder="Ex : Hôtel Tahiti Nui"
            value={form.entreprise}
            onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>Email</label>
          <input
            type="email"
            required
            placeholder="contact@votreentreprise.pf"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>Message</label>
          <textarea
            required
            placeholder="Décrivez votre activité et vos objectifs…"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>
        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "10px 12px", fontSize: "12px", color: "#dc2626" }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", background: loading ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", padding: "13px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Envoi en cours…" : "Envoyer le message →"}
        </button>
        <p style={{ fontSize: "12px", color: "#aaa", textAlign: "center", margin: 0 }}>
          Ou contactez-nous directement : <a href="mailto:info@redsoyu.com" style={{ color: "#7b9fff" }}>info@redsoyu.com</a>
        </p>
      </div>
    </form>
  );
}
