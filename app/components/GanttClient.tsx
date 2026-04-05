"use client";

import React, { useState } from "react";
import Link from "next/link";

const canalColor: Record<string, string> = {
  Radio: "#fbbf24",
  Print: "#34d399",
  Affichage: "#f87171",
  TV: "#a78bfa",
  Digital: "#7b9fff", // legacy — plus créable, affiché pour données existantes
};

const canalEmoji: Record<string, string> = {
  Radio: "🎙",
  Print: "📰",
  Affichage: "📋",
  TV: "📺",
  Digital: "💻",
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

const plateformeColor: Record<string, string> = {
  "Meta": "#1877f2",
  "Google Ads": "#4285f4",
  "TikTok Ads": "#000000",
  "LinkedIn Ads": "#0077b5",
  "YouTube": "#ff0000",
};

const plateformeEmoji: Record<string, string> = {
  "Meta": "📘",
  "Google Ads": "🔍",
  "TikTok Ads": "🎵",
  "LinkedIn Ads": "💼",
  "YouTube": "▶️",
};

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

type CampagneWithClient = {
  id: string;
  plateforme: string;
  type_campagne: string;
  date_debut: string;
  date_fin: string | null;
  statut: string;
  budget_total: number | null;
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

export default function GanttClient({ plans, campagnes = [] }: { plans: PlanWithClient[]; campagnes?: CampagneWithClient[] }) {
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
  const byClient = new Map<string, { id: string; nom: string; offre: string; plans: PlanWithClient[]; campagnes: CampagneWithClient[] }>();
  for (const plan of filteredPlans) {
    if (!byClient.has(plan.client_id)) {
      byClient.set(plan.client_id, { id: plan.client_id, nom: plan.clients.nom, offre: plan.clients.offre, plans: [], campagnes: [] });
    }
    byClient.get(plan.client_id)!.plans.push(plan);
  }
  for (const c of campagnes) {
    if (!byClient.has(c.client_id)) {
      byClient.set(c.client_id, { id: c.client_id, nom: c.clients.nom, offre: c.clients.offre, plans: [], campagnes: [] });
    }
    byClient.get(c.client_id)!.campagnes.push(c);
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

        {/* Légende */}
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Plans médias</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.entries(canalColor).map(([canal, color]) => (
                <div key={canal} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "24px", height: "10px", borderRadius: "3px", background: color, opacity: 0.85 }} />
                  <span style={{ fontSize: "11px", color: "#555" }}>{canalEmoji[canal]} {canal}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Campagnes sociales</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.entries(plateformeColor).map(([plateforme, color]) => (
                <div key={plateforme} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "20px", height: "7px", borderRadius: "2px", background: color, opacity: 0.7 }} />
                  <span style={{ fontSize: "11px", color: "#555" }}>{plateformeEmoji[plateforme]} {plateforme}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "24px", height: "10px", borderRadius: "3px", background: "#aaa", opacity: 0.85 }} />
              <span style={{ fontSize: "11px", color: "#555" }}>Plan actif</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "20px", height: "7px", borderRadius: "2px", background: "#aaa", opacity: 0.7 }} />
              <span style={{ fontSize: "11px", color: "#555" }}>Campagne active</span>
            </div>
          </div>
        </div>
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

        {clients.length === 0 ? (
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
                          <Link href={`/clients/${client.id}`} style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a2e", textDecoration: "none" }}>{client.nom}</Link>
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
                    {client.campagnes.map((c) => {
                      const color = plateformeColor[c.plateforme] || "#888";
                      return (
                        <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5", background: "#fdfcff" }}>
                          <td style={{ padding: "8px 16px 8px 28px", fontSize: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ color }}>{plateformeEmoji[c.plateforme] || "•"} {c.plateforme}</span>
                              <span style={{ fontSize: "10px", color: "#aaa" }}>{c.type_campagne}</span>
                            </div>
                          </td>
                          {weeks.map((w, i) => {
                            const active = c.date_fin
                              ? isPlanActiveInWeek({ date_debut: c.date_debut, date_fin: c.date_fin } as any, w.start, w.end)
                              : new Date(c.date_debut) <= w.end;
                            const isCurrentWeek = w.start <= new Date() && new Date() <= w.end;
                            return (
                              <td key={i} style={{ padding: "6px 4px", textAlign: "center", background: isCurrentWeek ? "#fafcff" : "transparent" }}>
                                {active && (
                                  <div
                                    style={{ height: "14px", borderRadius: "3px", background: color, opacity: c.statut === "Terminé" || c.statut === "Annulé" ? 0.35 : 0.7, borderTop: `2px solid ${color}` }}
                                    title={`${c.plateforme} · ${c.statut}`}
                                  />
                                )}
                              </td>
                            );
                          })}
                          <td style={{ padding: "8px 16px", textAlign: "right", color: "#888", fontSize: "11px" }}>
                            {c.budget_total ? `${Math.round(c.budget_total / 1000)}k F` : "—"}
                          </td>
                        </tr>
                      );
                    })}
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
            const totalPlans = client.plans.reduce((acc, p) => acc + (p.budget || 0), 0);
            const totalCampagnes = client.campagnes.reduce((acc, c) => acc + (c.budget_total || 0), 0);
            const total = totalPlans + totalCampagnes;
            return (
              <Link key={client.id} href={`/clients/${client.id}`} style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px", textDecoration: "none", display: "block", transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#7b9fff")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              >
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
                  {client.plans.length > 0 && <span>{client.plans.length} plan{client.plans.length > 1 ? "s" : ""}</span>}
                  {client.plans.length > 0 && client.campagnes.length > 0 && <span> · </span>}
                  {client.campagnes.length > 0 && <span>{client.campagnes.length} campagne{client.campagnes.length > 1 ? "s" : ""}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
