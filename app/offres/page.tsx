import Sidebar from "../components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const revalidate = 0;

const offresConfig = [
  {
    nom: "START" as const,
    prix: "20 000",
    unite: "F / mois",
    engagement: "Engagement minimum 6 mois",
    populaire: false,
    dark: false,
    accentColor: "#e5e7eb",
    badgeBg: "#f3f4f6",
    badgeColor: "#6b7280",
    cible: "Petits commerces / budgets limités",
    cibleBg: "#f0f7ff",
    cibleColor: "#4f6ef5",
    inclus: [
      { ok: true, label: "Diagnostic rapide (1 échange)" },
      { ok: true, label: "Plan média simplifié (2 canaux)" },
      { ok: true, label: "Accès tarifs négociés" },
      { ok: true, label: "Suivi mensuel léger" },
      { ok: false, label: "Dashboard ROI" },
      { ok: false, label: "Optimisation continue" },
    ],
  },
  {
    nom: "PERFORMANCE" as const,
    prix: "80 000 – 120 000",
    unite: "F / mois",
    engagement: "+ commission 10–15%",
    populaire: true,
    dark: true,
    accentColor: "#7b9fff",
    badgeBg: "#dbeafe",
    badgeColor: "#1d4ed8",
    cible: "PME, tourisme, enseignes",
    cibleBg: "#f0f7ff",
    cibleColor: "#4f6ef5",
    inclus: [
      { ok: true, label: "Stratégie média complète" },
      { ok: true, label: "Gestion multi-supports" },
      { ok: true, label: "Optimisation mensuelle" },
      { ok: true, label: "Reporting clair" },
      { ok: true, label: "Réservation & coordination médias" },
      { ok: false, label: "Stratégie annuelle" },
    ],
  },
  {
    nom: "PREMIUM" as const,
    prix: "150 000+",
    unite: "F / mois",
    engagement: "+ commission sur budget média",
    populaire: false,
    dark: false,
    accentColor: "#e5e7eb",
    badgeBg: "#f3e8ff",
    badgeColor: "#7c3aed",
    cible: "Gros budgets, institutionnels",
    cibleBg: "#fff7ed",
    cibleColor: "#c2410c",
    inclus: [
      { ok: true, label: "Stratégie annuelle complète" },
      { ok: true, label: "Achat média optimisé" },
      { ok: true, label: "Négociation exclusive médias" },
      { ok: true, label: "Dashboard + analyse ROI" },
      { ok: true, label: "Recommandations continues" },
      { ok: true, label: "Directeur marketing externalisé" },
    ],
  },
];

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M F`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k F`;
  return `${n} F`;
}

export default async function Offres() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, nom, secteur, offre, budget_mensuel, statut, roi, canaux")
    .order("nom");

  const allClients = clients ?? [];

  const stats = Object.fromEntries(
    offresConfig.map((o) => {
      const groupe = allClients.filter((c) => c.offre === o.nom);
      const actifs = groupe.filter((c) => c.statut === "Active");
      const budgetTotal = actifs.reduce((acc, c) => acc + (c.budget_mensuel || 0), 0);
      return [o.nom, { total: groupe.length, actifs: actifs.length, budgetTotal, clients: groupe }];
    })
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Offres commerciales</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
            3 offres · {allClients.length} clients au total · {fmt(allClients.filter(c => c.statut === "Active").reduce((a, c) => a + (c.budget_mensuel || 0), 0))}/mois géré
          </p>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* Cartes offres */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "24px" }}>
            {offresConfig.map((o) => {
              const s = stats[o.nom];
              return (
                <div key={o.nom} style={{ background: "#fff", borderRadius: "12px", border: `2px solid ${o.accentColor}`, overflow: "hidden", boxShadow: o.populaire ? "0 4px 20px rgba(123,159,255,0.2)" : "none" }}>

                  <div style={{ background: o.dark ? "#1a1a2e" : "#f8f9fc", padding: "20px", textAlign: "center", borderBottom: `1px solid ${o.dark ? "#2a2a4e" : "#e5e7eb"}`, position: "relative" }}>
                    {o.populaire && (
                      <div style={{ position: "absolute", top: "10px", right: "10px", background: "#7b9fff", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "10px" }}>
                        POPULAIRE
                      </div>
                    )}
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: o.dark ? "#7b9fff" : "#888", marginBottom: "8px" }}>{o.nom}</div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: o.dark ? "#fff" : "#1a1a2e" }}>
                      {o.prix} <span style={{ fontSize: "13px", fontWeight: 400, color: o.dark ? "#aaa" : "#888" }}>{o.unite}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>{o.engagement}</div>
                  </div>

                  <div style={{ padding: "20px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Inclus :</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                      {o.inclus.map((item) => (
                        <div key={item.label} style={{ display: "flex", gap: "8px", fontSize: "13px", color: item.ok ? "#374151" : "#aaa" }}>
                          <span style={{ color: item.ok ? "#16a34a" : "#aaa" }}>{item.ok ? "✓" : "✗"}</span>
                          {item.label}
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: "10px", background: o.cibleBg, borderRadius: "6px", fontSize: "11px", color: o.cibleColor, marginBottom: "14px" }}>
                      Cible : {o.cible}
                    </div>

                    {/* Stats réelles */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: o.badgeBg, color: o.badgeColor }}>
                        {s.actifs} client{s.actifs > 1 ? "s" : ""} actif{s.actifs > 1 ? "s" : ""}
                      </span>
                      {s.budgetTotal > 0 && (
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a2e" }}>
                          {fmt(s.budgetTotal)}/mois
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clients par offre */}
          {offresConfig.map((o) => {
            const s = stats[o.nom];
            if (s.clients.length === 0) return null;
            return (
              <div key={o.nom} style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: o.badgeBg, color: o.badgeColor }}>
                      {o.nom}
                    </span>
                    <span style={{ fontSize: "13px", color: "#888" }}>{s.clients.length} client{s.clients.length > 1 ? "s" : ""}</span>
                  </div>
                  {s.budgetTotal > 0 && (
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a2e" }}>{fmt(s.budgetTotal)}/mois</span>
                  )}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      {["Client", "Secteur", "Budget mensuel", "Canaux", "Statut", "ROI"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.clients.map((c: any) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "11px 16px" }}>
                          <Link href={`/clients/${c.id}`} style={{ fontWeight: 600, color: "#1a1a2e", textDecoration: "none" }}>{c.nom}</Link>
                        </td>
                        <td style={{ padding: "11px 16px", color: "#666" }}>{c.secteur || "—"}</td>
                        <td style={{ padding: "11px 16px" }}>{fmt(c.budget_mensuel || 0)}</td>
                        <td style={{ padding: "11px 16px", color: "#666", fontSize: "12px" }}>{c.canaux?.join(" · ") || "—"}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: c.statut === "Active" ? "#dcfce7" : "#fff7ed", color: c.statut === "Active" ? "#16a34a" : "#c2410c" }}>
                            {c.statut}
                          </span>
                        </td>
                        <td style={{ padding: "11px 16px", fontWeight: 700, color: c.roi?.startsWith("×") ? "#16a34a" : "#888" }}>
                          {c.roi || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Option ANOE */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a2e", marginBottom: "4px" }}>Option bonus — Pack ANOE CONNECT + Visibilité</div>
              <div style={{ fontSize: "12px", color: "#888" }}>Visibilité guide + digital + ads · Tracking touristique · Conversion via booking</div>
            </div>
            <span style={{ background: "#fff7ed", color: "#c2410c", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, flexShrink: 0 }}>En développement</span>
          </div>

        </div>
      </main>
    </div>
  );
}
