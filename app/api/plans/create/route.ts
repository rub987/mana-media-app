import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/utils/logActivity";
import { sendPlanCreatedEmail } from "@/utils/sendEmail";

export async function POST(request: Request) {
  const body = await request.json();
  const { client_id, canal, budget, date_debut, date_fin, statut, notes } = body;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.from("plans_media").insert({
    client_id,
    canal,
    budget: parseInt(budget) || 0,
    date_debut,
    date_fin,
    statut: statut || "Planifié",
    notes: notes || "",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: client } = await supabase.from("clients").select("nom").eq("id", client_id).single();
  // Envoyer email au client si il a un accès portail
  const { data: clientFull } = await supabase.from("clients").select("contact_email, auth_user_id").eq("id", client_id).single();
  if (clientFull?.auth_user_id && clientFull?.contact_email) {
    await sendPlanCreatedEmail({
      to: clientFull.contact_email,
      clientNom: client?.nom || "",
      canal,
      budget: parseInt(budget) || 0,
      dateDebut: date_debut,
      dateFin: date_fin,
    }).catch(() => {}); // Ne jamais bloquer si l'email échoue
  }

  await logActivity({
    user_email: user?.email,
    action: "Plan créé",
    entity_type: "plan",
    entity_id: data.id,
    entity_name: `${canal} — ${client?.nom || ""}`,
    details: `Budget: ${parseInt(budget) || 0} F · ${statut || "Planifié"}`,
  });

  return NextResponse.json({ success: true, plan: data });
}
