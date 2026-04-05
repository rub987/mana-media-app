import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(cols: unknown[]): string {
  return cols.map(escapeCSV).join(",");
}

function formatDate(d: string | null): string {
  if (!d) return "";
  const [year, month, day] = d.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR");
}

function fmt(n: number | null): string {
  if (!n) return "0";
  return String(n);
}

export async function GET() {
  const supabase = await createClient();

  const [{ data: clients }, { data: plans }, { data: campagnes }] = await Promise.all([
    supabase.from("clients").select("*").order("nom"),
    supabase.from("plans_media").select("*, clients(nom)").order("date_debut", { ascending: false }),
    supabase.from("campagnes_sociales").select("*, clients(nom)").order("date_debut", { ascending: false }),
  ]);

  const lines: string[] = [];

  // === SECTION 1 : CLIENTS ===
  lines.push("CLIENTS");
  lines.push(row(["Nom", "Secteur", "Offre", "Statut", "Budget mensuel (F CFP)", "ROI estimé", "Contrat", "Canaux", "Contact", "Email", "Téléphone"]));
  for (const c of clients || []) {
    lines.push(row([
      c.nom, c.secteur, c.offre, c.statut,
      fmt(c.budget_mensuel), c.roi || "",
      c.contrat, (c.canaux || []).join(" / "),
      c.contact_nom || "", c.contact_email || "", c.contact_tel || "",
    ]));
  }

  lines.push("");

  // === SECTION 2 : PLANS MÉDIAS ===
  lines.push("PLANS MÉDIAS");
  lines.push(row(["Client", "Canal", "Budget (F CFP)", "Date début", "Date fin", "Statut", "Notes"]));
  for (const p of (plans || []) as any[]) {
    lines.push(row([
      p.clients?.nom || "", p.canal,
      fmt(p.budget), formatDate(p.date_debut), formatDate(p.date_fin),
      p.statut, p.notes || "",
    ]));
  }

  lines.push("");

  // === SECTION 3 : CAMPAGNES SOCIALES ===
  lines.push("CAMPAGNES SOCIALES & DIGITALES");
  lines.push(row(["Client", "Plateforme", "Type", "Objectif", "Budget total (F CFP)", "Budget journalier (F CFP)", "Date début", "Date fin", "Statut", "Notes"]));
  for (const c of (campagnes || []) as any[]) {
    lines.push(row([
      c.clients?.nom || "", c.plateforme, c.type_campagne || "",
      c.objectif || "", fmt(c.budget_total), fmt(c.budget_journalier),
      formatDate(c.date_debut), formatDate(c.date_fin),
      c.statut, c.notes || "",
    ]));
  }

  const csv = lines.join("\n");
  const date = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="PilotMedia-export-${date}.csv"`,
    },
  });
}
