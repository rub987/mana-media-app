import Sidebar from "../components/Sidebar";

const offres = [
  {
    nom: "START",
    prix: "20 000",
    unite: "F / mois",
    engagement: "Engagement minimum 6 mois",
    populaire: false,
    dark: false,
    accentColor: "#e5e7eb",
    badgeBg: "#f3f4f6",
    badgeColor: "#6b7280",
    clients: "3 clients actifs",
    cible: "Petits commerces / budgets limités",
    cibleBg: "#f0f7ff",
    cibleColor: "#4f6ef5",
    commission: null,
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
    nom: "PERFORMANCE",
    prix: "80 000 – 120 000",
    unite: "F / mois",
    engagement: "+ commission 10–15%",
    populaire: true,
    dark: true,
    accentColor: "#7b9fff",
    badgeBg: "#dbeafe",
    badgeColor: "#1d4ed8",
    clients: "5 clients actifs",
    cible: "PME, tourisme, enseignes",
    cibleBg: "#f0f7ff",
    cibleColor: "#4f6ef5",
    commission: "10–15%",
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
    nom: "PREMIUM",
    prix: "150 000+",
    unite: "F / mois",
    engagement: "+ commission sur budget média",
    populaire: false,
    dark: false,
    accentColor: "#e5e7eb",
    badgeBg: "#f3e8ff",
    badgeColor: "#7c3aed",
    clients: "4 clients actifs",
    cible: "Gros budgets, institutionnels",
    cibleBg: "#fff7ed",
    cibleColor: "#c2410c",
    commission: null,
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

export default function Offres() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Offres commerciales</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>3 offres actives · Tarifs 2026</p>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* Cartes offres */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "20px" }}>
            {offres.map((o) => (
              <div key={o.nom} style={{ background: "#fff", borderRadius: "12px", border: `2px solid ${o.accentColor}`, overflow: "hidden", boxShadow: o.populaire ? `0 4px 20px rgba(123,159,255,0.2)` : "none" }}>

                {/* En-tête */}
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
                  <div style={{ fontSize: "11px", color: o.dark ? "#888" : "#888", marginTop: "4px" }}>{o.engagement}</div>
                </div>

                {/* Corps */}
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

                  {/* Cible */}
                  <div style={{ padding: "10px", background: o.cibleBg, borderRadius: "6px", fontSize: "11px", color: o.cibleColor, marginBottom: "12px" }}>
                    Cible : {o.cible}
                  </div>

                  {/* Badge clients */}
                  <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: o.badgeBg, color: o.badgeColor }}>
                    {o.clients}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Option ANOE */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a2e", marginBottom: "4px" }}>Option bonus — Pack ANOE CONNECT + Visibilité</div>
              <div style={{ fontSize: "12px", color: "#888" }}>Visibilité guide + digital + ads · Tracking touristique · Conversion via booking</div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
              <span style={{ background: "#fff7ed", color: "#c2410c", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>En développement</span>
              <button style={{ padding: "8px 16px", border: "1px solid #1a1a2e", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff", color: "#1a1a2e", fontWeight: 500 }}>
                Voir détails
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
