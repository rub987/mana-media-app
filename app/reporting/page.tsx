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

const statutColor: Record<string, { bg: string; color: string }> = {
  "Planifié": { bg: "#dbeafe", color: "#1d4ed8" },
  "En cours": { bg: "#dcfce7", color: "#16a34a" },
  "Terminé": { bg: "#f3f4f6", color: "#6b7280" },
  "Annulé": { bg: "#fee2e2", color: "#dc2626" },
};

function fmt(n: number) {
  return n >= 1000 ? `${Math.round(n / 1000)}k F` : `${n} F`;
}

function formatDate(d: string) {
  if (!d) return "—";
  const [year, month, day] = d.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default async function Reporting() {
  const supabase = await createClient();

  const [{ data: clients }, { data: plans }] = await Promise.all([
    supabase.from("clients").select("*").order("nom"),
    supabase.from("plans_media").select("*, clients(nom, offre)").order("date_debut", { ascending: false }),
  ]);

  const allClients = clients || [];
  const allPlans = (plans || []) as any[];

  // --- KPIs ---
  const clientsActifs = allClients.filter((c) => c.statut === "Active").length;
  const budgetMensuelTotal = allClients
    .filter((c) => c.statut === "Active")
    .reduce((acc, c) => acc + (c.budget_mensuel || 0), 0);
  const plansEnCours = allPlans.filter((p) => p.statut === "En cours").length;
  const budgetPlansTotal = allPlans.reduce((acc, p) => acc + (p.budget || 0), 0);

  // --- Répartition par canal ---
  const byCanal = new Map<string, { budget: number; count: number }>();
  for (const plan of allPlans) {
    if (!byCanal.has(plan.canal)) byCanal.set(plan.canal, { budget: 0, count: 0 });
    const entry = byCanal.get(plan.canal)!;
    entry.budget += plan.budget || 0;
    entry.count += 1;
  }
  const canalStats = Array.from(byCanal.entries())
    .map(([canal, stats]) => ({ canal, ...stats }))
    .sort((a, b) => b.budget - a.budget);
  const maxBudgetCanal = canalStats[0]?.budget || 1;

  // --- Résumé par client ---
  const clientSummary = allClients.map((client) => {
    const clientPlans = allPlans.filter((p) => p.client_id === client.id);
    const totalBudgetPlans = clientPlans.reduce((acc, p) => acc + (p.budget || 0), 0);
    const plansActifs = clientPlans.filter((p) => p.statut === "En cours").length;
    const canaux = [...new Set(clientPlans.map((p) => p.canal))];
    return { ...client, clientPlans, totalBudgetPlans, plansActifs, canaux };
  }).filter((c) => c.clientPlans.length > 0 || c.statut === "Active");

  const kpis = [
    { label: "Clients actifs", value: String(clientsActifs), color: "#7b9fff" },
    { label: "Budget mensuel total", value: fmt(budgetMensuelTotal), color: "#34d399" },
    { label: "Plans en cours", value: String(plansEnCours), color: "#fbbf24" },
    { label: "Budget plans total", value: fmt(budgetPlansTotal), color: "#a78bfa" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Reporting</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
            Vue globale — {allClients.length} clients · {allPlans.length} plans médias
          </p>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {kpis.map((k) => (
              <div key={k.label} style={{ background: "#fff", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a2e", margin: "6px 0 0" }}>{k.value}</div>
                <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: k.color, borderRadius: "0 10px 10px 0" }} />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

            {/* Budget par canal */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e", marginBottom: "16px" }}>Budget par canal</h4>
              {canalStats.length === 0 ? (
                <div style={{ fontSize: "13px", color: "#aaa" }}>Aucun plan créé.</div>
              ) : (
                canalStats.map((c) => (
                  <div key={c.canal} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#555", width: "120px", flexShrink: 0 }}>
                      {canalEmoji[c.canal] || "•"} {c.canal}
                    </div>
                    <div style={{ flex: 1, background: "#f0f0f0", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.round((c.budget / maxBudgetCanal) * 100)}%`, height: "100%", borderRadius: "4px", background: canalColor[c.canal] || "#aaa" }} />
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a2e", width: "60px", textAlign: "right" }}>{fmt(c.budget)}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", width: "50px", textAlign: "right" }}>{c.count} plan{c.count > 1 ? "s" : ""}</div>
                  </div>
                ))
              )}
            </div>

            {/* Répartition offres */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e", marginBottom: "16px" }}>Clients par offre</h4>
              {(["PREMIUM", "PERFORMANCE", "START"] as const).map((offre) => {
                const count = allClients.filter((c) => c.offre === offre).length;
                const budget = allClients.filter((c) => c.offre === offre).reduce((a, c) => a + (c.budget_mensuel || 0), 0);
                const pct = allClients.length > 0 ? Math.round((count / allClients.length) * 100) : 0;
                return (
                  <div key={offre} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: offreBadge[offre].bg, color: offreBadge[offre].color, width: "100px", textAlign: "center", flexShrink: 0 }}>
                      {offre}
                    </span>
                    <div style={{ flex: 1, background: "#f0f0f0", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: "4px", background: offreBadge[offre].color }} />
                    </div>
                    <div style={{ fontSize: "12px", color: "#555", width: "24px", textAlign: "right" }}>{count}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", width: "70px", textAlign: "right" }}>{fmt(budget)}/mois</div>
                  </div>
                );
              })}
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
                {allClients.filter((c) => c.statut !== "Active").length > 0 && (
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {allClients.filter((c) => c.statut !== "Active").length} client(s) en pause ou terminé(s)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tableau plans récents */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
              Tous les plans médias
            </div>
            {allPlans.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
                Aucun plan créé. Créez des plans depuis les fiches clients.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Client", "Canal", "Budget", "Début", "Fin", "Statut", "Notes"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allPlans.map((plan) => (
                      <tr key={plan.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "11px 16px", fontWeight: 600, color: "#1a1a2e" }}>{plan.clients?.nom || "—"}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: canalColor[plan.canal] || "#aaa", flexShrink: 0 }} />
                            {plan.canal}
                          </div>
                        </td>
                        <td style={{ padding: "11px 16px" }}>{plan.budget ? fmt(plan.budget) : "—"}</td>
                        <td style={{ padding: "11px 16px", color: "#666" }}>{formatDate(plan.date_debut)}</td>
                        <td style={{ padding: "11px 16px", color: "#666" }}>{formatDate(plan.date_fin)}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: statutColor[plan.statut]?.bg, color: statutColor[plan.statut]?.color }}>
                            {plan.statut}
                          </span>
                        </td>
                        <td style={{ padding: "11px 16px", color: "#888" }}>{plan.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tableau récapitulatif clients */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
              Récapitulatif clients
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Client", "Offre", "Statut", "Budget mensuel", "Plans", "Budget plans", "ROI estimé", "Canaux"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allClients.map((client) => {
                  const clientPlans = allPlans.filter((p) => p.client_id === client.id);
                  const totalBudgetPlans = clientPlans.reduce((acc: number, p: any) => acc + (p.budget || 0), 0);
                  const canaux = [...new Set(clientPlans.map((p: any) => p.canal))];
                  return (
                    <tr key={client.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "11px 16px", fontWeight: 600, color: "#1a1a2e" }}>{client.nom}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: offreBadge[client.offre]?.bg, color: offreBadge[client.offre]?.color }}>
                          {client.offre}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: client.statut === "Active" ? "#dcfce7" : "#fff7ed", color: client.statut === "Active" ? "#16a34a" : "#c2410c" }}>
                          {client.statut}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px" }}>{fmt(client.budget_mensuel || 0)}</td>
                      <td style={{ padding: "11px 16px", color: "#555" }}>{clientPlans.length}</td>
                      <td style={{ padding: "11px 16px" }}>{totalBudgetPlans > 0 ? fmt(totalBudgetPlans) : "—"}</td>
                      <td style={{ padding: "11px 16px", fontWeight: client.roi ? 600 : 400, color: client.roi?.startsWith("×") ? "#16a34a" : "#555" }}>
                        {client.roi || "—"}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {canaux.length > 0
                            ? canaux.map((canal: string) => (
                                <span key={canal} style={{ width: "8px", height: "8px", borderRadius: "50%", background: canalColor[canal] || "#aaa", display: "inline-block" }} title={canal} />
                              ))
                            : <span style={{ color: "#aaa", fontSize: "12px" }}>—</span>
                          }
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
