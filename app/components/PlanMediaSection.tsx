"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PlanMediaForm from "./PlanMediaForm";
import PlanComments from "./PlanComments";

type Emplacement = { id: string; nom: string; commune: string; statut: string };

const statutColor: Record<string, { bg: string; color: string }> = {
  "Planifié": { bg: "#dbeafe", color: "#1d4ed8" },
  "En cours": { bg: "#dcfce7", color: "#16a34a" },
  "Terminé": { bg: "#f3f4f6", color: "#6b7280" },
  "Annulé": { bg: "#fee2e2", color: "#dc2626" },
};

const canalColor: Record<string, string> = {
  Radio: "#fbbf24",
  Print: "#34d399",
  Affichage: "#f87171",
  TV: "#a78bfa",
};

const canaux = ["Radio", "Print", "Affichage", "TV"];
const statuts = ["Planifié", "En cours", "Terminé", "Annulé"];

type Plan = {
  id: string;
  canal: string;
  budget: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  notes: string;
  emplacement_id?: string;
};

function formatDate(d: string) {
  if (!d) return "—";
  const [year, month, day] = d.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function EditModal({ plan, emplacements, onClose }: { plan: Plan; emplacements: Emplacement[]; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    canal: plan.canal,
    budget: String(plan.budget || ""),
    date_debut: plan.date_debut?.slice(0, 10) || "",
    date_fin: plan.date_fin?.slice(0, 10) || "",
    statut: plan.statut,
    notes: plan.notes || "",
    emplacement_id: plan.emplacement_id || "",
  });

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/plans/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: plan.id, ...form, emplacement_id: form.emplacement_id || null }),
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

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "12px", width: "480px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "18px 24px", background: "#1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Modifier le plan</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", fontSize: "18px", cursor: "pointer" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Canal *</label>
              <select required style={inputStyle} value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value })}>
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

            {form.canal === "Affichage" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Emplacement physique</label>
                <select
                  style={inputStyle}
                  value={form.emplacement_id}
                  onChange={(e) => setForm({ ...form, emplacement_id: e.target.value })}
                >
                  <option value="">— Aucun emplacement —</option>
                  {emplacements.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nom} ({emp.commune}) — {emp.statut}
                    </option>
                  ))}
                </select>
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
              {saving ? "Enregistrement…" : "Enregistrer →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PlanMediaSection({ clientId, plans }: { clientId: string; plans: Plan[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [commentPlan, setCommentPlan] = useState<Plan | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);

  useEffect(() => {
    fetch("/api/emplacements")
      .then((r) => r.json())
      .then((data) => { if (data.emplacements) setEmplacements(data.emplacements); });
  }, []);

  useEffect(() => {
    if (plans.length === 0) return;
    const ids = plans.map((p) => p.id).join(",");
    fetch(`/api/plan-comments?plan_ids=${ids}`)
      .then((r) => r.json())
      .then((data) => { if (data.counts) setCommentCounts(data.counts); });
  }, [plans]);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce plan ? Cette action est irréversible.")) return;
    setDeletingId(id);

    const res = await fetch("/api/plans/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    if (!data.error) {
      router.refresh();
    }
    setDeletingId(null);
  }

  return (
    <>
      {showCreate && <PlanMediaForm clientId={clientId} onClose={() => setShowCreate(false)} />}
      {editPlan && <EditModal plan={editPlan} emplacements={emplacements} onClose={() => setEditPlan(null)} />}
      {commentPlan && (
        <PlanComments
          planId={commentPlan.id}
          planLabel={`${commentPlan.canal} · ${commentPlan.date_debut?.slice(0, 10)}`}
          onClose={() => setCommentPlan(null)}
          onCountChange={(planId, delta) => setCommentCounts((prev) => ({ ...prev, [planId]: Math.max(0, (prev[planId] || 0) + delta) }))}
        />
      )}

      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
            Plans médias <span style={{ fontSize: "12px", color: "#888", fontWeight: 400 }}>({plans.length})</span>
          </span>
          <button
            onClick={() => setShowCreate(true)}
            style={{ padding: "6px 14px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}
          >
            + Créer un plan
          </button>
        </div>

        {plans.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
            Aucun plan média. Clique sur &quot;Créer un plan&quot; pour démarrer.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Canal", "Budget", "Début", "Fin", "Statut", "Notes", ""].map((h, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: canalColor[plan.canal] || "#aaa", flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 500 }}>{plan.canal}</span>
                        {plan.emplacement_id && emplacements.find((e) => e.id === plan.emplacement_id) && (
                          <div style={{ fontSize: "11px", color: "#888" }}>
                            📍 {emplacements.find((e) => e.id === plan.emplacement_id)?.nom}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{plan.budget ? `${Math.round(plan.budget / 1000)}k F` : "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#666" }}>{formatDate(plan.date_debut)}</td>
                  <td style={{ padding: "12px 16px", color: "#666" }}>{formatDate(plan.date_fin)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: statutColor[plan.statut]?.bg, color: statutColor[plan.statut]?.color }}>
                      {plan.statut}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#888" }}>{plan.notes || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => setCommentPlan(plan)}
                        style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: "5px", fontSize: "11px", cursor: "pointer", background: "#fff", color: "#374151", position: "relative" }}
                        title="Notes internes"
                      >
                        💬{commentCounts[plan.id] > 0 && (
                          <span style={{ marginLeft: "4px", background: "#7b9fff", color: "#fff", borderRadius: "10px", fontSize: "10px", fontWeight: 700, padding: "1px 5px" }}>
                            {commentCounts[plan.id]}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setEditPlan(plan)}
                        style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: "5px", fontSize: "11px", cursor: "pointer", background: "#fff", color: "#374151" }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        disabled={deletingId === plan.id}
                        style={{ padding: "4px 10px", border: "1px solid #fecaca", borderRadius: "5px", fontSize: "11px", cursor: deletingId === plan.id ? "not-allowed" : "pointer", background: "#fff", color: "#dc2626" }}
                      >
                        {deletingId === plan.id ? "…" : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
