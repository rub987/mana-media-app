import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const revalidate = 0;

const canalColor: Record<string, string> = {
  Radio: "#fbbf24",
  Digital: "#7b9fff",
  Print: "#34d399",
  Affichage: "#f87171",
  TV: "#a78bfa",
};

const statutColor: Record<string, { bg: string; color: string }> = {
  "Planifié": { bg: "#dbeafe", color: "#1d4ed8" },
  "En cours": { bg: "#dcfce7", color: "#16a34a" },
  "Terminé": { bg: "#f3f4f6", color: "#6b7280" },
  "Annulé": { bg: "#fee2e2", color: "#dc2626" },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M F CFP`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k F CFP`;
  return `${n} F CFP`;
}

function parseDate(d: string) {
  const [year, month, day] = d.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(d: string) {
  if (!d) return "—";
  return parseDate(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(d: string) {
  if (!d) return "—";
  return parseDate(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function planProgress(dateDebut: string, dateFin: string): number {
  const start = parseDate(dateDebut).getTime();
  const end = parseDate(dateFin).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

function daysLeft(dateFin: string): number {
  const end = parseDate(dateFin);
  end.setHours(23, 59, 59);
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
}

function daysUntil(dateDebut: string): number {
  const start = parseDate(dateDebut);
  start.setHours(0, 0, 0);
  return Math.max(0, Math.ceil((start.getTime() - Date.now()) / 86400000));
}

export default async function Portal() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const clientId = user.user_metadata?.client_id;
  if (!clientId) redirect("/dashboard");

  const [{ data: client }, { data: plans }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).single(),
    supabase.from("plans_media").select("*").eq("client_id", clientId).order("date_debut", { ascending: true }),
  ]);

  if (!client) redirect("/login");

  const allPlans = plans || [];
  const plansEnCours = allPlans.filter(p => p.statut === "En cours");
  const plansTermines = allPlans.filter(p => p.statut === "Terminé");
  const plansPlanifies = allPlans.filter(p => p.statut === "Planifié");
  const budgetPlans = allPlans.reduce((acc, p) => acc + (p.budget || 0), 0);

  // Budget par canal
  const budgetParCanal: Record<string, number> = {};
  for (const plan of allPlans) {
    if (plan.canal && plan.budget) {
      budgetParCanal[plan.canal] = (budgetParCanal[plan.canal] || 0) + plan.budget;
    }
  }
  const budgetTotal = Object.values(budgetParCanal).reduce((a, b) => a + b, 0);

  // Budget par mois (basé sur date_debut)
  const budgetParMois: Record<string, number> = {};
  for (const plan of allPlans) {
    if (!plan.budget || !plan.date_debut) continue;
    const d = parseDate(plan.date_debut);
    const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    budgetParMois[key] = (budgetParMois[key] || 0) + plan.budget;
  }
  const moisTries = Object.entries(budgetParMois).slice(-6); // 6 derniers mois
  const maxMois = Math.max(...moisTries.map(([, v]) => v), 1);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#1a1a2e", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#fff", letterSpacing: "1px" }}>MANA MEDIA</span>
          <span style={{ fontSize: "10px", color: "#555", letterSpacing: "2px" }}>PORTAIL CLIENT</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: "#888" }}>{client.nom}</span>
          <form action="/auth/signout" method="post">
            <button style={{ padding: "6px 14px", background: "transparent", border: "1px solid #2a2a4e", borderRadius: "6px", color: "#666", fontSize: "12px", cursor: "pointer" }}>
              Déconnexion
            </button>
          </form>
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: "960px", margin: "0 auto" }}>

        {/* Bienvenue */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a2e" }}>Bonjour 👋</h1>
          <p style={{ fontSize: "14px", color: "#888", marginTop: "4px" }}>
            Voici le suivi de vos campagnes médias — {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid-4col" style={{ marginBottom: "24px" }}>
          {[
            { label: "Offre", value: client.offre, color: "#7b9fff" },
            { label: "Budget mensuel", value: fmt(client.budget_mensuel || 0), color: "#34d399" },
            { label: "Plans en cours", value: String(plansEnCours.length), color: "#fbbf24" },
            { label: "ROI estimé", value: client.roi || "—", color: "#a78bfa", highlight: client.roi?.startsWith("×") },
          ].map((k) => (
            <div key={k.label} style={{ background: "#fff", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: k.highlight ? "#16a34a" : "#1a1a2e", margin: "6px 0 0" }}>{k.value}</div>
              <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: k.color, borderRadius: "0 10px 10px 0" }} />
            </div>
          ))}
        </div>

        {/* Plans EN COURS — avancement */}
        {plansEnCours.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
              Campagnes en cours
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {plansEnCours.map((plan) => {
                const pct = planProgress(plan.date_debut, plan.date_fin);
                const reste = daysLeft(plan.date_fin);
                return (
                  <div key={plan.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: canalColor[plan.canal] || "#aaa", flexShrink: 0, display: "inline-block" }} />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e" }}>{plan.canal}</span>
                        {plan.budget && <span style={{ fontSize: "12px", color: "#888" }}>· {fmt(plan.budget)}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "11px", color: "#888" }}>
                          {formatDateShort(plan.date_debut)} → {formatDateShort(plan.date_fin)}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: reste <= 7 ? "#c2410c" : "#16a34a" }}>
                          {reste === 0 ? "Termine aujourd'hui" : `${reste} j restants`}
                        </span>
                      </div>
                    </div>
                    <div style={{ background: "#f0f0f0", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`,
                        height: "100%",
                        borderRadius: "6px",
                        background: `linear-gradient(90deg, ${canalColor[plan.canal] || "#7b9fff"}, ${canalColor[plan.canal] || "#a78bfa"})`,
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#bbb", marginTop: "3px" }}>
                      <span>Début</span>
                      <span style={{ color: "#888", fontWeight: 600 }}>{pct}% écoulé</span>
                      <span>Fin</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plans À VENIR */}
        {plansPlanifies.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1d4ed8", display: "inline-block" }} />
              À venir
            </div>
            <div style={{ padding: "8px 20px 12px" }}>
              {plansPlanifies.map((plan) => {
                const j = daysUntil(plan.date_debut);
                return (
                  <div key={plan.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: canalColor[plan.canal] || "#aaa", flexShrink: 0, display: "inline-block" }} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a2e" }}>{plan.canal}</span>
                      {plan.budget && <span style={{ fontSize: "12px", color: "#888" }}>· {fmt(plan.budget)}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "12px", color: "#888" }}>{formatDateShort(plan.date_debut)} → {formatDateShort(plan.date_fin)}</span>
                      <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: j <= 3 ? "#fff7ed" : "#dbeafe", color: j <= 3 ? "#c2410c" : "#1d4ed8" }}>
                        {j === 0 ? "Démarre aujourd'hui" : j === 1 ? "Démarre demain" : `dans ${j} j`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reporting — Budget par canal + Budget par mois */}
        {allPlans.length > 0 && (
          <div className="grid-2col">

            {/* Budget par canal */}
            {budgetTotal > 0 && (
              <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                  Budget engagé par canal
                </div>
                <div style={{ padding: "16px 20px" }}>
                  {Object.entries(budgetParCanal).sort((a, b) => b[1] - a[1]).map(([canal, budget]) => (
                    <div key={canal} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500, color: "#1a1a2e" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: canalColor[canal] || "#aaa", display: "inline-block" }} />
                          {canal}
                        </span>
                        <span style={{ color: "#888" }}>{fmt(budget)} <span style={{ color: "#bbb" }}>({Math.round((budget / budgetTotal) * 100)}%)</span></span>
                      </div>
                      <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((budget / budgetTotal) * 100)}%`, height: "100%", borderRadius: "4px", background: canalColor[canal] || "#7b9fff" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#888" }}>Total engagé</span>
                    <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{fmt(budgetTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Budget par mois */}
            {moisTries.length > 0 && (
              <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                  Budget par période
                </div>
                <div style={{ padding: "20px", display: "flex", alignItems: "flex-end", gap: "10px", height: "160px" }}>
                  {moisTries.map(([mois, budget]) => (
                    <div key={mois} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "9px", color: "#888", fontWeight: 600 }}>{fmt(budget).replace(" F CFP", "")}</span>
                      <div style={{
                        width: "100%",
                        height: `${Math.round((budget / maxMois) * 100)}%`,
                        minHeight: "4px",
                        borderRadius: "4px 4px 0 0",
                        background: "linear-gradient(180deg, #7b9fff, #a78bfa)",
                      }} />
                      <span style={{ fontSize: "9px", color: "#aaa", textAlign: "center", lineHeight: 1.2 }}>{mois}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Infos entreprise + Contact agence */}
        <div className="grid-2col">

          {/* Fiche entreprise */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
              Votre entreprise
            </div>
            <div style={{ padding: "8px 20px 12px" }}>
              {[
                { label: "Raison sociale", value: client.nom },
                { label: "Secteur", value: client.secteur || "—" },
                { label: "Offre souscrite", value: client.offre },
                { label: "Contrat", value: client.contrat || "—" },
                { label: "Statut", value: client.statut },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: "13px" }}>
                  <span style={{ color: "#888" }}>{row.label}</span>
                  <span style={{ fontWeight: 500, color: "#1a1a2e" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact agence */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
              Votre contact MANA MEDIA
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #7b9fff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>
                  M
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>MANA MEDIA</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>Régie publicitaire RESOYU</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: "13px" }}>
                <span style={{ color: "#888" }}>Territoire</span>
                <span style={{ fontWeight: 500, color: "#1a1a2e" }}>Polynésie française</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: "13px" }}>
                <span style={{ color: "#888" }}>Email</span>
                <a href="mailto:info@redsoyu.com" style={{ fontWeight: 500, color: "#7b9fff", textDecoration: "none" }}>info@redsoyu.com</a>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "13px" }}>
                <span style={{ color: "#888" }}>Téléphone</span>
                <a href="tel:+68940856072" style={{ fontWeight: 500, color: "#7b9fff", textDecoration: "none" }}>(+689) 40 85 60 72</a>
              </div>
            </div>
          </div>
        </div>

        {/* Budget utilisé */}
        <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Budget utilisé ce mois</span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#1a1a2e" }}>{client.progression || 0}%</span>
          </div>
          <div style={{ background: "#f0f0f0", borderRadius: "6px", height: "10px", overflow: "hidden" }}>
            <div style={{ width: `${client.progression || 0}%`, height: "100%", borderRadius: "6px", background: "linear-gradient(90deg, #7b9fff, #a78bfa)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888", marginTop: "6px" }}>
            <span>0 F</span>
            <span>{fmt(client.budget_mensuel || 0)} / mois</span>
          </div>
        </div>

        {/* Tous les plans */}
        {allPlans.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
                Tous vos plans <span style={{ fontSize: "12px", color: "#888", fontWeight: 400 }}>({allPlans.length})</span>
              </h3>
              {budgetPlans > 0 && <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a2e" }}>{fmt(budgetPlans)} engagé</span>}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Canal", "Budget", "Début", "Fin", "Statut", "Notes"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPlans.map((plan) => (
                  <tr key={plan.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: canalColor[plan.canal] || "#aaa", flexShrink: 0, display: "inline-block" }} />
                        <span style={{ fontWeight: 500 }}>{plan.canal}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>{plan.budget ? fmt(plan.budget) : "—"}</td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{formatDate(plan.date_debut)}</td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{formatDate(plan.date_fin)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: statutColor[plan.statut]?.bg, color: statutColor[plan.statut]?.color }}>
                        {plan.statut}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#888" }}>{plan.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "12px", color: "#aaa", paddingTop: "16px" }}>
          MANA MEDIA · Régie publicitaire RESOYU · Polynésie française
        </div>

      </div>
    </div>
  );
}
