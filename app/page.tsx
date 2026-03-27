import Sidebar from "./components/Sidebar";

const kpis = [
  { label: "Clients actifs", value: "12", change: "↑ +2 ce mois", up: true, color: "#7b9fff" },
  { label: "Budget géré / mois", value: "4.2M F", change: "↑ +18% vs N-1", up: true, color: "#34d399" },
  { label: "Revenus agence", value: "680k F", change: "↑ +12% vs N-1", up: true, color: "#fbbf24" },
  { label: "Campagnes en cours", value: "8", change: "5 actives · 3 en pause", up: false, color: "#f87171" },
];

const clients = [
  { name: "Hôtel Tahiti Nui", sector: "Tourisme", offre: "PREMIUM", budget: "850 000 F", canaux: "Radio · Digital · Print", statut: "Active", roi: "×3.2" },
  { name: "Carrefour Arue", sector: "Retail", offre: "PERFORMANCE", budget: "320 000 F", canaux: "Radio · Affichage", statut: "Active", roi: "×2.8" },
  { name: "Auto Tahiti", sector: "Automobile", offre: "PERFORMANCE", budget: "280 000 F", canaux: "Radio · Digital", statut: "En pause", roi: "—" },
  { name: "Boutique Fleurs Moorea", sector: "Commerce local", offre: "START", budget: "45 000 F", canaux: "Facebook · Radio", statut: "Active", roi: "×2.1" },
  { name: "Gouvernement PF", sector: "Institutionnel", offre: "PREMIUM", budget: "1 200 000 F", canaux: "Radio · TV · Print · Digital", statut: "Active", roi: "N/A" },
];

const offreBadge: Record<string, { bg: string; color: string }> = {
  PREMIUM: { bg: "#f3e8ff", color: "#7c3aed" },
  PERFORMANCE: { bg: "#dbeafe", color: "#1d4ed8" },
  START: { bg: "#f3f4f6", color: "#6b7280" },
};

const statutBadge: Record<string, { bg: string; color: string }> = {
  Active: { bg: "#dcfce7", color: "#16a34a" },
  "En pause": { bg: "#fff7ed", color: "#c2410c" },
};

export default function Dashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Tableau de bord</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Mars 2026 — Vue globale portefeuille clients</p>
          </div>
          <button style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>
            + Nouvelle campagne
          </button>
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

          {/* Clients table */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Clients actifs — Aperçu rapide</h3>
              <a href="/clients" style={{ fontSize: "13px", color: "#7b9fff", textDecoration: "none" }}>Voir tous →</a>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Client", "Offre", "Budget média / mois", "Canaux actifs", "Statut", "ROI estimé"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.name} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: "11px", color: "#888" }}>{c.sector}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: offreBadge[c.offre].bg, color: offreBadge[c.offre].color }}>
                        {c.offre}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>{c.budget}</td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{c.canaux}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: statutBadge[c.statut].bg, color: statutBadge[c.statut].color }}>
                        {c.statut}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: c.roi.startsWith("×") ? "#16a34a" : "#888" }}>{c.roi}</td>
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
