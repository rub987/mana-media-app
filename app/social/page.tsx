import Sidebar from "../components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { PLATEFORME_COLOR, PLATEFORME_ICON, STATUT_COLOR } from "../components/SocialSection";
import SocialPageClient from "../components/SocialPageClient";

export const revalidate = 0;

type CampagneWithClient = {
  id: string;
  client_id: string;
  plateforme: string;
  type_campagne: string;
  objectif: string | null;
  budget_total: number | null;
  budget_journalier: number | null;
  date_debut: string;
  date_fin: string | null;
  statut: string;
  url_cible: string | null;
  notes: string | null;
  clients: { nom: string; offre: string };
};

export default async function SocialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isCM = user?.user_metadata?.role === "community_manager";

  let campagnes: CampagneWithClient[] = [];

  if (isCM && user) {
    const { data: assignments } = await supabase
      .from("cm_clients")
      .select("client_id")
      .eq("cm_user_id", user.id);

    const clientIds = (assignments || []).map((a) => a.client_id);

    if (clientIds.length > 0) {
      const { data } = await supabase
        .from("campagnes_sociales")
        .select("*, clients(nom, offre)")
        .in("client_id", clientIds)
        .order("date_debut", { ascending: false });
      campagnes = (data || []) as CampagneWithClient[];
    }
  } else {
    const { data } = await supabase
      .from("campagnes_sociales")
      .select("*, clients(nom, offre)")
      .order("date_debut", { ascending: false });
    campagnes = (data || []) as CampagneWithClient[];
  }

  // Stats
  const enLigne = campagnes.filter(c => c.statut === "En ligne").length;
  const enPrep = campagnes.filter(c => c.statut === "En préparation" || c.statut === "En attente validation").length;
  const budgetTotal = campagnes.reduce((acc, c) => acc + (c.budget_total || 0), 0);

  function fmtBudget(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M F`;
    if (n >= 1_000) return `${Math.round(n / 1000)}k F`;
    return `${n} F`;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Campagnes sociales & digitales</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
              {campagnes.length} campagne{campagnes.length > 1 ? "s" : ""} · {enLigne} en ligne
            </p>
          </div>
        </div>

        <div className="page-content">

          {/* KPIs */}
          <div className="grid-3col" style={{ marginBottom: "24px" }}>
            {[
              { label: "Campagnes en ligne", value: String(enLigne), color: "#22c55e" },
              { label: "En préparation", value: String(enPrep), color: "#fbbf24" },
              { label: "Budget total", value: fmtBudget(budgetTotal), color: "#7b9fff" },
            ].map((k) => (
              <div key={k.label} style={{ background: "#fff", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#1a1a2e", margin: "6px 0 0" }}>{k.value}</div>
                <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: k.color, borderRadius: "0 10px 10px 0" }} />
              </div>
            ))}
          </div>

          <SocialPageClient
            campagnes={campagnes}
            plateformeColor={PLATEFORME_COLOR}
            plateformeIcon={PLATEFORME_ICON}
            statutColor={STATUT_COLOR}
          />

        </div>
      </main>
    </div>
  );
}
