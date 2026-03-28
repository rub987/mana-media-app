"use client";

import { useState } from "react";
import PlanMediaForm from "./PlanMediaForm";

const statutColor: Record<string, { bg: string; color: string }> = {
  "Planifié": { bg: "#dbeafe", color: "#1d4ed8" },
  "En cours": { bg: "#dcfce7", color: "#16a34a" },
  "Terminé": { bg: "#f3f4f6", color: "#6b7280" },
  "Annulé": { bg: "#fee2e2", color: "#dc2626" },
};

const canalColor: Record<string, string> = {
  Radio: "#fbbf24",
  Digital: "#7b9fff",
  Print: "#34d399",
  Affichage: "#f87171",
  TV: "#a78bfa",
};

type Plan = {
  id: string;
  canal: string;
  budget: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  notes: string;
};

export default function PlanMediaSection({ clientId, plans }: { clientId: string; plans: Plan[] }) {
  const [showForm, setShowForm] = useState(false);

  function formatDate(d: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <>
      {showForm && <PlanMediaForm clientId={clientId} onClose={() => setShowForm(false)} />}

      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
            Plans médias <span style={{ fontSize: "12px", color: "#888", fontWeight: 400 }}>({plans.length})</span>
          </span>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: "6px 14px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}
          >
            + Créer un plan
          </button>
        </div>

        {plans.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
            Aucun plan média. Clique sur "Créer un plan" pour démarrer.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Canal", "Budget", "Début", "Fin", "Statut", "Notes"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: canalColor[plan.canal] || "#aaa", flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{plan.canal}</span>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
