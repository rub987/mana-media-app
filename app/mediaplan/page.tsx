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

export default async function MediaPlan() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isCM = user?.user_metadata?.role === "community_manager";

  let allPlans: PlanWithClient[] = [];

  if (isCM && user) {
    const { data: assignments } = await supabase
      .from("cm_clients")
      .select("client_id")
      .eq("cm_user_id", user.id);

    const clientIds = (assignments || []).map((a) => a.client_id);

    if (clientIds.length > 0) {
      const { data: plans } = await supabase
        .from("plans_media")
        .select("*, clients(nom, offre)")
        .in("client_id", clientIds)
        .order("date_debut", { ascending: true });
      allPlans = (plans || []) as PlanWithClient[];
    }
  } else {
    const { data: plans } = await supabase
      .from("plans_media")
      .select("*, clients(nom, offre)")
      .order("date_debut", { ascending: true });
    allPlans = (plans || []) as PlanWithClient[];
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Plans médias</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Vue Gantt — {allPlans.length} plan{allPlans.length > 1 ? "s" : ""} actif{allPlans.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="page-content">
          <GanttClient plans={allPlans} />
        </div>
      </main>
    </div>
  );
}
