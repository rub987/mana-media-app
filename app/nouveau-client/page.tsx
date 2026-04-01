"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../components/Sidebar";

const canaux_options = ["Radio", "Digital", "Print", "Affichage", "TV"];

export default function NouveauClient() {
  return (
    <Suspense fallback={null}>
      <NouveauClientForm />
    </Suspense>
  );
}

function NouveauClientForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: searchParams.get("nom") || "",
    secteur: searchParams.get("secteur") || "",
    ile: searchParams.get("ile") || "",
    offre: "PERFORMANCE",
    budget_mensuel: "",
    contrat: "6 mois",
    canaux: [] as string[],
    contact_nom: searchParams.get("contact_nom") || "",
    contact_email: searchParams.get("email") || "",
    contact_tel: searchParams.get("tel") || "",
    notes: searchParams.get("message") ? `Message initial : ${searchParams.get("message")}` : "",
  });

  function toggleCanal(canal: string) {
    setForm((f) => ({
      ...f,
      canaux: f.canaux.includes(canal)
        ? f.canaux.filter((c) => c !== canal)
        : [...f.canaux, canal],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/clients/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.error) {
      setError(data.error);
      setLoading(false);
    } else {
      router.push("/clients");
      router.refresh();
    }
  }

  const inputStyle = {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#374151",
    outline: "none",
    background: "#fff",
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: "12px",
    fontWeight: 600 as const,
    color: "#374151",
    marginBottom: "6px",
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Nouveau client</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Crée la fiche dans Supabase et ZOHO simultanément</p>
          </div>
          <button onClick={() => router.push("/clients")} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff" }}>
            Annuler
          </button>
        </div>

        <div className="page-content" style={{ maxWidth: "720px" }}>
          {searchParams.get("nom") && (
            <div style={{ background: "#f0f4ff", border: "1px solid #c7d7fe", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#1d4ed8", display: "flex", alignItems: "center", gap: "8px" }}>
              ✉️ <span>Pré-rempli depuis un lead : <strong>{searchParams.get("nom")}</strong></span>
            </div>
          )}
          <form onSubmit={handleSubmit}>

            {/* Infos entreprise */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                1. Informations entreprise
              </div>
              <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Nom de l'entreprise *</label>
                  <input required style={inputStyle} placeholder="Ex : Hôtel Bora Bora Pearl" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Secteur d'activité</label>
                  <select style={inputStyle} value={form.secteur} onChange={(e) => setForm({ ...form, secteur: e.target.value })}>
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
                  <label style={labelStyle}>Île / Localisation</label>
                  <select style={inputStyle} value={form.ile || ""} onChange={(e) => setForm({ ...form, ile: e.target.value })}>
                    <option value="">— Choisir —</option>
                    <option>Tahiti</option>
                    <option>Moorea</option>
                    <option>Bora Bora</option>
                    <option>Raiatea</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Offre & Budget */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                2. Offre & Budget
              </div>
              <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Offre souscrite *</label>
                  <select required style={inputStyle} value={form.offre} onChange={(e) => setForm({ ...form, offre: e.target.value })}>
                    <option value="START">START — 20 000 F/mois</option>
                    <option value="PERFORMANCE">PERFORMANCE — 80–120k F/mois</option>
                    <option value="PREMIUM">PREMIUM — 150 000 F+/mois</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Budget média mensuel (F CFP)</label>
                  <input style={inputStyle} type="number" placeholder="Ex : 300000" value={form.budget_mensuel} onChange={(e) => setForm({ ...form, budget_mensuel: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Durée d'engagement</label>
                  <select style={inputStyle} value={form.contrat} onChange={(e) => setForm({ ...form, contrat: e.target.value })}>
                    <option>6 mois</option>
                    <option>12 mois</option>
                    <option>Reconductible</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Canaux souhaités</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                    {canaux_options.map((canal) => (
                      <label key={canal} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", cursor: "pointer", fontWeight: 400 }}>
                        <input
                          type="checkbox"
                          checked={form.canaux.includes(canal)}
                          onChange={() => toggleCanal(canal)}
                        />
                        {canal}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                3. Contact principal
              </div>
              <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Nom du contact</label>
                  <input style={inputStyle} placeholder="Prénom Nom" value={form.contact_nom} onChange={(e) => setForm({ ...form, contact_nom: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" placeholder="contact@entreprise.pf" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <input style={inputStyle} placeholder="+689 …" value={form.contact_tel} onChange={(e) => setForm({ ...form, contact_tel: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <input style={inputStyle} placeholder="Contexte, historique…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "12px 16px", fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => router.push("/clients")} style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff" }}>
                Annuler
              </button>
              <button type="submit" disabled={loading} style={{ padding: "10px 24px", background: loading ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Création en cours…" : "Créer le client →"}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
