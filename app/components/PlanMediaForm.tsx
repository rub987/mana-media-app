"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const canaux = ["Radio", "Digital", "Print", "Affichage", "TV"];
const statuts = ["Planifié", "En cours", "Terminé", "Annulé"];

type Emplacement = { id: string; nom: string; commune: string; statut: string };

export default function PlanMediaForm({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [form, setForm] = useState({
    canal: "Radio",
    budget: "",
    date_debut: "",
    date_fin: "",
    statut: "Planifié",
    notes: "",
    emplacement_id: "",
  });

  useEffect(() => {
    fetch("/api/emplacements")
      .then((r) => r.json())
      .then((data) => { if (data.emplacements) setEmplacements(data.emplacements); });
  }, []);

  const inputStyle = {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "9px 12px",
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
    marginBottom: "5px",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/plans/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        ...form,
        emplacement_id: form.emplacement_id || null,
      }),
    });

    const data = await res.json();
    if (data.error) {
      setError(data.error);
      setSaving(false);
    } else {
      onClose();
      router.refresh();
    }
  }

  const emplacementsAffichage = emplacements.filter((e) => e.statut !== "Non disponible");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "12px", width: "480px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding: "18px 24px", background: "#1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Nouveau plan média</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", fontSize: "18px", cursor: "pointer" }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

            <div>
              <label style={labelStyle}>Canal *</label>
              <select required style={inputStyle} value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value, emplacement_id: "" })}>
                {canaux.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Budget (F CFP)</label>
              <input style={inputStyle} type="number" placeholder="Ex : 150000" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}>Date début *</label>
              <input required style={inputStyle} type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}>Date fin *</label>
              <input required style={inputStyle} type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}>Statut</label>
              <select style={inputStyle} value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                {statuts.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Notes</label>
              <input style={inputStyle} placeholder="Format, fréquence…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            {/* Emplacement — visible uniquement si canal Affichage */}
            {form.canal === "Affichage" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Emplacement physique</label>
                <select
                  style={inputStyle}
                  value={form.emplacement_id}
                  onChange={(e) => setForm({ ...form, emplacement_id: e.target.value })}
                >
                  <option value="">— Aucun emplacement sélectionné —</option>
                  {emplacementsAffichage.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nom} ({emp.commune}) — {emp.statut}
                    </option>
                  ))}
                </select>
                {emplacements.length === 0 && (
                  <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
                    Aucun emplacement dans la base — ajoutez-en via la page Emplacements.
                  </div>
                )}
              </div>
            )}

          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "10px 12px", fontSize: "13px", color: "#dc2626", marginTop: "14px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "20px" }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff" }}>
              Annuler
            </button>
            <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: saving ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Enregistrement…" : "Créer le plan →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
