import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/utils/logActivity";

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, canal, budget, date_debut, date_fin, statut, notes } = body;

  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: before } = await supabase.from("plans_media").select("*").eq("id", id).single();

  const { data, error } = await supabase
    .from("plans_media")
    .update({
      canal,
      budget: parseInt(budget) || 0,
      date_debut,
      date_fin,
      statut: statut || "Planifié",
      notes: notes || "",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: client } = await supabase.from("clients").select("nom").eq("id", data.client_id).single();

  const planLabels: Record<string, string> = { canal: "Canal", budget: "Budget", date_debut: "Début", date_fin: "Fin", statut: "Statut", notes: "Notes" };
  const newVals: Record<string, unknown> = { canal, budget: parseInt(budget) || 0, date_debut, date_fin, statut, notes };
  const diffs: string[] = [];
  if (before) {
    for (const key of Object.keys(planLabels)) {
      const oldVal = String(before[key] ?? "—");
      const newVal = String(newVals[key] ?? "—");
      if (oldVal !== newVal) diffs.push(`${planLabels[key]}: ${oldVal} → ${newVal}`);
    }
  }

  await logActivity({
    user_email: user?.email,
    action: "Plan modifié",
    entity_type: "plan",
    entity_id: id,
    entity_name: `${canal} — ${client?.nom || ""}`,
    details: diffs.length > 0 ? diffs.join(" · ") : "Aucun changement détecté",
  });

  return NextResponse.json({ success: true, plan: data });
}
