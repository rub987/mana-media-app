import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import ZohoImportButton from "../components/ZohoImportButton";

export const revalidate = 0;

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

const avatarColors: Record<string, { bg: string; color: string }> = {
  HT: { bg: "#e8ecff", color: "#4f6ef5" },
  CA: { bg: "#fff0db", color: "#c2410c" },
  GP: { bg: "#fce7f3", color: "#be185d" },
  BF: { bg: "#dcfce7", color: "#16a34a" },
  AT: { bg: "#fef3c7", color: "#b45309" },
};

export default async function Clients() {
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur Supabase:", error.message);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Clients</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
              {clients?.length ?? 0} clients · données en direct depuis Supabase
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <ZohoImportButton />
            <a href="/nouveau-client" style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontWeight: 500, textDecoration: "none" }}>
              + Nouveau client
            </a>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {clients?.map((c) => {
              const avatar = avatarColors[c.initiales] ?? { bg: "#e8ecff", color: "#4f6ef5" };
              const offre = c.offre as string;
              return (
                <div key={c.id} style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "18px", cursor: "pointer" }}>
                  {/* En-tête */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: avatar.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", color: avatar.color, flexShrink: 0 }}>
                      {c.initiales}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>{c.nom}</div>
                      <div style={{ fontSize: "12px", color: "#888", display: "flex", alignItems: "center", gap: "6px" }}>
                        {c.secteur} ·&nbsp;
                        <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: 600, background: offreBadge[offre]?.bg, color: offreBadge[offre]?.color }}>
                          {offre}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barre progression */}
                  <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${c.progression}%`, height: "100%", borderRadius: "4px", background: c.progression === 0 ? "#f87171" : progressColor[offre] }} />
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
                      { label: "Budget/mois", value: `${(c.budget_mensuel / 1000).toFixed(0)}k F` },
                      { label: "ROI estimé", value: c.roi, highlight: c.roi?.startsWith("×") },
                      { label: "Canaux", value: String(c.canaux?.length ?? 0) },
                      { label: "Contrat", value: c.contrat },
                    ].map((stat) => (
                      <div key={stat.label} style={{ background: "#f8f9fc", borderRadius: "6px", padding: "8px 10px" }}>
                        <div style={{ fontSize: "10px", color: "#888" }}>{stat.label}</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: stat.highlight ? "#16a34a" : "#1a1a2e" }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Carte ajout */}
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
