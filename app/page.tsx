import Sidebar from "./components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const revalidate = 0;

const offreBadge: Record<string, { bg: string; color: string }> = {
  PREMIUM: { bg: "#f3e8ff", color: "#7c3aed" },
  PERFORMANCE: { bg: "#dbeafe", color: "#1d4ed8" },
  START: { bg: "#f3f4f6", color: "#6b7280" },
};

const statutBadge: Record<string, { bg: string; color: string }> = {
  Active: { bg: "#dcfce7", color: "#16a34a" },
  "En pause": { bg: "#fff7ed", color: "#c2410c" },
};

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: clients } = await supabase.from("clients").select("*").order("created_at", { ascending: false });

  const total = clients?.length ?? 0;
  const actifs = clients?.filter((c) => c.statut === "Active").length ?? 0;
  const enPause = clients?.filter((c) => c.statut === "En pause").length ?? 0;
  const budgetTotal = clients?.reduce((acc, c) => acc + (c.budget_mensuel || 0), 0) ?? 0;
  const budgetK = budgetTotal >= 1000000
    ? `${(budgetTotal / 1000000).toFixed(1)}M F`
    : `${Math.round(budgetTotal / 1000)}k F`;

  const kpis = [
    { label: "Clients actifs", value: String(actifs), change: `${total} clients au total`, up: true, color: "#7b9fff" },
    { label: "Budget géré / mois", value: budgetK, change: "Tous clients confondus", up: true, color: "#34d399" },
    { label: "Offres PREMIUM", value: String(clients?.filter((c) => c.offre === "PREMIUM").length ?? 0), change: "Clients haut de gamme", up: true, color: "#fbbf24" },
    { label: "Campagnes actives", value: String(actifs), change: `${enPause} en pause`, up: false, color: "#f87171" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
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
                <div style={{ fontSize: "12px", color: kpi.up ? "#16a34a" : "#888" }}>{kpi.change}</div>
                <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: kpi.color, borderRadius: "0 10px 10px 0" }} />
              </div>
            ))}
          </div>

          {/* Tableau clients */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Clients actifs</h3>
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
                {clients?.slice(0, 6).map((c) => (
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
                    <td style={{ padding: "12px 16px" }}>{Math.round((c.budget_mensuel || 0) / 1000)}k F</td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{c.canaux?.join(" · ") || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: statutBadge[c.statut]?.bg, color: statutBadge[c.statut]?.color }}>
                        {c.statut}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: c.roi?.startsWith("×") ? "#16a34a" : "#888" }}>{c.roi || "—"}</td>
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
