"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { createClient } from "@/utils/supabase/client";


const canaux_options = ["Radio", "Digital", "Print", "Affichage", "TV"];

export default function ModifierClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "",
    secteur: "",
    offre: "PERFORMANCE",
    budget_mensuel: "",
    contrat: "6 mois",
    canaux: [] as string[],
    statut: "Active",
    roi: "",
    progression: "0",
    contact_nom: "",
    contact_email: "",
    contact_tel: "",
  });

  useEffect(() => {
    async function loadClient() {
      setLoading(true);
      const { data } = await supabase.from("clients").select("*").eq("id", id).single();
      if (data) {
        setForm({
          nom: data.nom || "",
          secteur: data.secteur || "",
          offre: data.offre || "PERFORMANCE",
          budget_mensuel: String(data.budget_mensuel || 0),
          contrat: data.contrat || "6 mois",
          canaux: data.canaux || [],
          statut: data.statut || "Active",
          roi: data.roi || "",
          progression: String(data.progression || 0),
          contact_nom: data.contact_nom || "",
          contact_email: data.contact_email || "",
          contact_tel: data.contact_tel || "",
        });
      }
      setLoading(false);
    }
    loadClient();
  }, [id]);

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
    setSaving(true);
    setError("");

    const res = await fetch("/api/clients/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form }),
    });

    const data = await res.json();
    if (data.error) {
      setError(data.error);
      setSaving(false);
    } else {
      router.push(`/clients/${id}`);
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

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f6fa" }}>
          <div style={{ fontSize: "14px", color: "#888" }}>Chargement…</div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Modifier — {form.nom}</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Les modifications seront enregistrées dans Supabase</p>
          </div>
          <button onClick={() => router.push(`/clients/${id}`)} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff" }}>
            Annuler
          </button>
        </div>

        <div style={{ padding: "24px 28px", maxWidth: "720px" }}>
          <form onSubmit={handleSubmit}>

            {/* Infos */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                Informations
              </div>
              <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Nom de l'entreprise *</label>
                  <input required style={inputStyle} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Secteur</label>
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
                  <label style={labelStyle}>Statut</label>
                  <select style={inputStyle} value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                    <option>Active</option>
                    <option>En pause</option>
                    <option>Terminée</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Offre & Budget */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                Offre & Budget
              </div>
              <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Offre</label>
                  <select style={inputStyle} value={form.offre} onChange={(e) => setForm({ ...form, offre: e.target.value })}>
                    <option value="START">START</option>
                    <option value="PERFORMANCE">PERFORMANCE</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Budget mensuel (F CFP)</label>
                  <input style={inputStyle} type="number" value={form.budget_mensuel} onChange={(e) => setForm({ ...form, budget_mensuel: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Contrat</label>
                  <select style={inputStyle} value={form.contrat} onChange={(e) => setForm({ ...form, contrat: e.target.value })}>
                    <option>6 mois</option>
                    <option>12 mois</option>
                    <option>Reconductible</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>ROI estimé</label>
                  <input style={inputStyle} placeholder="Ex : ×2.8" value={form.roi} onChange={(e) => setForm({ ...form, roi: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Budget utilisé (%)</label>
                  <input style={inputStyle} type="number" min="0" max="100" value={form.progression} onChange={(e) => setForm({ ...form, progression: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Canaux actifs</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                    {canaux_options.map((canal) => (
                      <label key={canal} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", cursor: "pointer", fontWeight: 400 }}>
                        <input type="checkbox" checked={form.canaux.includes(canal)} onChange={() => toggleCanal(canal)} />
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
                Contact principal
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
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "12px 16px", fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => router.push(`/clients/${id}`)} style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff" }}>
                Annuler
              </button>
              <button type="submit" disabled={saving} style={{ padding: "10px 24px", background: saving ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Enregistrement…" : "Enregistrer →"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
