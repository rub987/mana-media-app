import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/utils/logActivity";
import { sendPlanUpdatedEmail } from "@/utils/sendEmail";
import { createNotification } from "@/utils/createNotification";

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

  // Envoyer email au client si modifications significatives
  const { data: clientFull } = await supabase.from("clients").select("contact_email, auth_user_id").eq("id", data.client_id).single();
  if (clientFull?.auth_user_id && clientFull?.contact_email && diffs.length > 0) {
    await sendPlanUpdatedEmail({
      to: clientFull.contact_email,
      clientNom: client?.nom || "",
      canal,
      changes: diffs.join(" · "),
    }).catch(() => {});
  }

  await logActivity({
    user_email: user?.email,
    action: "Plan modifié",
    entity_type: "plan",
    entity_id: id,
    entity_name: `${canal} — ${client?.nom || ""}`,
    details: diffs.length > 0 ? diffs.join(" · ") : "Aucun changement détecté",
  });

  if (diffs.length > 0) {
    await createNotification({
      type: "plan_updated",
      title: `Plan modifié — ${client?.nom || ""}`,
      body: diffs.join(" · "),
    });
  }

  return NextResponse.json({ success: true, plan: data });
}
