import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/utils/logActivity";

export async function POST(request: Request) {
  const body = await request.json();
  const { client_id, plateforme, type_campagne, objectif, budget_total, budget_journalier, date_debut, date_fin, statut, url_cible, notes } = body;

  if (!client_id || !plateforme || !type_campagne || !date_debut) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.from("campagnes_sociales").insert({
    client_id,
    plateforme,
    type_campagne,
    objectif: objectif || null,
    budget_total: parseFloat(budget_total) || null,
    budget_journalier: parseFloat(budget_journalier) || null,
    date_debut,
    date_fin: date_fin || null,
    statut: statut || "En préparation",
    url_cible: url_cible || null,
    notes: notes || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: client } = await supabase.from("clients").select("nom").eq("id", client_id).single();

  await logActivity({
    user_email: user?.email,
    action: "Campagne sociale créée",
    entity_type: "social",
    entity_id: data.id,
    entity_name: `${plateforme} · ${type_campagne} — ${client?.nom || ""}`,
  });

  return NextResponse.json({ success: true, campagne: data });
}
