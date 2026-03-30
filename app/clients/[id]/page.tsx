import Sidebar from "../../components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import PlanMediaSection from "../../components/PlanMediaSection";

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

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  const { data: plans } = await supabase
    .from("plans_media")
    .select("*")
    .eq("client_id", id)
    .order("date_debut", { ascending: true });

  if (!client) notFound();

  const offre = client.offre as string;
  const budgetK = Math.round(client.budget_mensuel / 1000);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/clients" style={{ color: "#888", textDecoration: "none", fontSize: "13px" }}>← Clients</Link>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>{client.nom}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                <span style={{ fontSize: "13px", color: "#888" }}>{client.secteur}</span>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: offreBadge[offre]?.bg, color: offreBadge[offre]?.color }}>
                  {offre}
                </span>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: client.statut === "Active" ? "#dcfce7" : "#fff7ed", color: client.statut === "Active" ? "#16a34a" : "#c2410c" }}>
                  {client.statut}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href={`/clients/${id}/rapport`} target="_blank" style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff", textDecoration: "none", color: "#374151" }}>
              Rapport PDF
            </Link>
            <Link href={`/clients/${id}/modifier`} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff", textDecoration: "none", color: "#374151" }}>
              Modifier
            </Link>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {[
              { label: "Budget mensuel", value: `${budgetK}k F`, color: "#7b9fff" },
              { label: "ROI estimé", value: client.roi || "—", color: "#34d399", highlight: client.roi?.startsWith("×") },
              { label: "Canaux actifs", value: String(client.canaux?.length || 0), color: "#fbbf24" },
              { label: "Contrat", value: client.contrat || "—", color: "#f87171" },
            ].map((kpi) => (
              <div key={kpi.label} style={{ background: "#fff", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.label}</div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: kpi.highlight ? "#16a34a" : "#1a1a2e", margin: "6px 0 0" }}>{kpi.value}</div>
                <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: kpi.color, borderRadius: "0 10px 10px 0" }} />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

            {/* Informations */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                Informations
              </div>
              <div style={{ padding: "16px 20px" }}>
                {[
                  { label: "Nom", value: client.nom },
                  { label: "Secteur", value: client.secteur || "—" },
                  { label: "Offre", value: offre },
                  { label: "Contrat", value: client.contrat || "—" },
                  { label: "Statut", value: client.statut },
                  { label: "Client depuis", value: new Date(client.created_at).toLocaleDateString("fr-FR") },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: "13px" }}>
                    <span style={{ color: "#888" }}>{row.label}</span>
                    <span style={{ fontWeight: 500, color: "#1a1a2e" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget & Canaux */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                  Budget
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#1a1a2e", marginBottom: "8px" }}>
                    {budgetK}k <span style={{ fontSize: "14px", fontWeight: 400, color: "#888" }}>F CFP / mois</span>
                  </div>
                  <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "8px", overflow: "hidden", marginBottom: "6px" }}>
                    <div style={{ width: `${client.progression || 0}%`, height: "100%", borderRadius: "4px", background: progressColor[offre] || "#7b9fff" }} />
                  </div>
                  <div style={{ fontSize: "12px", color: "#888" }}>Budget utilisé : {client.progression || 0}%</div>
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                  Canaux actifs
                </div>
                <div style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {client.canaux && client.canaux.length > 0
                    ? client.canaux.map((canal: string) => (
                        <span key={canal} style={{ background: "#f0f4ff", color: "#4f6ef5", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                          {canal}
                        </span>
                      ))
                    : <span style={{ fontSize: "13px", color: "#aaa" }}>Aucun canal défini</span>
                  }
                </div>
              </div>

            </div>
          </div>

          {/* Plan média */}
          <PlanMediaSection clientId={id} plans={plans || []} />

          {/* Reporting placeholder */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
              Reporting
            </div>
            <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
              Les données de reporting apparaîtront ici une fois la campagne lancée.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
