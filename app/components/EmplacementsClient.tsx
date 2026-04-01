"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

type Emplacement = {
  id: string;
  nom: string;
  commune: string;
  type: string;
  adresse: string;
  latitude: number;
  longitude: number;
  statut: string;
  visibilite: string;
  trafic_journalier: number;
  dimensions: string;
  prix_semaine: number;
  prix_mois: number;
  prix_negocie: number;
  remise_longue_duree: number;
  notes: string;
  created_at?: string;
};

const COMMUNES = ["Papeete", "Pirae", "Arue", "Mahina", "Faa'a", "Punaauia", "Paea", "Papara", "Taravao", "Autre"];
const TYPES = ["Totem", "Toile tendue", "Panneau", "Bâche", "Abribus", "Autre"];
const STATUTS = ["Disponible", "Réservé", "Non disponible"];
const VISIBILITES = ["Haute", "Moyenne", "Faible"];

const STATUT_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  "Disponible": { bg: "#dcfce7", color: "#16a34a", dot: "#22c55e" },
  "Réservé": { bg: "#fff7ed", color: "#c2410c", dot: "#f97316" },
  "Non disponible": { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
};

const EMPTY_FORM = {
  nom: "",
  commune: "Papeete",
  type: "Toile tendue",
  adresse: "",
  latitude: "",
  longitude: "",
  statut: "Disponible",
  visibilite: "Haute",
  trafic_journalier: "",
  dimensions: "",
  prix_semaine: "",
  prix_mois: "",
  prix_negocie: "",
  remise_longue_duree: "0",
  notes: "",
};

const inputStyle = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  padding: "8px 10px",
  fontSize: "13px",
  color: "#374151",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block" as const,
  fontSize: "11px",
  fontWeight: 600 as const,
  color: "#555",
  marginBottom: "4px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.3px",
};

const sectionTitle = {
  fontSize: "11px",
  fontWeight: 700 as const,
  color: "#888",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  marginBottom: "10px",
  paddingBottom: "6px",
  borderBottom: "1px solid #f0f0f0",
};

export default function EmplacementsClient() {
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/emplacements");
    const data = await res.json();
    if (data.emplacements) setEmplacements(data.emplacements);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handleMapClick(lat: number, lng: number) {
    setForm((f) => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
    if (!showForm) {
      setShowForm(true);
      setEditId(null);
    }
  }

  function handleEdit(emp: Emplacement) {
    setForm({
      nom: emp.nom,
      commune: emp.commune,
      type: emp.type,
      adresse: emp.adresse || "",
      latitude: String(emp.latitude),
      longitude: String(emp.longitude),
      statut: emp.statut,
      visibilite: emp.visibilite || "Haute",
      trafic_journalier: emp.trafic_journalier ? String(emp.trafic_journalier) : "",
      dimensions: emp.dimensions || "",
      prix_semaine: emp.prix_semaine ? String(emp.prix_semaine) : "",
      prix_mois: emp.prix_mois ? String(emp.prix_mois) : "",
      prix_negocie: emp.prix_negocie ? String(emp.prix_negocie) : "",
      remise_longue_duree: emp.remise_longue_duree ? String(emp.remise_longue_duree) : "0",
      notes: emp.notes || "",
    });
    setEditId(emp.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    await fetch("/api/emplacements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setEmplacements((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      trafic_journalier: form.trafic_journalier ? parseInt(form.trafic_journalier) : null,
      prix_semaine: form.prix_semaine ? parseInt(form.prix_semaine) : null,
      prix_mois: form.prix_mois ? parseInt(form.prix_mois) : null,
      prix_negocie: form.prix_negocie ? parseInt(form.prix_negocie) : null,
      remise_longue_duree: parseInt(form.remise_longue_duree) || 0,
    };

    const res = await fetch("/api/emplacements", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
    });

    const data = await res.json();
    if (data.error) {
      setError(data.error);
      setSaving(false);
    } else {
      if (editId) {
        setEmplacements((prev) => prev.map((e) => e.id === editId ? data.emplacement : e));
      } else {
        setEmplacements((prev) => [...prev, data.emplacement]);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...EMPTY_FORM });
      setSaving(false);
    }
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setError("");
  }

  const communesList = [...new Set(emplacements.map((e) => e.commune))].sort();
  const filtered = selectedCommune ? emplacements.filter((e) => e.commune === selectedCommune) : emplacements;

  const dispoCount = emplacements.filter((e) => e.statut === "Disponible").length;
  const reserveCount = emplacements.filter((e) => e.statut === "Réservé").length;
  const ndispoCount = emplacements.filter((e) => e.statut === "Non disponible").length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main" style={{ overflow: "hidden" }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Emplacements</h1>
            <div style={{ display: "flex", gap: "12px", marginTop: "4px", alignItems: "center" }}>
              {Object.entries(STATUT_COLORS).map(([s, c]) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#555" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.dot, flexShrink: 0, display: "inline-block" }} />
                  {s === "Disponible" ? dispoCount : s === "Réservé" ? reserveCount : ndispoCount} {s.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => { setForm({ ...EMPTY_FORM }); setEditId(null); setShowForm(true); }}
            style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
          >
            + Ajouter un emplacement
          </button>
        </div>

        {/* Content */}
        <div style={{ display: "flex", height: "calc(100vh - 73px)", overflow: "hidden" }}>

          {/* Left panel */}
          <div style={{ width: "270px", flexShrink: 0, borderRight: "1px solid #e5e7eb", overflowY: "auto", background: "#fff", display: "flex", flexDirection: "column" }}>

            {/* Filtre communes */}
            <div style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedCommune(null)}
                style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", border: "1px solid", borderColor: !selectedCommune ? "#1a1a2e" : "#d1d5db", background: !selectedCommune ? "#1a1a2e" : "#fff", color: !selectedCommune ? "#fff" : "#555", cursor: "pointer", fontWeight: !selectedCommune ? 600 : 400 }}
              >
                Tous ({emplacements.length})
              </button>
              {communesList.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCommune(c === selectedCommune ? null : c)}
                  style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", border: "1px solid", borderColor: selectedCommune === c ? "#1a1a2e" : "#d1d5db", background: selectedCommune === c ? "#1a1a2e" : "#fff", color: selectedCommune === c ? "#fff" : "#555", cursor: "pointer", fontWeight: selectedCommune === c ? 600 : 400 }}
                >
                  {c} ({emplacements.filter((e) => e.commune === c).length})
                </button>
              ))}
            </div>

            {/* Liste */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {loading ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>Chargement…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
                  Aucun emplacement.<br />
                  <span style={{ fontSize: "12px" }}>Cliquez sur la carte pour en ajouter.</span>
                </div>
              ) : (
                communesList
                  .filter((c) => !selectedCommune || c === selectedCommune)
                  .map((commune) => {
                    const items = filtered.filter((e) => e.commune === commune);
                    if (items.length === 0) return null;
                    return (
                      <div key={commune}>
                        <div style={{ padding: "7px 16px", background: "#f9fafb", fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #f0f0f0", borderTop: "1px solid #f0f0f0" }}>
                          {commune} <span style={{ fontWeight: 400 }}>({items.length})</span>
                        </div>
                        {items.map((emp) => {
                          const sc = STATUT_COLORS[emp.statut] || STATUT_COLORS["Non disponible"];
                          return (
                            <div
                              key={emp.id}
                              onClick={() => handleEdit(emp)}
                              style={{ padding: "10px 16px", borderBottom: "1px solid #f5f5f5", cursor: "pointer", display: "flex", gap: "10px", alignItems: "flex-start" }}
                            >
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: sc.dot, flexShrink: 0, marginTop: "3px" }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.nom}</div>
                                <div style={{ fontSize: "11px", color: "#888" }}>
                                  {emp.type}
                                  {emp.prix_semaine ? ` · ${Math.round(emp.prix_semaine / 1000)}k F/sem` : ""}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
              )}
            </div>

            {/* Hint */}
            <div style={{ padding: "10px 14px", borderTop: "1px solid #f0f0f0", fontSize: "11px", color: "#aaa", textAlign: "center" }}>
              Cliquez sur la carte pour positionner un emplacement
            </div>
          </div>

          {/* Map */}
          <div style={{ flex: 1, position: "relative" }}>
            <MapView
              emplacements={emplacements}
              onMapClick={handleMapClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Form modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: "12px", width: "560px", maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

              {/* Header */}
              <div style={{ padding: "16px 24px", background: "#1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                  {editId ? "Modifier l'emplacement" : "Nouvel emplacement"}
                </h3>
                <button onClick={closeForm} style={{ background: "none", border: "none", color: "#aaa", fontSize: "18px", cursor: "pointer" }}>✕</button>
              </div>

              <form onSubmit={handleSubmit} style={{ overflowY: "auto", flex: 1 }}>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Identification */}
                  <div>
                    <div style={sectionTitle}>Identification</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Nom *</label>
                        <input required style={inputStyle} placeholder="Ex : Carrefour Punaauia" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                      </div>
                      <div>
                        <label style={labelStyle}>Commune *</label>
                        <select required style={inputStyle} value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })}>
                          {COMMUNES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Type *</label>
                        <select required style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                          {TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Adresse</label>
                        <input style={inputStyle} placeholder="Ex : Route de l'Ouest, Punaauia" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div>
                    <div style={sectionTitle}>Localisation GPS</div>
                    <div style={{ background: "#f0f4ff", border: "1px solid #c7d7fe", borderRadius: "6px", padding: "8px 12px", fontSize: "12px", color: "#1d4ed8", marginBottom: "10px" }}>
                      Cliquez directement sur la carte pour remplir les coordonnées automatiquement
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={labelStyle}>Latitude *</label>
                        <input required style={inputStyle} placeholder="-17.6234" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                      </div>
                      <div>
                        <label style={labelStyle}>Longitude *</label>
                        <input required style={inputStyle} placeholder="-149.6089" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Caractéristiques */}
                  <div>
                    <div style={sectionTitle}>Caractéristiques</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={labelStyle}>Statut</label>
                        <select style={inputStyle} value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                          {STATUTS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Visibilité</label>
                        <select style={inputStyle} value={form.visibilite} onChange={(e) => setForm({ ...form, visibilite: e.target.value })}>
                          {VISIBILITES.map((v) => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Trafic / jour</label>
                        <input style={inputStyle} type="number" placeholder="15000" value={form.trafic_journalier} onChange={(e) => setForm({ ...form, trafic_journalier: e.target.value })} />
                      </div>
                      <div>
                        <label style={labelStyle}>Dimensions</label>
                        <input style={inputStyle} placeholder="4m x 2m" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Tarifs */}
                  <div>
                    <div style={sectionTitle}>Tarifs (F CFP)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={labelStyle}>Prix à la semaine</label>
                        <input style={inputStyle} type="number" placeholder="25 000" value={form.prix_semaine} onChange={(e) => setForm({ ...form, prix_semaine: e.target.value })} />
                      </div>
                      <div>
                        <label style={labelStyle}>Prix au mois</label>
                        <input style={inputStyle} type="number" placeholder="80 000" value={form.prix_mois} onChange={(e) => setForm({ ...form, prix_mois: e.target.value })} />
                      </div>
                      <div>
                        <label style={labelStyle}>Prix négocié (optionnel)</label>
                        <input style={inputStyle} type="number" placeholder="Tarif spécial client" value={form.prix_negocie} onChange={(e) => setForm({ ...form, prix_negocie: e.target.value })} />
                      </div>
                      <div>
                        <label style={labelStyle}>Remise longue durée (%)</label>
                        <input style={inputStyle} type="number" min="0" max="50" placeholder="Ex : 10" value={form.remise_longue_duree} onChange={(e) => setForm({ ...form, remise_longue_duree: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={labelStyle}>Notes</label>
                    <textarea
                      style={{ ...inputStyle, resize: "none" }}
                      rows={2}
                      placeholder="Informations complémentaires, contraintes d'installation…"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>

                  {error && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "10px 12px", fontSize: "13px", color: "#dc2626" }}>
                      {error}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", display: "flex", gap: "8px", justifyContent: "flex-end", flexShrink: 0, background: "#fff" }}>
                  <button type="button" onClick={closeForm} style={{ padding: "8px 18px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff" }}>
                    Annuler
                  </button>
                  <button type="submit" disabled={saving} style={{ padding: "8px 22px", background: saving ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
                    {saving ? "Enregistrement…" : editId ? "Enregistrer →" : "Créer →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
