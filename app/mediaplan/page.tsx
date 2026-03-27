import Sidebar from "../components/Sidebar";

const semaines = ["S1\n7 avr", "S2\n14 avr", "S3\n21 avr", "S4\n28 avr", "S5\n5 mai", "S6\n12 mai", "S7\n19 mai", "S8\n26 mai"];

const plans = [
  {
    client: "HÔTEL TAHITI NUI",
    offre: "PREMIUM",
    offreBg: "#f3e8ff",
    offreColor: "#7c3aed",
    lignes: [
      { canal: "🎙 Radio", budget: "320k F", actif: [true, true, true, false, true, true, false, false], couleur: "#fbbf24" },
      { canal: "💻 Digital", budget: "280k F", actif: [true, true, true, true, true, true, true, true], couleur: "#7b9fff" },
      { canal: "📰 Print", budget: "150k F", actif: [false, true, false, false, false, true, false, false], couleur: "#34d399" },
    ],
  },
  {
    client: "CARREFOUR ARUE",
    offre: "PERFORMANCE",
    offreBg: "#dbeafe",
    offreColor: "#1d4ed8",
    lignes: [
      { canal: "🎙 Radio", budget: "160k F", actif: [false, true, true, true, false, false, true, true], couleur: "#fbbf24" },
      { canal: "📋 Affichage", budget: "80k F", actif: [true, true, false, false, true, true, false, false], couleur: "#f87171" },
    ],
  },
  {
    client: "BOUTIQUE FLEURS MOOREA",
    offre: "START",
    offreBg: "#f3f4f6",
    offreColor: "#6b7280",
    lignes: [
      { canal: "🎙 Radio", budget: "25k F", actif: [false, false, true, true, false, false, false, false], couleur: "#fbbf24" },
    ],
  },
];

const legende = [
  { label: "Radio", color: "#fbbf24" },
  { label: "Digital", color: "#7b9fff" },
  { label: "Print", color: "#34d399" },
  { label: "Affichage", color: "#f87171" },
];

export default function MediaPlan() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Plans médias</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Vue planning — T2 2026</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <select style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151" }}>
              <option>Tous les clients</option>
              <option>Hôtel Tahiti Nui</option>
              <option>Carrefour Arue</option>
              <option>Boutique Fleurs Moorea</option>
            </select>
            <button style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>
              + Nouveau plan
            </button>
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

          {/* Tableau Gantt */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Calendrier — Avril à Mai 2026</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "12px", cursor: "pointer", background: "#fff" }}>◀ Préc.</button>
                <button style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "12px", cursor: "pointer", background: "#fff" }}>Suiv. ▶</button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "700px" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={{ textAlign: "left", padding: "10px 16px", width: "180px", color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f0f0f0" }}>
                      Client / Canal
                    </th>
                    {semaines.map((s) => (
                      <th key={s} style={{ textAlign: "center", padding: "10px 6px", color: "#888", fontSize: "11px", borderBottom: "1px solid #f0f0f0", minWidth: "70px" }}>
                        {s.split("\n")[0]}<br />
                        <span style={{ fontSize: "10px", color: "#bbb" }}>{s.split("\n")[1]}</span>
                      </th>
                    ))}
                    <th style={{ textAlign: "right", padding: "10px 16px", color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f0f0f0" }}>
                      Budget
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <>
                      {/* Ligne client */}
                      <tr key={plan.client} style={{ background: "#f8f9fc" }}>
                        <td colSpan={10} style={{ padding: "8px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a2e" }}>{plan.client}</span>
                            <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: plan.offreBg, color: plan.offreColor }}>
                              {plan.offre}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Lignes canaux */}
                      {plan.lignes.map((ligne) => (
                        <tr key={`${plan.client}-${ligne.canal}`} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td style={{ padding: "10px 16px 10px 28px", color: "#555", fontSize: "12px" }}>{ligne.canal}</td>
                          {ligne.actif.map((actif, i) => (
                            <td key={i} style={{ padding: "8px 6px", textAlign: "center" }}>
                              {actif && (
                                <div style={{ height: "20px", borderRadius: "4px", background: ligne.couleur, opacity: 0.85 }} />
                              )}
                            </td>
                          ))}
                          <td style={{ padding: "10px 16px", textAlign: "right", color: "#555", fontSize: "12px", fontWeight: 500 }}>
                            {ligne.budget}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Résumé budgets */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "16px" }}>
            {plans.map((plan) => {
              const total = plan.lignes.reduce((acc, l) => {
                const val = parseInt(l.budget.replace(/[^0-9]/g, "")) * (l.budget.includes("k") ? 1000 : 1);
                return acc + val;
              }, 0);
              const jours = plan.lignes.reduce((acc, l) => acc + l.actif.filter(Boolean).length, 0);
              return (
                <div key={plan.client} style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a2e" }}>{plan.client}</div>
                    <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: plan.offreBg, color: plan.offreColor }}>
                      {plan.offre}
                    </span>
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e", marginBottom: "4px" }}>
                    {(total / 1000).toFixed(0)}k F
                  </div>
                  <div style={{ fontSize: "11px", color: "#888" }}>{plan.lignes.length} canal{plan.lignes.length > 1 ? "x" : ""} · {jours} semaines actives</div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
