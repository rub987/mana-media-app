import Sidebar from "../components/Sidebar";

const kpis = [
  { label: "Impressions totales", value: "284k", change: "↑ +22% vs mois préc.", color: "#7b9fff" },
  { label: "Portée estimée", value: "68k", change: "↑ +14%", color: "#34d399" },
  { label: "Budget investi", value: "850k F", change: "Conforme au plan", color: "#fbbf24" },
  { label: "ROI estimé", value: "×3.2", change: "↑ vs ×2.8 objectif", color: "#34d399", highlight: true },
];

const canaux = [
  { label: "🎙 Radio", score: 88, color: "#fbbf24" },
  { label: "💻 Digital (Facebook)", score: 72, color: "#7b9fff" },
  { label: "📰 Print (La Dépêche)", score: 58, color: "#34d399" },
  { label: "📋 Affichage", score: 45, color: "#f87171" },
];

const depenses = [
  { canal: "🎙 Radio", alloue: "320 000 F", depense: "318 500 F", ecart: "-0.5%", ok: true },
  { canal: "💻 Digital", alloue: "280 000 F", depense: "275 000 F", ecart: "-1.8%", ok: true },
  { canal: "📰 Print", alloue: "150 000 F", depense: "150 000 F", ecart: "0%", ok: null },
  { canal: "📋 Affichage", alloue: "100 000 F", depense: "85 000 F", ecart: "-15%", ok: false },
];

const recommandations = [
  { type: "OPPORTUNITÉ", icon: "📈", bg: "#f0f7ff", border: "#7b9fff", textColor: "#4f6ef5", message: "Radio TNS a un créneau disponible les samedis matin — forte audience touristique. Recommandation : augmenter de 50k F/mois." },
  { type: "ALERTE", icon: "⚠️", bg: "#fff7ed", border: "#fbbf24", textColor: "#c2410c", message: "Affichage sous-performant ce mois (-15%). Envisager de rediriger 15k F vers Facebook Ads pour mai." },
  { type: "VALIDATION", icon: "✅", bg: "#f0fdf4", border: "#34d399", textColor: "#16a34a", message: "La campagne print \"Offre Été\" a généré +23% de trafic en magasin vs mois précédent. Reconduire en juin." },
];

export default function Reporting() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Reporting</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Performance par client et par canal</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <select style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151" }}>
              <option>Hôtel Tahiti Nui</option>
              <option>Carrefour Arue</option>
              <option>Boutique Fleurs Moorea</option>
            </select>
            <select style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151" }}>
              <option>Mars 2026</option>
              <option>Février 2026</option>
              <option>Janvier 2026</option>
            </select>
            <button style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff" }}>
              📥 Exporter PDF
            </button>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {kpis.map((k) => (
              <div key={k.label} style={{ background: "#fff", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: k.highlight ? "#16a34a" : "#1a1a2e", margin: "6px 0 4px" }}>{k.value}</div>
                <div style={{ fontSize: "12px", color: "#16a34a" }}>{k.change}</div>
                <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: k.color, borderRadius: "0 10px 10px 0" }} />
              </div>
            ))}
          </div>

          {/* Performance + Dépenses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

            {/* Performance par canal */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e", marginBottom: "16px" }}>Performance par canal</h4>
              {canaux.map((c) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#555", width: "160px", flexShrink: 0 }}>{c.label}</div>
                  <div style={{ flex: 1, background: "#f0f0f0", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${c.score}%`, height: "100%", borderRadius: "4px", background: c.color }} />
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a2e", width: "36px", textAlign: "right" }}>{c.score}%</div>
                </div>
              ))}
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f0f0f0" }}>
                Score = portée × engagement × conversion estimée
              </div>
            </div>

            {/* Répartition dépenses */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e", marginBottom: "16px" }}>Répartition des dépenses</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>
                    {["Canal", "Alloué", "Dépensé", "Écart"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {depenses.map((d) => (
                    <tr key={d.canal}>
                      <td style={{ padding: "10px 10px" }}>{d.canal}</td>
                      <td style={{ padding: "10px 10px" }}>{d.alloue}</td>
                      <td style={{ padding: "10px 10px" }}>{d.depense}</td>
                      <td style={{ padding: "10px 10px", fontWeight: 700, color: d.ok === true ? "#16a34a" : d.ok === false ? "#dc2626" : "#888" }}>{d.ecart}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#fafafa", fontWeight: 700 }}>
                    <td style={{ padding: "10px 10px" }}>Total</td>
                    <td style={{ padding: "10px 10px" }}>850 000 F</td>
                    <td style={{ padding: "10px 10px" }}>828 500 F</td>
                    <td style={{ padding: "10px 10px", color: "#16a34a" }}>-2.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommandations */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e", marginBottom: "16px" }}>Recommandations — Mars 2026</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {recommandations.map((r) => (
                <div key={r.type} style={{ background: r.bg, borderRadius: "8px", padding: "14px", borderLeft: `3px solid ${r.border}` }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: r.textColor, marginBottom: "6px" }}>{r.icon} {r.type}</div>
                  <div style={{ fontSize: "12px", color: "#374151", lineHeight: "1.5" }}>{r.message}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
