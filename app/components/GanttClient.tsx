"use client";

import React, { useState } from "react";

const canalColor: Record<string, string> = {
  Radio: "#fbbf24",
  Print: "#34d399",
  Affichage: "#f87171",
  TV: "#a78bfa",
};

const canalEmoji: Record<string, string> = {
  Radio: "🎙",
  Print: "📰",
  Affichage: "📋",
  TV: "📺",
};

const offreBadge: Record<string, { bg: string; color: string }> = {
  PREMIUM: { bg: "#f3e8ff", color: "#7c3aed" },
  PERFORMANCE: { bg: "#dbeafe", color: "#1d4ed8" },
  START: { bg: "#f3f4f6", color: "#6b7280" },
};

const statutColor: Record<string, { bg: string; color: string }> = {
  "Planifié": { bg: "#dbeafe", color: "#1d4ed8" },
  "En cours": { bg: "#dcfce7", color: "#16a34a" },
  "Terminé": { bg: "#f3f4f6", color: "#6b7280" },
  "Annulé": { bg: "#fee2e2", color: "#dc2626" },
};

const CANAUX = ["Radio", "Print", "Affichage", "TV"];
const STATUTS = ["Planifié", "En cours", "Terminé", "Annulé"];
const NUM_WEEKS = 10;

type PlanWithClient = {
  id: string;
  canal: string;
  budget: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  notes: string;
  client_id: string;
  clients: { nom: string; offre: string };
};

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isPlanActiveInWeek(plan: PlanWithClient, weekStart: Date, weekEnd: Date): boolean {
  const start = new Date(plan.date_debut);
  const end = new Date(plan.date_fin);
  return start <= weekEnd && end >= weekStart;
}

export default function GanttClient({ plans }: { plans: PlanWithClient[] }) {
  const [filtreCanaux, setFiltreCanaux] = useState<string[]>([]);
  const [filtreStatuts, setFiltreStatuts] = useState<string[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  function toggleCanal(c: string) {
    setFiltreCanaux((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  function toggleStatut(s: string) {
    setFiltreStatuts((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function resetFiltres() {
    setFiltreCanaux([]);
    setFiltreStatuts([]);
    setWeekOffset(0);
  }

  // Filtrage
  const filteredPlans = plans.filter((p) => {
    if (filtreCanaux.length > 0 && !filtreCanaux.includes(p.canal)) return false;
    if (filtreStatuts.length > 0 && !filtreStatuts.includes(p.statut)) return false;
    return true;
  });

  // Grid start
  const earliest = plans.length > 0 ? new Date(plans[0].date_debut) : new Date();
  const baseStart = getMondayOf(earliest);
  const gridStart = addDays(baseStart, weekOffset * 7);

  const weeks = Array.from({ length: NUM_WEEKS }, (_, i) => {
    const start = addDays(gridStart, i * 7);
    const end = addDays(start, 6);
    return {
      start,
      end,
      label: `S${i + 1}`,
      date: start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    };
  });

  const moisLabel = (() => {
    const debut = gridStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const fin = addDays(gridStart, (NUM_WEEKS - 1) * 7 + 6).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return debut === fin ? debut : `${debut} — ${fin}`;
  })();

  // Group by client
  const byClient = new Map<string, { nom: string; offre: string; plans: PlanWithClient[] }>();
  for (const plan of filteredPlans) {
    if (!byClient.has(plan.client_id)) {
      byClient.set(plan.client_id, { nom: plan.clients.nom, offre: plan.clients.offre, plans: [] });
    }
    byClient.get(plan.client_id)!.plans.push(plan);
  }
  const clients = Array.from(byClient.values());

  const hasFiltres = filtreCanaux.length > 0 || filtreStatuts.length > 0;

  return (
    <>
      {/* Filtres */}
      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px 20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Canal */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Canal</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {CANAUX.map((c) => {
                const active = filtreCanaux.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCanal(c)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      border: `1px solid ${active ? canalColor[c] : "#e5e7eb"}`,
                      background: active ? canalColor[c] : "#fff",
                      color: active ? "#fff" : "#555",
                      cursor: "pointer",
                      fontWeight: active ? 600 : 400,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {canalEmoji[c]} {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Statut */}
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Statut</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {STATUTS.map((s) => {
                const active = filtreStatuts.includes(s);
                const sc = statutColor[s];
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatut(s)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      border: `1px solid ${active ? sc.color : "#e5e7eb"}`,
                      background: active ? sc.bg : "#fff",
                      color: active ? sc.color : "#555",
                      cursor: "pointer",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset */}
          {hasFiltres && (
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "2px" }}>
              <button
                onClick={resetFiltres}
                style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "12px", border: "1px solid #e5e7eb", background: "#f9fafb", color: "#888", cursor: "pointer" }}
              >
                ✕ Réinitialiser
              </button>
            </div>
          )}
        </div>

        {hasFiltres && (
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#888" }}>
            {filteredPlans.length} plan{filteredPlans.length > 1 ? "s" : ""} affiché{filteredPlans.length > 1 ? "s" : ""} sur {plans.length}
          </div>
        )}
      </div>

      {/* Gantt */}
      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Calendrier — {moisLabel}</h3>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setWeekOffset((o) => o - NUM_WEEKS)}
              style={{ padding: "5px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff", color: "#374151" }}
            >
              ← Précédent
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                style={{ padding: "5px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px", cursor: "pointer", background: "#fff", color: "#888" }}
              >
                Aujourd'hui
              </button>
            )}
            <button
              onClick={() => setWeekOffset((o) => o + NUM_WEEKS)}
              style={{ padding: "5px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff", color: "#374151" }}
            >
              Suivant →
            </button>
          </div>
        </div>

        {filteredPlans.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
            {hasFiltres ? "Aucun plan ne correspond aux filtres sélectionnés." : "Aucun plan média. Créez des plans depuis la fiche client."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "800px" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", width: "200px", color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f0f0f0" }}>
                    Client / Canal
                  </th>
                  {weeks.map((w, i) => {
                    const isCurrentWeek = w.start <= new Date() && new Date() <= w.end;
                    return (
                      <th key={i} style={{ textAlign: "center", padding: "10px 4px", color: isCurrentWeek ? "#1d4ed8" : "#888", fontSize: "11px", borderBottom: "1px solid #f0f0f0", minWidth: "64px", background: isCurrentWeek ? "#f0f4ff" : "transparent" }}>
                        {w.label}<br />
                        <span style={{ fontSize: "10px", color: isCurrentWeek ? "#7b9fff" : "#bbb" }}>{w.date}</span>
                      </th>
                    );
                  })}
                  <th style={{ textAlign: "right", padding: "10px 16px", color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f0f0f0" }}>
                    Budget
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <React.Fragment key={client.nom}>
                    <tr style={{ background: "#f8f9fc" }}>
                      <td colSpan={NUM_WEEKS + 2} style={{ padding: "8px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a2e" }}>{client.nom}</span>
                          <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: offreBadge[client.offre]?.bg, color: offreBadge[client.offre]?.color }}>
                            {client.offre}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {client.plans.map((plan) => (
                      <tr key={plan.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "10px 16px 10px 28px", fontSize: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>{canalEmoji[plan.canal] || "•"} {plan.canal}</span>
                            <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, background: statutColor[plan.statut]?.bg, color: statutColor[plan.statut]?.color }}>
                              {plan.statut}
                            </span>
                          </div>
                        </td>
                        {weeks.map((w, i) => {
                          const active = isPlanActiveInWeek(plan, w.start, w.end);
                          const isCurrentWeek = w.start <= new Date() && new Date() <= w.end;
                          return (
                            <td key={i} style={{ padding: "7px 4px", textAlign: "center", background: isCurrentWeek ? "#fafcff" : "transparent" }}>
                              {active && (
                                <div
                                  style={{ height: "18px", borderRadius: "4px", background: canalColor[plan.canal] || "#aaa", opacity: plan.statut === "Annulé" ? 0.3 : plan.statut === "Terminé" ? 0.5 : 0.85 }}
                                  title={`${plan.canal} · ${plan.statut}`}
                                />
                              )}
                            </td>
                          );
                        })}
                        <td style={{ padding: "10px 16px", textAlign: "right", color: "#555", fontSize: "12px", fontWeight: 500 }}>
                          {plan.budget ? `${Math.round(plan.budget / 1000)}k F` : "—"}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Résumé budgets */}
      {clients.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginTop: "16px" }}>
          {clients.map((client) => {
            const total = client.plans.reduce((acc, p) => acc + (p.budget || 0), 0);
            return (
              <div key={client.nom} style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a2e" }}>{client.nom}</div>
                  <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: offreBadge[client.offre]?.bg, color: offreBadge[client.offre]?.color }}>
                    {client.offre}
                  </span>
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e", marginBottom: "4px" }}>
                  {Math.round(total / 1000)}k F
                </div>
                <div style={{ fontSize: "11px", color: "#888" }}>
                  {client.plans.length} plan{client.plans.length > 1 ? "s" : ""} · {[...new Set(client.plans.map(p => p.canal))].join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
