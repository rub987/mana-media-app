import Sidebar from "../components/Sidebar";

const clients = [
  { initiales: "HT", name: "Hôtel Tahiti Nui", sector: "Tourisme", offre: "PREMIUM", budget: "850 000 F", progression: 85, roi: "×3.2", canaux: 3, contrat: "12 mois", statutColor: "#16a34a", avatarBg: "#e8ecff", avatarColor: "#4f6ef5" },
  { initiales: "CA", name: "Carrefour Arue", sector: "Retail", offre: "PERFORMANCE", budget: "320 000 F", progression: 60, roi: "×2.8", canaux: 2, contrat: "6 mois", statutColor: "#16a34a", avatarBg: "#fff0db", avatarColor: "#c2410c" },
  { initiales: "GP", name: "Gouvernement PF", sector: "Institutionnel", offre: "PREMIUM", budget: "1 200 000 F", progression: 40, roi: "N/A", canaux: 4, contrat: "12 mois", statutColor: "#16a34a", avatarBg: "#fce7f3", avatarColor: "#be185d" },
  { initiales: "BF", name: "Boutique Fleurs Moorea", sector: "Commerce local", offre: "START", budget: "45 000 F", progression: 70, roi: "×2.1", canaux: 2, contrat: "6 mois", statutColor: "#16a34a", avatarBg: "#dcfce7", avatarColor: "#16a34a" },
  { initiales: "AT", name: "Auto Tahiti", sector: "Automobile", offre: "PERFORMANCE", budget: "280 000 F", progression: 0, roi: "—", canaux: 2, contrat: "6 mois", statutColor: "#c2410c", avatarBg: "#fef3c7", avatarColor: "#b45309" },
];

const offreBadge: Record<string, { bg: string; color: string }> = {
  PREMIUM: { bg: "#f3e8ff", color: "#7c3aed" },
  PERFORMANCE: { bg: "#dbeafe", color: "#1d4ed8" },
  START: { bg: "#f3f4f6", color: "#6b7280" },
};

const progressColor: Record<string, string> = {
  PREMIUM: "#7b9fff",
  PERFORMANCE: "#fbbf24",
  START: "#34d399",
};

export default function Clients() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Clients</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>5 clients actifs · 3 prospects</p>
          </div>
          <button style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>
            + Nouveau client
          </button>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* Grille clients */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {clients.map((c) => (
              <div key={c.name} style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "18px", cursor: "pointer" }}>
                {/* En-tête */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: c.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", color: c.avatarColor, flexShrink: 0 }}>
                    {c.initiales}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>{c.name}</div>
                    <div style={{ fontSize: "12px", color: "#888", display: "flex", alignItems: "center", gap: "6px" }}>
                      {c.sector} ·&nbsp;
                      <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: offreBadge[c.offre].bg, color: offreBadge[c.offre].color }}>
                        {c.offre}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                  <div style={{ width: `${c.progression}%`, height: "100%", borderRadius: "4px", background: c.progression === 0 ? "#f87171" : progressColor[c.offre] }} />
                </div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "4px", marginBottom: "12px" }}>
                  {c.progression === 0
                    ? <span style={{ background: "#fff7ed", color: "#c2410c", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>Campagne en pause</span>
                    : `Budget utilisé : ${c.progression}%`
                  }
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "Budget/mois", value: c.budget },
                    { label: "ROI estimé", value: c.roi, highlight: c.roi.startsWith("×") },
                    { label: "Canaux", value: String(c.canaux) },
                    { label: "Contrat", value: c.contrat },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "#f8f9fc", borderRadius: "6px", padding: "8px 10px" }}>
                      <div style={{ fontSize: "10px", color: "#888" }}>{stat.label}</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: stat.highlight ? "#16a34a" : "#1a1a2e" }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Carte prospect */}
            <div style={{ background: "#fafbff", borderRadius: "10px", border: "2px dashed #e5e7eb", padding: "18px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "200px", gap: "8px" }}>
              <div style={{ fontSize: "28px" }}>+</div>
              <div style={{ fontSize: "13px", color: "#aaa", fontWeight: 500 }}>Ajouter un client</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
