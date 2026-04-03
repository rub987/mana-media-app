"use client";

import React, { useState } from "react";
import Link from "next/link";

type CampagneWithClient = {
  id: string;
  client_id: string;
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
  clients: { nom: string; offre: string };
};

const TOUTES_PLATEFORMES = ["Meta", "Google Ads", "TikTok Ads", "LinkedIn Ads", "YouTube"];
const TOUS_STATUTS = ["En préparation", "En attente validation", "En ligne", "Pausé", "Terminé", "Annulé"];
const NUM_WEEKS = 10;
const MOIS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const offreBadge: Record<string, { bg: string; color: string }> = {
  PREMIUM: { bg: "#f3e8ff", color: "#7c3aed" },
  PERFORMANCE: { bg: "#dbeafe", color: "#1d4ed8" },
  START: { bg: "#f3f4f6", color: "#6b7280" },
};

function parseDate(d: string) {
  const [year, month, day] = d.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return parseDate(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function fmtBudget(n: number | null) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M F`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k F`;
  return `${n} F`;
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isCampagneActiveInWeek(c: CampagneWithClient, weekStart: Date, weekEnd: Date): boolean {
  const start = parseDate(c.date_debut);
  const end = c.date_fin ? parseDate(c.date_fin) : new Date(9999, 0, 1);
  return start <= weekEnd && end >= weekStart;
}

/* ── Vue Gantt par semaines ─────────────────────────────────────────── */
function GanttSocialView({
  campagnes, plateformeColor, plateformeIcon, statutColor,
}: {
  campagnes: CampagneWithClient[];
  plateformeColor: Record<string, string>;
  plateformeIcon: Record<string, string>;
  statutColor: Record<string, { bg: string; color: string }>;
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  const earliest = campagnes.length > 0 ? parseDate(campagnes[0].date_debut) : new Date();
  const gridStart = addDays(getMondayOf(earliest), weekOffset * 7);

  const weeks = Array.from({ length: NUM_WEEKS }, (_, i) => {
    const start = addDays(gridStart, i * 7);
    const end = addDays(start, 6);
    return { start, end, label: `S${i + 1}`, date: start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) };
  });

  const moisLabel = (() => {
    const a = gridStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const b = addDays(gridStart, (NUM_WEEKS - 1) * 7 + 6).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return a === b ? a : `${a} — ${b}`;
  })();

  const byClient = new Map<string, { id: string; nom: string; offre: string; campagnes: CampagneWithClient[] }>();
  for (const c of campagnes) {
    if (!byClient.has(c.client_id))
      byClient.set(c.client_id, { id: c.client_id, nom: c.clients?.nom, offre: c.clients?.offre, campagnes: [] });
    byClient.get(c.client_id)!.campagnes.push(c);
  }
  const clients = Array.from(byClient.values());

  return (
    <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Calendrier — {moisLabel}</h3>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => setWeekOffset(o => o - NUM_WEEKS)} style={{ padding: "5px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff", color: "#374151" }}>← Précédent</button>
          {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} style={{ padding: "5px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px", cursor: "pointer", background: "#fff", color: "#888" }}>Aujourd'hui</button>}
          <button onClick={() => setWeekOffset(o => o + NUM_WEEKS)} style={{ padding: "5px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff", color: "#374151" }}>Suivant →</button>
        </div>
      </div>

      {campagnes.length === 0 ? (
        <div style={{ padding: "48px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>Aucune campagne sur cette période.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={{ textAlign: "left", padding: "10px 16px", width: "200px", color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f0f0f0" }}>Client / Campagne</th>
                {weeks.map((w, i) => {
                  const cur = w.start <= new Date() && new Date() <= w.end;
                  return (
                    <th key={i} style={{ textAlign: "center", padding: "10px 4px", color: cur ? "#1d4ed8" : "#888", fontSize: "11px", borderBottom: "1px solid #f0f0f0", minWidth: "64px", background: cur ? "#f0f4ff" : "transparent" }}>
                      {w.label}<br /><span style={{ fontSize: "10px", color: cur ? "#7b9fff" : "#bbb" }}>{w.date}</span>
                    </th>
                  );
                })}
                <th style={{ textAlign: "right", padding: "10px 16px", color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f0f0f0" }}>Budget</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <React.Fragment key={client.id}>
                  <tr style={{ background: "#f8f9fc" }}>
                    <td colSpan={NUM_WEEKS + 2} style={{ padding: "8px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Link href={`/clients/${client.id}`} style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a2e", textDecoration: "none" }}>{client.nom}</Link>
                        {client.offre && <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: offreBadge[client.offre]?.bg, color: offreBadge[client.offre]?.color }}>{client.offre}</span>}
                      </div>
                    </td>
                  </tr>
                  {client.campagnes.map((c) => {
                    const sc = statutColor[c.statut] || { bg: "#f3f4f6", color: "#6b7280" };
                    const color = plateformeColor[c.plateforme] || "#7b9fff";
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "10px 16px 10px 28px", fontSize: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                            <span>{plateformeIcon[c.plateforme]} {c.plateforme} · {c.type_campagne}</span>
                            <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, background: sc.bg, color: sc.color }}>{c.statut}</span>
                          </div>
                        </td>
                        {weeks.map((w, i) => {
                          const active = isCampagneActiveInWeek(c, w.start, w.end);
                          const cur = w.start <= new Date() && new Date() <= w.end;
                          return (
                            <td key={i} style={{ padding: "7px 4px", textAlign: "center", background: cur ? "#fafcff" : "transparent" }}>
                              {active && <div style={{ height: "18px", borderRadius: "4px", background: color, opacity: c.statut === "Annulé" ? 0.3 : c.statut === "Terminé" ? 0.5 : 0.85 }} title={`${c.plateforme} · ${c.statut}`} />}
                            </td>
                          );
                        })}
                        <td style={{ padding: "10px 16px", textAlign: "right", color: "#555", fontSize: "12px", fontWeight: 500 }}>{fmtBudget(c.budget_total)}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {TOUTES_PLATEFORMES.map(p => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#888" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: plateformeColor[p], display: "inline-block" }} />
            {plateformeIcon[p]} {p}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Vue mensuelle par jours ────────────────────────────────────────── */
function CalendrierMensuelView({
  campagnes, plateformeColor, plateformeIcon, statutColor,
}: {
  campagnes: CampagneWithClient[];
  plateformeColor: Record<string, string>;
  plateformeIcon: Record<string, string>;
  statutColor: Record<string, { bg: string; color: string }>;
}) {
  const now = new Date();
  const [annee, setAnnee] = useState(now.getFullYear());
  const [mois, setMois] = useState(now.getMonth());

  const daysInMonth = new Date(annee, mois + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthStart = new Date(annee, mois, 1);
  const monthEnd = new Date(annee, mois, daysInMonth, 23, 59, 59);
  const today = new Date();

  const campagnesMois = campagnes.filter((c) => {
    const debut = parseDate(c.date_debut);
    const fin = c.date_fin ? parseDate(c.date_fin) : new Date(9999, 0, 1);
    return debut <= monthEnd && fin >= monthStart;
  });

  function prevMonth() { mois === 0 ? (setMois(11), setAnnee(a => a - 1)) : setMois(m => m - 1); }
  function nextMonth() { mois === 11 ? (setMois(0), setAnnee(a => a + 1)) : setMois(m => m + 1); }

  const todayPct = annee === today.getFullYear() && mois === today.getMonth()
    ? ((today.getDate() - 1) / daysInMonth) * 100 : null;

  return (
    <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={prevMonth} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "14px", color: "#555" }}>‹</button>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>{MOIS_FR[mois]} {annee}</span>
        <button onClick={nextMonth} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "14px", color: "#555" }}>›</button>
      </div>

      {/* En-tête jours */}
      <div style={{ borderBottom: "1px solid #f0f0f0", overflowX: "auto" }}>
        <div style={{ display: "flex", minWidth: "600px", paddingLeft: "220px" }}>
          {days.map((d) => {
            const isToday = annee === today.getFullYear() && mois === today.getMonth() && d === today.getDate();
            return (
              <div key={d} style={{ flex: 1, textAlign: "center", fontSize: "10px", color: isToday ? "#7b9fff" : "#bbb", fontWeight: isToday ? 700 : 400, padding: "8px 0", borderLeft: "1px solid #f0f0f0" }}>
                {d}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rangées campagnes */}
      <div style={{ overflowX: "auto" }}>
        {campagnesMois.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>Aucune campagne active ce mois.</div>
        ) : campagnesMois.map((c) => {
          const debut = parseDate(c.date_debut);
          const fin = c.date_fin ? parseDate(c.date_fin) : new Date(annee, mois, daysInMonth);
          const startDay = Math.max(1, debut <= monthStart ? 1 : debut.getDate());
          const endDay = Math.min(daysInMonth, fin >= monthEnd ? daysInMonth : fin.getDate());
          const left = `${((startDay - 1) / daysInMonth) * 100}%`;
          const width = `${Math.max(((endDay - startDay + 1) / daysInMonth) * 100, 1)}%`;
          const color = plateformeColor[c.plateforme] || "#7b9fff";
          const sc = statutColor[c.statut] || { bg: "#f3f4f6", color: "#6b7280" };

          return (
            <div key={c.id} style={{ display: "flex", alignItems: "center", minWidth: "600px", borderBottom: "1px solid #f5f5f5", position: "relative" }}>
              <div style={{ width: "220px", flexShrink: 0, padding: "10px 16px", borderRight: "1px solid #f0f0f0" }}>
                <Link href={`/clients/${c.client_id}`} style={{ textDecoration: "none" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.clients?.nom}</div>
                </Link>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{plateformeIcon[c.plateforme]} {c.plateforme} · {c.type_campagne}</div>
                <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, background: sc.bg, color: sc.color, marginTop: "3px" }}>{c.statut}</span>
              </div>
              <div style={{ flex: 1, position: "relative", height: "48px" }}>
                {todayPct !== null && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${todayPct}%`, width: "1px", background: "#7b9fff", opacity: 0.5, zIndex: 1 }} />}
                <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left, width, height: "22px", background: color, borderRadius: "4px", opacity: 0.85, display: "flex", alignItems: "center", paddingLeft: "6px", overflow: "hidden", zIndex: 2 }}>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.budget_total ? fmtBudget(c.budget_total) : c.objectif || ""}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {TOUTES_PLATEFORMES.map(p => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#888" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: plateformeColor[p], display: "inline-block" }} />
            {plateformeIcon[p]} {p}
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#888" }}>
          <span style={{ width: "1px", height: "12px", background: "#7b9fff", display: "inline-block" }} />
          Aujourd'hui
        </div>
      </div>
    </div>
  );
}

/* ── Composant principal ────────────────────────────────────────────── */
export default function SocialPageClient({
  campagnes, plateformeColor, plateformeIcon, statutColor,
}: {
  campagnes: CampagneWithClient[];
  plateformeColor: Record<string, string>;
  plateformeIcon: Record<string, string>;
  statutColor: Record<string, { bg: string; color: string }>;
}) {
  const [filtrePlateformes, setFiltrePlateformes] = useState<string[]>([]);
  const [filtreStatuts, setFiltreStatuts] = useState<string[]>([]);
  const [vue, setVue] = useState<"liste" | "semaines" | "mois">("liste");

  const filtered = campagnes.filter(c => {
    if (filtrePlateformes.length > 0 && !filtrePlateformes.includes(c.plateforme)) return false;
    if (filtreStatuts.length > 0 && !filtreStatuts.includes(c.statut)) return false;
    return true;
  });

  const hasFiltres = filtrePlateformes.length > 0 || filtreStatuts.length > 0;

  const btnVue = (key: "liste" | "semaines" | "mois", label: string) => (
    <button
      onClick={() => setVue(key)}
      style={{ padding: "6px 14px", fontSize: "12px", fontWeight: 600, background: vue === key ? "#1a1a2e" : "#fff", color: vue === key ? "#fff" : "#888", border: "none", cursor: "pointer", borderLeft: key !== "liste" ? "1px solid #e5e7eb" : "none" }}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Filtres + toggle vue */}
      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px 20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start", flex: 1 }}>

            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Plateforme</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {TOUTES_PLATEFORMES.map((p) => {
                  const active = filtrePlateformes.includes(p);
                  const color = plateformeColor[p] || "#aaa";
                  return (
                    <button key={p} onClick={() => setFiltrePlateformes(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                      style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "12px", border: `1px solid ${active ? color : "#e5e7eb"}`, background: active ? color : "#fff", color: active ? "#fff" : "#555", cursor: "pointer", fontWeight: active ? 600 : 400 }}>
                      {plateformeIcon[p]} {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Statut</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {TOUS_STATUTS.map((s) => {
                  const active = filtreStatuts.includes(s);
                  const sc = statutColor[s] || { bg: "#f3f4f6", color: "#6b7280" };
                  return (
                    <button key={s} onClick={() => setFiltreStatuts(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                      style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "12px", border: `1px solid ${active ? sc.color : "#e5e7eb"}`, background: active ? sc.bg : "#fff", color: active ? sc.color : "#555", cursor: "pointer", fontWeight: active ? 600 : 400 }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {hasFiltres && (
              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "2px" }}>
                <button onClick={() => { setFiltrePlateformes([]); setFiltreStatuts([]); }}
                  style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "12px", border: "1px solid #e5e7eb", background: "#f9fafb", color: "#888", cursor: "pointer" }}>
                  ✕ Réinitialiser
                </button>
              </div>
            )}
          </div>

          {/* Toggle vue */}
          <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
            {btnVue("liste", "☰ Liste")}
            {btnVue("semaines", "📅 Semaines")}
            {btnVue("mois", "🗓 Mois")}
          </div>
        </div>

        {hasFiltres && (
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#888" }}>
            {filtered.length} campagne{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""} sur {campagnes.length}
          </div>
        )}
      </div>

      {vue === "semaines" && (
        <GanttSocialView campagnes={filtered} plateformeColor={plateformeColor} plateformeIcon={plateformeIcon} statutColor={statutColor} />
      )}

      {vue === "mois" && (
        <CalendrierMensuelView campagnes={filtered} plateformeColor={plateformeColor} plateformeIcon={plateformeIcon} statutColor={statutColor} />
      )}

      {vue === "liste" && (
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Toutes les campagnes</span>
            <span style={{ fontSize: "12px", color: "#888" }}>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
              {hasFiltres ? "Aucune campagne ne correspond aux filtres." : "Aucune campagne. Créez-en depuis la fiche client."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "760px" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["Client", "Plateforme", "Type", "Objectif", "Budget", "Période", "Statut"].map((h, i) => (
                      <th key={i} style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const sc = statutColor[c.statut] || { bg: "#f3f4f6", color: "#6b7280" };
                    const offre = c.clients?.offre;
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <Link href={`/clients/${c.client_id}`} style={{ textDecoration: "none" }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e" }}>{c.clients?.nom}</div>
                            {offre && <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, background: offreBadge[offre]?.bg, color: offreBadge[offre]?.color, marginTop: "2px" }}>{offre}</span>}
                          </Link>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: plateformeColor[c.plateforme] || "#aaa", flexShrink: 0 }} />
                            <span style={{ fontWeight: 500 }}>{plateformeIcon[c.plateforme]} {c.plateforme}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#374151" }}>{c.type_campagne}</td>
                        <td style={{ padding: "12px 16px", color: "#888" }}>{c.objectif || "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: 500 }}>{fmtBudget(c.budget_total)}</div>
                          {c.budget_journalier && <div style={{ fontSize: "11px", color: "#aaa" }}>{fmtBudget(c.budget_journalier)}/j</div>}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#666" }}>
                          <div>{formatDate(c.date_debut)}</div>
                          {c.date_fin && <div style={{ color: "#aaa" }}>→ {formatDate(c.date_fin)}</div>}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: sc.bg, color: sc.color }}>{c.statut}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
