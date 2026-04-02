import Sidebar from "../components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const revalidate = 0;

const offreBadge: Record<string, { bg: string; color: string }> = {
  PREMIUM: { bg: "#f3e8ff", color: "#7c3aed" },
  PERFORMANCE: { bg: "#dbeafe", color: "#1d4ed8" },
  START: { bg: "#f3f4f6", color: "#6b7280" },
};

const statutBadge: Record<string, { bg: string; color: string }> = {
  "Active": { bg: "#dcfce7", color: "#16a34a" },
  "En pause": { bg: "#fff7ed", color: "#c2410c" },
  "Terminée": { bg: "#f3f4f6", color: "#6b7280" },
};

const planStatutColor: Record<string, { bg: string; color: string }> = {
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
  Digital: "#7b9fff",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M F`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k F`;
  return `${n} F`;
}

function formatDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function daysUntil(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  const target = new Date(y, m - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

export default async function Dashboard() {
  const supabase = await createClient();

  const [{ data: clients }, { data: plans }, { data: notifs }, { data: social }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("plans_media").select("*, clients(nom)").order("date_debut", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("campagnes_sociales").select("*, clients(nom)").order("date_debut", { ascending: false }),
  ]);

  const allClients = clients ?? [];
  const allPlans = (plans ?? []) as any[];
  const allNotifs = notifs ?? [];
  const allSocial = (social ?? []) as any[];

  // --- KPIs ---
  const clientsActifs = allClients.filter((c) => c.statut === "Active").length;
  const budgetMensuel = allClients
    .filter((c) => c.statut === "Active")
    .reduce((acc, c) => acc + (c.budget_mensuel || 0), 0);
  const plansEnCours = allPlans.filter((p) => p.statut === "En cours").length;
  const contactsRecus = allNotifs.filter((n) => n.type === "contact").length;
  const tauxActivite = allClients.length > 0 ? Math.round((clientsActifs / allClients.length) * 100) : 0;
  const socialEnLigne = allSocial.filter((c) => c.statut === "En ligne").length;
  const socialActives = allSocial.filter((c) => c.statut === "En ligne" || c.statut === "En préparation" || c.statut === "En attente validation").slice(0, 5);

  // --- Budget par canal ---
  const budgetParCanal: Record<string, number> = {};
  for (const p of allPlans) {
    if (p.budget && p.canal) {
      budgetParCanal[p.canal] = (budgetParCanal[p.canal] || 0) + p.budget;
    }
  }
  const canauxTries = Object.entries(budgetParCanal).sort((a, b) => b[1] - a[1]);
  const maxCanal = Math.max(...canauxTries.map(([, v]) => v), 1);

  // --- Plans à venir (Planifié, triés par date_debut asc) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const plansAVenir = allPlans
    .filter((p) => p.statut === "Planifié")
    .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime())
    .slice(0, 5);

  // --- Alertes : plans En cours qui terminent dans 7 jours ---
  const alertes = allPlans
    .filter((p) => {
      if (p.statut !== "En cours") return false;
      const j = daysUntil(p.date_fin);
      return j >= 0 && j <= 7;
    })
    .sort((a, b) => daysUntil(a.date_fin) - daysUntil(b.date_fin))
    .slice(0, 4);

  // --- Contacts prospects ---
  const contacts = allNotifs.filter((n) => n.type === "contact").slice(0, 5);

  // --- Répartition offres ---
  const offres = (["PREMIUM", "PERFORMANCE", "START"] as const).map((offre) => ({
    offre,
    count: allClients.filter((c) => c.offre === offre).length,
  }));
  const maxOffre = Math.max(...offres.map((o) => o.count), 1);

  const kpis = [
    { label: "Clients actifs", value: String(clientsActifs), sub: `${tauxActivite}% du portefeuille`, color: "#7b9fff" },
    { label: "Budget géré / mois", value: fmt(budgetMensuel), sub: "Clients actifs uniquement", color: "#34d399" },
    { label: "Plans médias en cours", value: String(plansEnCours), sub: `${plansAVenir.length} à venir`, color: "#fbbf24" },
    { label: "Campagnes sociales en ligne", value: String(socialEnLigne), sub: `${allSocial.length} au total`, color: "#a78bfa" },
  ];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Tableau de bord</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Vue globale — données en direct</p>
          </div>
          <Link href="/nouveau-client" style={{ background: "#1a1a2e", color: "#fff", padding: "9px 18px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
            + Nouveau client
          </Link>
        </div>

        <div className="page-content">

          {/* KPIs */}
          <div className="grid-4col">
            {kpis.map((kpi) => (
              <div key={kpi.label} style={{ background: "#fff", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.label}</div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a2e", margin: "6px 0 4px" }}>{kpi.value}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{kpi.sub}</div>
                <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: kpi.color, borderRadius: "0 10px 10px 0" }} />
              </div>
            ))}
          </div>

          {/* Alertes */}
          {alertes.length > 0 && (
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "14px 20px", marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "16px" }}>⚠️</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#c2410c" }}>Plans se terminant bientôt :</span>
              {alertes.map((p) => {
                const j = daysUntil(p.date_fin);
                return (
                  <Link key={p.id} href={`/clients/${p.client_id}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", background: "#fff", border: "1px solid #fed7aa", borderRadius: "20px", fontSize: "12px", color: "#c2410c", textDecoration: "none", fontWeight: 600 }}>
                    {p.clients?.nom} · {p.canal} · {j === 0 ? "aujourd'hui" : `dans ${j} j`}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Campagnes sociales actives */}
          {socialActives.length > 0 && (
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "20px" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Campagnes sociales actives</h3>
                <Link href="/social" style={{ fontSize: "13px", color: "#7b9fff", textDecoration: "none" }}>Voir tout →</Link>
              </div>
              <div className="table-scroll">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Client", "Plateforme", "Type", "Budget", "Statut"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {socialActives.map((c) => {
                      const statutColors: Record<string, { bg: string; color: string }> = {
                        "En ligne": { bg: "#dcfce7", color: "#16a34a" },
                        "En préparation": { bg: "#f3f4f6", color: "#6b7280" },
                        "En attente validation": { bg: "#fff7ed", color: "#c2410c" },
                      };
                      const sc = statutColors[c.statut] || { bg: "#f3f4f6", color: "#6b7280" };
                      return (
                        <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td style={{ padding: "11px 16px" }}>
                            <Link href={`/clients/${c.client_id}`} style={{ fontWeight: 600, color: "#1a1a2e", textDecoration: "none" }}>{c.clients?.nom || "—"}</Link>
                          </td>
                          <td style={{ padding: "11px 16px", fontWeight: 500 }}>{c.plateforme}</td>
                          <td style={{ padding: "11px 16px", color: "#666" }}>{c.type_campagne}</td>
                          <td style={{ padding: "11px 16px" }}>{c.budget_total ? fmt(c.budget_total) : "—"}</td>
                          <td style={{ padding: "11px 16px" }}>
                            <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: sc.bg, color: sc.color }}>
                              {c.statut}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid-2col">

            {/* Budget par canal */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e", marginBottom: "16px" }}>Budget par canal</h3>
              {canauxTries.length === 0 ? (
                <div style={{ fontSize: "13px", color: "#aaa", padding: "16px 0" }}>Aucun plan avec budget</div>
              ) : canauxTries.map(([canal, budget]) => (
                <div key={canal} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: canalColor[canal] || "#aaa", flexShrink: 0, display: "inline-block" }} />
                      <span style={{ fontSize: "13px", color: "#374151" }}>{canal}</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a2e" }}>{fmt(budget)}</span>
                  </div>
                  <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${Math.round((budget / maxCanal) * 100)}%`, height: "100%", borderRadius: "4px", background: canalColor[canal] || "#aaa", transition: "width 0.3s" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Répartition offres + statuts */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e", marginBottom: "16px" }}>Répartition des offres</h3>
              {offres.map(({ offre, count }) => (
                <div key={offre} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: offreBadge[offre].bg, color: offreBadge[offre].color }}>
                      {offre}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a2e" }}>{count}</span>
                  </div>
                  <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${Math.round((count / maxOffre) * 100)}%`, height: "100%", borderRadius: "4px", background: offreBadge[offre].color }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(["Active", "En pause", "Terminée"] as const).map((statut) => {
                  const n = allClients.filter((c) => c.statut === statut).length;
                  if (n === 0) return null;
                  return (
                    <div key={statut} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "20px", background: "#f5f6fa" }}>
                      <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: statutBadge[statut]?.color }} />
                      <span style={{ fontSize: "12px", color: "#555" }}>{statut}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a2e" }}>{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid-2col">

            {/* Plans à venir */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Plans à venir</h3>
                <Link href="/mediaplan" style={{ fontSize: "13px", color: "#7b9fff", textDecoration: "none" }}>Voir le Gantt →</Link>
              </div>
              {plansAVenir.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
                  Aucun plan planifié.
                </div>
              ) : (
                <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Client", "Canal", "Budget", "Démarre dans", "Fin"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plansAVenir.map((plan) => {
                      const j = daysUntil(plan.date_debut);
                      return (
                        <tr key={plan.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td style={{ padding: "11px 16px", fontWeight: 600, color: "#1a1a2e" }}>{plan.clients?.nom || "—"}</td>
                          <td style={{ padding: "11px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: canalColor[plan.canal] || "#aaa", flexShrink: 0 }} />
                              {plan.canal}
                            </div>
                          </td>
                          <td style={{ padding: "11px 16px" }}>{plan.budget ? fmt(plan.budget) : "—"}</td>
                          <td style={{ padding: "11px 16px" }}>
                            <span style={{ padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: j <= 3 ? "#fff7ed" : "#f0f4ff", color: j <= 3 ? "#c2410c" : "#1d4ed8" }}>
                              {j === 0 ? "Aujourd'hui" : j === 1 ? "Demain" : `dans ${j} j`}
                            </span>
                          </td>
                          <td style={{ padding: "11px 16px", color: "#888", fontSize: "12px" }}>
                            {formatDate(plan.date_fin)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table></div>
              )}
            </div>

            {/* Contacts prospects */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Prospects</h3>
                <Link href="/notifications" style={{ fontSize: "13px", color: "#7b9fff", textDecoration: "none" }}>Tout voir →</Link>
              </div>
              {contacts.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
                  Aucun contact reçu
                </div>
              ) : contacts.map((n) => (
                <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f9f9f9" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a2e", marginBottom: "2px" }}>
                    {n.title.replace("Nouveau contact — ", "")}
                  </div>
                  {n.body && (
                    <div style={{ fontSize: "11px", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {n.body}
                    </div>
                  )}
                  <div style={{ fontSize: "10px", color: "#bbb", marginTop: "3px" }}>{timeAgo(n.created_at)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Clients récents */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Derniers clients</h3>
              <Link href="/clients" style={{ fontSize: "13px", color: "#7b9fff", textDecoration: "none" }}>Voir tous →</Link>
            </div>
            <div className="table-scroll"><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Client", "Offre", "Budget / mois", "Canaux", "Statut", "ROI"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allClients.slice(0, 5).map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={`/clients/${c.id}`} style={{ fontWeight: 600, color: "#1a1a2e", textDecoration: "none" }}>{c.nom}</Link>
                      <div style={{ fontSize: "11px", color: "#888" }}>{c.secteur}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: offreBadge[c.offre]?.bg, color: offreBadge[c.offre]?.color }}>
                        {c.offre}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>{fmt(c.budget_mensuel || 0)}</td>
                    <td style={{ padding: "12px 16px", color: "#666", fontSize: "12px" }}>{c.canaux?.join(" · ") || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: statutBadge[c.statut]?.bg, color: statutBadge[c.statut]?.color }}>
                        {c.statut}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: c.roi?.startsWith("×") ? "#16a34a" : "#888" }}>
                      {c.roi || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>

        </div>
      </main>
    </div>
  );
}
