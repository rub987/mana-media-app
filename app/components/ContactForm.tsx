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
  const [form, setForm] = useState({ entreprise: "", contact_nom: "", email: "", tel: "", secteur: "", ile: "", message: "", website: "" }); // website = honeypot
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
      body: JSON.stringify({ entreprise: form.entreprise, contact_nom: form.contact_nom, email: form.email, tel: form.tel, secteur: form.secteur, ile: form.ile, message: form.message, website: form.website }),
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

        {/* Honeypot — invisible pour les humains, les bots le remplissent */}
        <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>

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
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>Nom du contact</label>
          <input
            placeholder="Prénom Nom"
            value={form.contact_nom}
            onChange={(e) => setForm({ ...form, contact_nom: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>Téléphone</label>
            <input
              type="tel"
              placeholder="+689 …"
              value={form.tel}
              onChange={(e) => setForm({ ...form, tel: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>Secteur d'activité</label>
            <select value={form.secteur} onChange={(e) => setForm({ ...form, secteur: e.target.value })} style={inputStyle}>
              <option value="">— Choisir —</option>
              <option>Tourisme / Hébergement</option>
              <option>Retail / Commerce</option>
              <option>Automobile</option>
              <option>Institutionnel</option>
              <option>Restauration</option>
              <option>Immobilier</option>
              <option>Santé</option>
              <option>Autre</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>Île / Localisation</label>
            <select value={form.ile} onChange={(e) => setForm({ ...form, ile: e.target.value })} style={inputStyle}>
              <option value="">— Choisir —</option>
              <option>Tahiti</option>
              <option>Moorea</option>
              <option>Bora Bora</option>
              <option>Raiatea</option>
              <option>Autre</option>
            </select>
          </div>
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
