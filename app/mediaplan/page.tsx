import Sidebar from "../components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import GanttClient from "../components/GanttClient";

export const revalidate = 0;

type PlanWithClient = {
  id: string;
  canal: string;
  budget: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  notes: string;
  client_id: string;
  clients: { nom: string; offre: string };
};

type CampagneWithClient = {
  id: string;
  plateforme: string;
  type_campagne: string;
  objectif: string;
  budget_total: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  client_id: string;
  clients: { nom: string; offre: string };
};

export default async function MediaPlan() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isCM = user?.user_metadata?.role === "community_manager";

  let allPlans: PlanWithClient[] = [];
  let allCampagnes: CampagneWithClient[] = [];

  if (isCM && user) {
    const { data: assignments } = await supabase
      .from("cm_clients")
      .select("client_id")
      .eq("cm_user_id", user.id);

    const clientIds = (assignments || []).map((a) => a.client_id);

    if (clientIds.length > 0) {
      const [{ data: plans }, { data: campagnes }] = await Promise.all([
        supabase.from("plans_media").select("*, clients(nom, offre)").in("client_id", clientIds).order("date_debut", { ascending: true }),
        supabase.from("campagnes_sociales").select("*, clients(nom, offre)").in("client_id", clientIds).order("date_debut", { ascending: true }),
      ]);
      allPlans = (plans || []) as PlanWithClient[];
      allCampagnes = (campagnes || []) as CampagneWithClient[];
    }
  } else {
    const [{ data: plans }, { data: campagnes }] = await Promise.all([
      supabase.from("plans_media").select("*, clients(nom, offre)").order("date_debut", { ascending: true }),
      supabase.from("campagnes_sociales").select("*, clients(nom, offre)").order("date_debut", { ascending: true }),
    ]);
    allPlans = (plans || []) as PlanWithClient[];
    allCampagnes = (campagnes || []) as CampagneWithClient[];
  }

  const totalItems = allPlans.length + allCampagnes.length;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Plans médias & Campagnes</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Vue Gantt — {allPlans.length} plan{allPlans.length > 1 ? "s" : ""} · {allCampagnes.length} campagne{allCampagnes.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="page-content">
          <GanttClient plans={allPlans} campagnes={allCampagnes} />
        </div>
      </main>
    </div>
  );
}
