import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/utils/logActivity";
import { sendPlanCreatedEmail } from "@/utils/sendEmail";
import { createNotification } from "@/utils/createNotification";
import { getTestMode } from "@/utils/getTestMode";

export async function POST(request: Request) {
  const body = await request.json();
  const { client_id, canal, budget, date_debut, date_fin, statut, notes, emplacement_id } = body;

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
    emplacement_id: emplacement_id || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mettre à jour le statut de l'emplacement automatiquement
  if (emplacement_id) {
    const planStatut = statut || "Planifié";
    const newStatutEmplacement = (planStatut === "Terminé" || planStatut === "Annulé") ? "Disponible" : "Réservé";
    await supabase.from("emplacements").update({ statut: newStatutEmplacement }).eq("id", emplacement_id);
  }

  const { data: client } = await supabase.from("clients").select("nom").eq("id", client_id).single();
  // Envoyer email au client si il a un accès portail
  const { data: clientFull } = await supabase.from("clients").select("contact_email, auth_user_id").eq("id", client_id).single();
  if (clientFull?.auth_user_id && clientFull?.contact_email) {
    const testMode = await getTestMode();
    await sendPlanCreatedEmail({
      to: clientFull.contact_email,
      clientNom: client?.nom || "",
      canal,
      budget: parseInt(budget) || 0,
      dateDebut: date_debut,
      dateFin: date_fin,
      testMode,
      testEmail: testMode ? user?.email : undefined,
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

  await createNotification({
    type: "plan_created",
    title: `Plan créé — ${client?.nom || ""}`,
    body: `${canal} · ${parseInt(budget) || 0} F/mois · ${statut || "Planifié"}`,
  });

  return NextResponse.json({ success: true, plan: data });
}
