import Sidebar from "../../components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PlanMediaSection from "../../components/PlanMediaSection";
import SocialSection from "../../components/SocialSection";
import RefreshFromZohoButton from "../../components/RefreshFromZohoButton";
import CreatePortalAccessButton from "../../components/CreatePortalAccessButton";
import RoiEditor from "../../components/RoiEditor";

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
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.user_metadata?.role === "community_manager") {
    const { data: assignment } = await supabase
      .from("cm_clients").select("client_id").eq("cm_user_id", user.id).eq("client_id", id).single();
    if (!assignment) redirect("/clients");
  }

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

  const { data: campagnes } = await supabase
    .from("campagnes_sociales")
    .select("*")
    .eq("client_id", id)
    .order("date_debut", { ascending: false });

  if (!client) notFound();

  const offre = client.offre as string;
  const budgetK = Math.round(client.budget_mensuel / 1000);

  // --- Reporting ---
  const allPlans = (plans || []) as any[];
  const budgetPlansTotal = allPlans.reduce((acc: number, p: any) => acc + (p.budget || 0), 0);

  // État effectif calculé depuis les dates (pas le statut stocké, sauf Annulé)
  const nowTs = Date.now();
  function planEtat(p: any): "en_cours" | "a_venir" | "termine" | "annule" {
    if (p.statut === "Annulé") return "annule";
    const debut = new Date(p.date_debut.split("T")[0]).getTime();
    const fin = new Date(p.date_fin.split("T")[0]).getTime() + 86400000;
    if (nowTs >= debut && nowTs <= fin) return "en_cours";
    if (nowTs < debut) return "a_venir";
    return "termine";
  }

  const plansEnCours = allPlans.filter((p: any) => planEtat(p) === "en_cours");
  const plansAVenir = allPlans.filter((p: any) => planEtat(p) === "a_venir");
  const plansTermines = allPlans.filter((p: any) => planEtat(p) === "termine");
  const budgetEnCours = plansEnCours.reduce((acc: number, p: any) => acc + (p.budget || 0), 0);

  const canalColor: Record<string, string> = {
    Radio: "#fbbf24", Print: "#34d399", Affichage: "#f87171", TV: "#a78bfa", Digital: "#7b9fff",
  };
  const plateformeColor: Record<string, string> = {
    "Meta": "#1877f2", "Google Ads": "#4285f4", "TikTok Ads": "#000000", "LinkedIn Ads": "#0077b5", "YouTube": "#ff0000",
  };
  const budgetParCanal: Record<string, number> = {};
  for (const p of allPlans) {
    if (p.budget && p.canal) budgetParCanal[p.canal] = (budgetParCanal[p.canal] || 0) + p.budget;
  }
  const canauxTries = Object.entries(budgetParCanal).sort((a, b) => b[1] - a[1]);
  const maxCanal = Math.max(...canauxTries.map(([, v]) => v), 1);

  // --- Campagnes sociales reporting ---
  const allCampagnes = (campagnes || []) as any[];
  const budgetCampagnesTotal = allCampagnes.reduce((acc: number, c: any) => acc + (c.budget_total || 0), 0);
  const campagnesEnLigne = allCampagnes.filter((c: any) => c.statut === "En ligne");
  const campagnesTerminees = allCampagnes.filter((c: any) => c.statut === "Terminé" || c.statut === "Annulé");
  const budgetParPlateforme: Record<string, number> = {};
  for (const c of allCampagnes) {
    if (c.budget_total && c.plateforme) budgetParPlateforme[c.plateforme] = (budgetParPlateforme[c.plateforme] || 0) + c.budget_total;
  }
  const plateformeTries = Object.entries(budgetParPlateforme).sort((a, b) => b[1] - a[1]);
  const maxPlateforme = Math.max(...plateformeTries.map(([, v]) => v), 1);

  function fmtBudget(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M F`;
    if (n >= 1_000) return `${Math.round(n / 1000)}k F`;
    return `${n} F`;
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">

        {/* Header */}
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/clients" style={{ color: "#888", textDecoration: "none", fontSize: "13px" }}>← Clients</Link>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>{client.nom}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                <span style={{ fontSize: "13px", color: "#888" }}>{client.secteur}</span>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: offreBadge[offre]?.bg, color: offreBadge[offre]?.color }}>
                  {offre}
                </span>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: client.statut === "Active" ? "#dcfce7" : client.statut === "Archivé" ? "#f3f4f6" : "#fff7ed", color: client.statut === "Active" ? "#16a34a" : client.statut === "Archivé" ? "#6b7280" : "#c2410c" }}>
                  {client.statut}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {client.zoho_id && <RefreshFromZohoButton clientId={id} />}
            <Link href={`/clients/${id}/rapport`} target="_blank" style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff", textDecoration: "none", color: "#374151" }}>
              Rapport PDF
            </Link>
            <Link href={`/clients/${id}/modifier`} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", cursor: "pointer", background: "#fff", textDecoration: "none", color: "#374151" }}>
              Modifier
            </Link>
          </div>
        </div>

        <div className="page-content">

          {/* KPIs */}
          <div className="grid-4col" style={{ marginBottom: "24px" }}>
            {[
              { label: "Budget mensuel", value: `${budgetK}k F`, sub: "Enveloppe allouée par mois", color: "#7b9fff" },
              { label: "Canaux actifs", value: String(client.canaux?.length || 0), sub: client.canaux?.join(" · ") || "Aucun canal défini", color: "#fbbf24" },
              { label: "Contrat", value: client.contrat || "—", sub: "Durée d'engagement", color: "#f87171" },
            ].map((kpi) => (
              <div key={kpi.label} style={{ background: "#fff", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.label}</div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a2e", margin: "6px 0 4px" }}>{kpi.value}</div>
                <div style={{ fontSize: "11px", color: "#aaa" }}>{kpi.sub}</div>
                <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: kpi.color, borderRadius: "0 10px 10px 0" }} />
              </div>
            ))}
            {/* ROI — éditable inline */}
            <div style={{ background: "#fff", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>ROI estimé</div>
              <RoiEditor clientId={client.id} initialRoi={client.roi || null} />
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>Revenus générés vs budget investi</div>
              <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: "#34d399", borderRadius: "0 10px 10px 0" }} />
            </div>
          </div>

          <div className="grid-2col">

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
                  { label: "Contact", value: client.contact_nom || "—" },
                  { label: "Email", value: client.contact_email ? client.contact_email : "—" },
                  { label: "Téléphone", value: client.contact_tel || "—" },
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

          {/* Accès portail */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Portail client</div>
              <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                {client.auth_user_id ? "Le client peut accéder à ses campagnes en ligne." : "Donnez accès à ce client pour qu'il suive ses campagnes."}
              </div>
            </div>
            <CreatePortalAccessButton
              clientId={id}
              contactEmail={client.contact_email || ""}
              hasAccess={!!client.auth_user_id}
            />
          </div>

          {/* Plan média */}
          <PlanMediaSection clientId={id} plans={plans || []} />

          {/* Campagnes sociales */}
          <SocialSection clientId={id} campagnes={campagnes || []} />

          {/* Reporting */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
              Reporting
            </div>

            {allPlans.length === 0 && allCampagnes.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
                Les données de reporting apparaîtront ici une fois la campagne lancée.
              </div>
            ) : (
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* KPIs plans médias */}
                {allPlans.length > 0 && (
                  <>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.5px" }}>Plans médias</div>
                    <div className="grid-4col" style={{ marginTop: "-8px" }}>
                      {[
                        { label: "En cours", value: String(plansEnCours.length), color: "#22c55e", sub: `Budget actif : ${fmtBudget(budgetEnCours)}` },
                        { label: "À venir", value: String(plansAVenir.length), color: "#7b9fff", sub: "Planifiés" },
                        { label: "Terminés", value: String(plansTermines.length), color: "#9ca3af", sub: `sur ${allPlans.length} au total` },
                        { label: "Budget total plans", value: fmtBudget(budgetPlansTotal), color: "#fbbf24", sub: `vs ${fmtBudget(client.budget_mensuel || 0)}/mois` },
                      ].map((k) => (
                        <div key={k.label} style={{ background: "#f9fafb", borderRadius: "8px", padding: "14px 16px", borderLeft: `3px solid ${k.color}` }}>
                          <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{k.label}</div>
                          <div style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e" }}>{k.value}</div>
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{k.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Budget par canal */}
                    {canauxTries.length > 0 && (
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Budget par canal</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {canauxTries.map(([canal, budget]) => (
                            <div key={canal} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100px", flexShrink: 0 }}>
                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: canalColor[canal] || "#aaa", flexShrink: 0 }} />
                                <span style={{ fontSize: "13px", color: "#374151" }}>{canal}</span>
                              </div>
                              <div style={{ flex: 1, background: "#f0f0f0", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                                <div style={{ width: `${Math.round((budget / maxCanal) * 100)}%`, height: "100%", borderRadius: "4px", background: canalColor[canal] || "#aaa" }} />
                              </div>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e", width: "70px", textAlign: "right" }}>{fmtBudget(budget)}</span>
                              <span style={{ fontSize: "11px", color: "#aaa", width: "40px", textAlign: "right" }}>{Math.round((budget / (budgetPlansTotal || 1)) * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* KPIs campagnes sociales */}
                {allCampagnes.length > 0 && (
                  <>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.5px", paddingTop: allPlans.length > 0 ? "4px" : "0", borderTop: allPlans.length > 0 ? "1px solid #f0f0f0" : "none" }}>Campagnes sociales & digitales</div>
                    <div className="grid-4col" style={{ marginTop: "-8px" }}>
                      {[
                        { label: "En ligne", value: String(campagnesEnLigne.length), color: "#22c55e", sub: "Campagnes actives" },
                        { label: "En cours / prep.", value: String(allCampagnes.filter((c: any) => c.statut === "En préparation" || c.statut === "En attente validation").length), color: "#f59e0b", sub: "En préparation ou validation" },
                        { label: "Terminées", value: String(campagnesTerminees.length), color: "#9ca3af", sub: `sur ${allCampagnes.length} au total` },
                        { label: "Budget total campagnes", value: fmtBudget(budgetCampagnesTotal), color: "#a78bfa", sub: `${allCampagnes.length} campagne${allCampagnes.length > 1 ? "s" : ""}` },
                      ].map((k) => (
                        <div key={k.label} style={{ background: "#f9fafb", borderRadius: "8px", padding: "14px 16px", borderLeft: `3px solid ${k.color}` }}>
                          <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{k.label}</div>
                          <div style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e" }}>{k.value}</div>
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{k.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Budget par plateforme */}
                    {plateformeTries.length > 0 && (
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Budget par plateforme</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {plateformeTries.map(([plateforme, budget]) => (
                            <div key={plateforme} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "120px", flexShrink: 0 }}>
                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: plateformeColor[plateforme] || "#aaa", flexShrink: 0 }} />
                                <span style={{ fontSize: "13px", color: "#374151" }}>{plateforme}</span>
                              </div>
                              <div style={{ flex: 1, background: "#f0f0f0", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                                <div style={{ width: `${Math.round((budget / maxPlateforme) * 100)}%`, height: "100%", borderRadius: "4px", background: plateformeColor[plateforme] || "#aaa" }} />
                              </div>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e", width: "70px", textAlign: "right" }}>{fmtBudget(budget)}</span>
                              <span style={{ fontSize: "11px", color: "#aaa", width: "40px", textAlign: "right" }}>{Math.round((budget / (budgetCampagnesTotal || 1)) * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
