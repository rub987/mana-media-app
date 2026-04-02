"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PlanComments from "./PlanComments";

export const PLATEFORMES = ["Meta", "Google Ads", "TikTok Ads", "LinkedIn Ads", "YouTube"];

export const TYPES_PAR_PLATEFORME: Record<string, string[]> = {
  "Meta": ["Boost", "Awareness", "Trafic", "Conversion", "Lead Generation", "Retargeting"],
  "Google Ads": ["Search", "Display", "Shopping", "Performance Max", "YouTube"],
  "TikTok Ads": ["Boost", "TopView", "Awareness", "Trafic", "Conversion"],
  "LinkedIn Ads": ["Sponsored Content", "Message Ads", "Lead Gen"],
  "YouTube": ["In-Stream", "Discovery", "Bumper"],
};

export const OBJECTIFS = ["Notoriété", "Trafic", "Engagement", "Leads", "Ventes"];

export const STATUTS = ["En préparation", "En attente validation", "En ligne", "Pausé", "Terminé", "Annulé"];

export const PLATEFORME_COLOR: Record<string, string> = {
  "Meta": "#1877f2",
  "Google Ads": "#4285f4",
  "TikTok Ads": "#000000",
  "LinkedIn Ads": "#0077b5",
  "YouTube": "#ff0000",
};

export const PLATEFORME_ICON: Record<string, string> = {
  "Meta": "📘",
  "Google Ads": "🔍",
  "TikTok Ads": "🎵",
  "LinkedIn Ads": "💼",
  "YouTube": "▶️",
};

export const STATUT_COLOR: Record<string, { bg: string; color: string }> = {
  "En préparation": { bg: "#f3f4f6", color: "#6b7280" },
  "En attente validation": { bg: "#fff7ed", color: "#c2410c" },
  "En ligne": { bg: "#dcfce7", color: "#16a34a" },
  "Pausé": { bg: "#fef9c3", color: "#92400e" },
  "Terminé": { bg: "#f3f4f6", color: "#374151" },
  "Annulé": { bg: "#fee2e2", color: "#dc2626" },
};

type Campagne = {
  id: string;
  plateforme: string;
  type_campagne: string;
  objectif: string | null;
  budget_total: number | null;
  budget_journalier: number | null;
  date_debut: string;
  date_fin: string | null;
  statut: string;
  url_cible: string | null;
  notes: string | null;
};

const EMPTY_FORM = {
  plateforme: "Meta",
  type_campagne: "Boost",
  objectif: "",
  budget_total: "",
  budget_journalier: "",
  date_debut: "",
  date_fin: "",
  statut: "En préparation",
  url_cible: "",
  notes: "",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  const [year, month, day] = d.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function fmtBudget(n: number | null) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M F`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k F`;
  return `${n} F`;
}

function CampagneModal({
  clientId,
  campagne,
  onClose,
}: {
  clientId: string;
  campagne: Campagne | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(
    campagne
      ? {
          plateforme: campagne.plateforme,
          type_campagne: campagne.type_campagne,
          objectif: campagne.objectif || "",
          budget_total: String(campagne.budget_total || ""),
          budget_journalier: String(campagne.budget_journalier || ""),
          date_debut: campagne.date_debut?.slice(0, 10) || "",
          date_fin: campagne.date_fin?.slice(0, 10) || "",
          statut: campagne.statut,
          url_cible: campagne.url_cible || "",
          notes: campagne.notes || "",
        }
      : { ...EMPTY_FORM }
  );

  const types = TYPES_PAR_PLATEFORME[form.plateforme] || [];

  function setField(key: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Reset type si plateforme change
      if (key === "plateforme") {
        const newTypes = TYPES_PAR_PLATEFORME[value] || [];
        next.type_campagne = newTypes[0] || "";
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = campagne ? "/api/social/update" : "/api/social/create";
    const method = campagne ? "PUT" : "POST";
    const body = campagne
      ? { id: campagne.id, ...form }
      : { client_id: clientId, ...form };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

  const inputStyle = {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "9px 12px",
    fontSize: "13px",
    color: "#374151",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: "12px",
    fontWeight: 600 as const,
    color: "#374151",
    marginBottom: "5px",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "12px", width: "520px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "18px 24px", background: "#1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>
            {campagne ? "Modifier la campagne" : "Nouvelle campagne"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", fontSize: "18px", cursor: "pointer" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Plateforme *</label>
              <select required style={inputStyle} value={form.plateforme} onChange={(e) => setField("plateforme", e.target.value)}>
                {PLATEFORMES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Type de campagne *</label>
              <select required style={inputStyle} value={form.type_campagne} onChange={(e) => setField("type_campagne", e.target.value)}>
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Objectif</label>
              <select style={inputStyle} value={form.objectif} onChange={(e) => setField("objectif", e.target.value)}>
                <option value="">— Sélectionner —</option>
                {OBJECTIFS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Statut</label>
              <select style={inputStyle} value={form.statut} onChange={(e) => setField("statut", e.target.value)}>
                {STATUTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Budget total (F CFP)</label>
              <input style={inputStyle} type="number" placeholder="Ex : 150000" value={form.budget_total} onChange={(e) => setField("budget_total", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Budget journalier (F CFP)</label>
              <input style={inputStyle} type="number" placeholder="Ex : 5000" value={form.budget_journalier} onChange={(e) => setField("budget_journalier", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Date début *</label>
              <input required style={inputStyle} type="date" value={form.date_debut} onChange={(e) => setField("date_debut", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Date fin</label>
              <input style={inputStyle} type="date" value={form.date_fin} onChange={(e) => setField("date_fin", e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>URL cible</label>
            <input style={inputStyle} type="url" placeholder="https://…" value={form.url_cible} onChange={(e) => setField("url_cible", e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <input style={inputStyle} placeholder="Ciblage, créatifs, remarques…" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "10px 12px", fontSize: "13px", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 18px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff" }}>
              Annuler
            </button>
            <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: saving ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Enregistrement…" : campagne ? "Enregistrer →" : "Créer →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SocialSection({ clientId, campagnes }: { clientId: string; campagnes: Campagne[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editCampagne, setEditCampagne] = useState<Campagne | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [commentCampagne, setCommentCampagne] = useState<Campagne | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (campagnes.length === 0) return;
    const ids = campagnes.map((c) => c.id).join(",");
    fetch(`/api/social-comments?campagne_ids=${ids}`)
      .then((r) => r.json())
      .then((data) => { if (data.counts) setCommentCounts(data.counts); });
  }, [campagnes]);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette campagne ? Cette action est irréversible.")) return;
    setDeletingId(id);
    const res = await fetch("/api/social/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!data.error) router.refresh();
    setDeletingId(null);
  }

  return (
    <>
      {(showCreate || editCampagne) && (
        <CampagneModal
          clientId={clientId}
          campagne={editCampagne}
          onClose={() => { setShowCreate(false); setEditCampagne(null); }}
        />
      )}
      {commentCampagne && (
        <PlanComments
          planId={commentCampagne.id}
          planLabel={`${commentCampagne.plateforme} · ${commentCampagne.type_campagne}`}
          onClose={() => setCommentCampagne(null)}
          apiPath="/api/social-comments"
          idParam="campagne_id"
          onCountChange={(id, delta) => setCommentCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }))}
        />
      )}

      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
            Campagnes sociales & digitales <span style={{ fontSize: "12px", color: "#888", fontWeight: 400 }}>({campagnes.length})</span>
          </span>
          <button
            onClick={() => setShowCreate(true)}
            style={{ padding: "6px 14px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}
          >
            + Nouvelle campagne
          </button>
        </div>

        {campagnes.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
            Aucune campagne. Clique sur &quot;Nouvelle campagne&quot; pour démarrer.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Plateforme", "Type", "Objectif", "Budget", "Période", "Statut", ""].map((h, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campagnes.map((c) => {
                const sc = STATUT_COLOR[c.statut] || { bg: "#f3f4f6", color: "#6b7280" };
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: PLATEFORME_COLOR[c.plateforme] || "#aaa", flexShrink: 0 }} />
                        <div>
                          <span style={{ fontWeight: 600 }}>{PLATEFORME_ICON[c.plateforme]} {c.plateforme}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#374151" }}>{c.type_campagne}</td>
                    <td style={{ padding: "12px 16px", color: "#888" }}>{c.objectif || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 500 }}>{fmtBudget(c.budget_total)}</div>
                      {c.budget_journalier && (
                        <div style={{ fontSize: "11px", color: "#888" }}>{fmtBudget(c.budget_journalier)}/j</div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666", fontSize: "12px" }}>
                      <div>{formatDate(c.date_debut)}</div>
                      {c.date_fin && <div style={{ color: "#aaa" }}>→ {formatDate(c.date_fin)}</div>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: sc.bg, color: sc.color }}>
                        {c.statut}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => setCommentCampagne(c)}
                          style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: "5px", fontSize: "11px", cursor: "pointer", background: "#fff", color: "#374151" }}
                          title="Notes internes"
                        >
                          💬{commentCounts[c.id] > 0 && (
                            <span style={{ marginLeft: "4px", background: "#7b9fff", color: "#fff", borderRadius: "10px", fontSize: "10px", fontWeight: 700, padding: "1px 5px" }}>
                              {commentCounts[c.id]}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => setEditCampagne(c)}
                          style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: "5px", fontSize: "11px", cursor: "pointer", background: "#fff", color: "#374151" }}
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          style={{ padding: "4px 10px", border: "1px solid #fecaca", borderRadius: "5px", fontSize: "11px", cursor: deletingId === c.id ? "not-allowed" : "pointer", background: "#fff", color: "#dc2626" }}
                        >
                          {deletingId === c.id ? "…" : "Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
