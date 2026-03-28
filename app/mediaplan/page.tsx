import Sidebar from "../components/Sidebar";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

const canalColor: Record<string, string> = {
  Radio: "#fbbf24",
  Digital: "#7b9fff",
  Print: "#34d399",
  Affichage: "#f87171",
  TV: "#a78bfa",
};

const canalEmoji: Record<string, string> = {
  Radio: "🎙",
  Digital: "💻",
  Print: "📰",
  Affichage: "📋",
  TV: "📺",
};

const offreBadge: Record<string, { bg: string; color: string }> = {
  PREMIUM: { bg: "#f3e8ff", color: "#7c3aed" },
  PERFORMANCE: { bg: "#dbeafe", color: "#1d4ed8" },
  START: { bg: "#f3f4f6", color: "#6b7280" },
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

export default async function MediaPlan() {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("plans_media")
    .select("*, clients(nom, offre)")
    .order("date_debut", { ascending: true });

  const allPlans = (plans || []) as PlanWithClient[];

  // Grid start: Monday of the earliest plan, or current Monday
  const earliest = allPlans.length > 0 ? new Date(allPlans[0].date_debut) : new Date();
  const gridStart = getMondayOf(earliest);

  const NUM_WEEKS = 10;
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

  // Group plans by client
  const byClient = new Map<string, { nom: string; offre: string; plans: PlanWithClient[] }>();
  for (const plan of allPlans) {
    if (!byClient.has(plan.client_id)) {
      byClient.set(plan.client_id, { nom: plan.clients.nom, offre: plan.clients.offre, plans: [] });
    }
    byClient.get(plan.client_id)!.plans.push(plan);
  }

  const clients = Array.from(byClient.values());

  const legende = Object.entries(canalColor).map(([label, color]) => ({ label, color }));

  const moisLabel = (() => {
    const debut = gridStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const fin = addDays(gridStart, (NUM_WEEKS - 1) * 7 + 6).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return debut === fin ? debut : `${debut} — ${fin}`;
  })();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Plans médias</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Vue Gantt — {allPlans.length} plan{allPlans.length > 1 ? "s" : ""} actif{allPlans.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* Légende */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
            {legende.map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#555" }}>
                <span style={{ width: "12px", height: "12px", background: l.color, borderRadius: "3px", display: "inline-block" }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Gantt */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Calendrier — {moisLabel}</h3>
            </div>

            {allPlans.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
                Aucun plan média. Créez des plans depuis la fiche client.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "800px" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      <th style={{ textAlign: "left", padding: "10px 16px", width: "200px", color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f0f0f0" }}>
                        Client / Canal
                      </th>
                      {weeks.map((w, i) => (
                        <th key={i} style={{ textAlign: "center", padding: "10px 4px", color: "#888", fontSize: "11px", borderBottom: "1px solid #f0f0f0", minWidth: "64px" }}>
                          {w.label}<br />
                          <span style={{ fontSize: "10px", color: "#bbb" }}>{w.date}</span>
                        </th>
                      ))}
                      <th style={{ textAlign: "right", padding: "10px 16px", color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f0f0f0" }}>
                        Budget
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <>
                        {/* Ligne client */}
                        <tr key={client.nom} style={{ background: "#f8f9fc" }}>
                          <td colSpan={NUM_WEEKS + 2} style={{ padding: "8px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a2e" }}>{client.nom}</span>
                              <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: offreBadge[client.offre]?.bg, color: offreBadge[client.offre]?.color }}>
                                {client.offre}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Lignes plans */}
                        {client.plans.map((plan) => (
                          <tr key={plan.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                            <td style={{ padding: "10px 16px 10px 28px", color: "#555", fontSize: "12px" }}>
                              {canalEmoji[plan.canal] || "•"} {plan.canal}
                            </td>
                            {weeks.map((w, i) => (
                              <td key={i} style={{ padding: "7px 4px", textAlign: "center" }}>
                                {isPlanActiveInWeek(plan, w.start, w.end) && (
                                  <div style={{ height: "18px", borderRadius: "4px", background: canalColor[plan.canal] || "#aaa", opacity: 0.85 }} />
                                )}
                              </td>
                            ))}
                            <td style={{ padding: "10px 16px", textAlign: "right", color: "#555", fontSize: "12px", fontWeight: 500 }}>
                              {plan.budget ? `${Math.round(plan.budget / 1000)}k F` : "—"}
                            </td>
                          </tr>
                        ))}
                      </>
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

        </div>
      </main>
    </div>
  );
}
