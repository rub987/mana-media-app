import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

export const revalidate = 0;

type Plan = {
  id: string;
  canal: string;
  budget: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  notes: string;
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M F CFP`;
  if (n >= 1_000) return `${Math.round(n / 1000)} 000 F CFP`;
  return `${n} F CFP`;
}

function formatDate(d: string) {
  if (!d) return "—";
  const [year, month, day] = d.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const statutLabel: Record<string, string> = {
  "Planifié": "Planifié",
  "En cours": "En cours ●",
  "Terminé": "Terminé",
  "Annulé": "Annulé",
};

export default async function Rapport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: plans }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase.from("plans_media").select("*").eq("client_id", id).order("date_debut", { ascending: true }),
  ]);

  if (!client) notFound();

  const allPlans = (plans || []) as Plan[];
  const budgetPlansTotal = allPlans.reduce((acc, p) => acc + (p.budget || 0), 0);
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f6fa; }

        .page { max-width: 800px; margin: 0 auto; background: #fff; }

        /* Barre d'actions — masquée à l'impression */
        .actions {
          background: #1a1a2e;
          padding: 14px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .actions-title { color: #fff; font-size: 14px; font-weight: 600; }
        .actions-sub { color: #888; font-size: 12px; margin-top: 2px; }

        /* Contenu du rapport */
        .rapport { padding: 48px 48px 40px; }

        .header { border-bottom: 3px solid #1a1a2e; padding-bottom: 24px; margin-bottom: 32px; }
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .brand { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #888; margin-bottom: 8px; }
        .client-name { font-size: 28px; font-weight: 800; color: #1a1a2e; }
        .client-sub { font-size: 14px; color: #888; margin-top: 4px; }
        .header-right { text-align: right; }
        .offre-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; }
        .offre-PREMIUM { background: #f3e8ff; color: #7c3aed; }
        .offre-PERFORMANCE { background: #dbeafe; color: #1d4ed8; }
        .offre-START { background: #f3f4f6; color: #6b7280; }
        .report-date { font-size: 12px; color: #888; margin-top: 8px; }

        /* KPIs */
        .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .kpi { background: #f8f9fc; border-radius: 8px; padding: 16px; border-left: 3px solid #1a1a2e; }
        .kpi-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .kpi-value { font-size: 20px; font-weight: 800; color: #1a1a2e; }

        /* Section titre */
        .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #888; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }

        /* Infos */
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 32px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #888; }
        .info-value { font-weight: 600; color: #1a1a2e; }

        /* Table plans */
        .plans-section { margin-bottom: 32px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead tr { background: #f8f9fc; }
        th { text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #374151; }
        tr:last-child td { border-bottom: none; }
        .canal-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }

        /* Footer */
        .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
        .footer-brand { font-size: 13px; font-weight: 700; color: #1a1a2e; }
        .footer-sub { font-size: 11px; color: #888; }
        .footer-page { font-size: 11px; color: #aaa; }

        /* Canaux */
        .canal-chips { display: flex; flex-wrap: wrap; gap: 4px; }
        .canal-chip { padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; background: #f0f4ff; color: #4f6ef5; }

        @media print {
          .actions { display: none !important; }
          body { background: #fff; }
          .rapport { padding: 32px; }
          .page { max-width: 100%; box-shadow: none; }
        }
      `}</style>

      <div className="page">
        <div className="actions">
          <div>
            <div className="actions-title">Rapport — {client.nom}</div>
            <div className="actions-sub">Généré le {today}</div>
          </div>
          <PrintButton />
        </div>

        <div className="rapport">
          {/* En-tête */}
          <div className="header">
            <div className="header-top">
              <div>
                <div className="brand">MANA MEDIA — RAPPORT CLIENT</div>
                <div className="client-name">{client.nom}</div>
                <div className="client-sub">{client.secteur || "Secteur non renseigné"} · Contrat {client.contrat || "—"}</div>
              </div>
              <div className="header-right">
                <span className={`offre-badge offre-${client.offre}`}>{client.offre}</span>
                <div className="report-date">Rapport du {today}</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: client.statut === "Active" ? "#dcfce7" : "#fff7ed", color: client.statut === "Active" ? "#16a34a" : "#c2410c" }}>
                    {client.statut}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpis">
            {[
              { label: "Budget mensuel", value: fmt(client.budget_mensuel || 0) },
              { label: "ROI estimé", value: client.roi || "—" },
              { label: "Plans médias", value: String(allPlans.length) },
              { label: "Budget plans total", value: budgetPlansTotal > 0 ? fmt(budgetPlansTotal) : "—" },
            ].map((k) => (
              <div key={k.label} className="kpi">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">{k.value}</div>
              </div>
            ))}
          </div>

          {/* Informations */}
          <div style={{ marginBottom: "32px" }}>
            <div className="section-title">Informations client</div>
            <div className="info-grid">
              {[
                { label: "Secteur", value: client.secteur || "—" },
                { label: "Offre", value: client.offre },
                { label: "Contrat", value: client.contrat || "—" },
                { label: "Statut", value: client.statut },
                { label: "Budget mensuel", value: fmt(client.budget_mensuel || 0) },
                { label: "ROI estimé", value: client.roi || "—" },
              ].map((row) => (
                <div key={row.label} className="info-row">
                  <span className="info-label">{row.label}</span>
                  <span className="info-value">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Canaux */}
          {client.canaux && client.canaux.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <div className="section-title">Canaux actifs</div>
              <div className="canal-chips">
                {client.canaux.map((c: string) => (
                  <span key={c} className="canal-chip">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Plans médias */}
          <div className="plans-section">
            <div className="section-title">Plans médias ({allPlans.length})</div>
            {allPlans.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#aaa", padding: "16px 0" }}>Aucun plan média créé.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Canal</th>
                    <th>Budget</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Statut</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {allPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td>{plan.canal}</td>
                      <td style={{ fontWeight: 600 }}>{plan.budget ? fmt(plan.budget) : "—"}</td>
                      <td>{formatDate(plan.date_debut)}</td>
                      <td>{formatDate(plan.date_fin)}</td>
                      <td>{statutLabel[plan.statut] || plan.statut}</td>
                      <td style={{ color: "#888" }}>{plan.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="footer">
            <div>
              <div className="footer-brand">MANA MEDIA</div>
              <div className="footer-sub">Régie publicitaire — Polynésie française</div>
            </div>
            <div className="footer-page">Document confidentiel · {today}</div>
          </div>
        </div>
      </div>
    </>
  );
}
