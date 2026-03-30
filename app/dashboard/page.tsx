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
  Digital: "#7b9fff",
  Print: "#34d399",
  Affichage: "#f87171",
  TV: "#a78bfa",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M F`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k F`;
  return `${n} F`;
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default async function Dashboard() {
  const supabase = await createClient();

  const [{ data: clients }, { data: plans }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("plans_media").select("*, clients(nom)").order("date_debut", { ascending: false }),
  ]);

  const allClients = clients ?? [];
  const allPlans = (plans ?? []) as any[];

  // --- KPIs ---
  const clientsActifs = allClients.filter((c) => c.statut === "Active").length;
  const budgetMensuel = allClients
    .filter((c) => c.statut === "Active")
    .reduce((acc, c) => acc + (c.budget_mensuel || 0), 0);
  const plansEnCours = allPlans.filter((p) => p.statut === "En cours").length;
  const budgetPlans = allPlans.reduce((acc, p) => acc + (p.budget || 0), 0);

  // --- Plans récents (5 derniers, triés par date_debut desc) ---
  const plansRecents = allPlans.slice(0, 5);

  // --- Répartition offres ---
  const offres = (["PREMIUM", "PERFORMANCE", "START"] as const).map((offre) => ({
    offre,
    count: allClients.filter((c) => c.offre === offre).length,
  }));
  const maxOffre = Math.max(...offres.map((o) => o.count), 1);

  const kpis = [
    { label: "Clients actifs", value: String(clientsActifs), sub: `${allClients.length} clients au total`, color: "#7b9fff" },
    { label: "Budget géré / mois", value: fmt(budgetMensuel), sub: "Clients actifs uniquement", color: "#34d399" },
    { label: "Plans en cours", value: String(plansEnCours), sub: `${allPlans.length} plans au total`, color: "#fbbf24" },
    { label: "Budget plans total", value: fmt(budgetPlans), sub: "Tous plans confondus", color: "#a78bfa" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Tableau de bord</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Vue globale — données en direct</p>
          </div>
          <Link href="/nouveau-client" style={{ background: "#1a1a2e", color: "#fff", padding: "9px 18px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
            + Nouveau client
          </Link>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {kpis.map((kpi) => (
              <div key={kpi.label} style={{ background: "#fff", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.label}</div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a2e", margin: "6px 0 4px" }}>{kpi.value}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{kpi.sub}</div>
                <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: kpi.color, borderRadius: "0 10px 10px 0" }} />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>

            {/* Plans récents */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Plans médias récents</h3>
                <Link href="/mediaplan" style={{ fontSize: "13px", color: "#7b9fff", textDecoration: "none" }}>Voir le Gantt →</Link>
              </div>
              {plansRecents.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
                  Aucun plan créé. <Link href="/clients" style={{ color: "#7b9fff" }}>Créer depuis une fiche client →</Link>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Client", "Canal", "Budget", "Période", "Statut"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plansRecents.map((plan) => (
                      <tr key={plan.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "11px 16px", fontWeight: 600, color: "#1a1a2e" }}>{plan.clients?.nom || "—"}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: canalColor[plan.canal] || "#aaa", flexShrink: 0 }} />
                            {plan.canal}
                          </div>
                        </td>
                        <td style={{ padding: "11px 16px" }}>{plan.budget ? fmt(plan.budget) : "—"}</td>
                        <td style={{ padding: "11px 16px", color: "#666", fontSize: "12px" }}>
                          {formatDate(plan.date_debut)} → {formatDate(plan.date_fin)}
                        </td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: planStatutColor[plan.statut]?.bg, color: planStatutColor[plan.statut]?.color }}>
                            {plan.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Répartition offres */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e", marginBottom: "16px" }}>Répartition des offres</h3>
              {offres.map(({ offre, count }) => (
                <div key={offre} style={{ marginBottom: "14px" }}>
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
              <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
                {(["Active", "En pause", "Terminée"] as const).map((statut) => {
                  const n = allClients.filter((c) => c.statut === statut).length;
                  if (n === 0) return null;
                  return (
                    <div key={statut} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555", marginBottom: "6px" }}>
                      <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: statutBadge[statut]?.bg, color: statutBadge[statut]?.color }}>
                        {statut}
                      </span>
                      <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Clients récents */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Derniers clients</h3>
              <Link href="/clients" style={{ fontSize: "13px", color: "#7b9fff", textDecoration: "none" }}>Voir tous →</Link>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
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
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
