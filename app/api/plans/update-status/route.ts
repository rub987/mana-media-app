import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/utils/logActivity";
import { sendPlanStatusEmail, sendCampagneStatusEmail, sendRenewalReminderEmail } from "@/utils/sendEmail";
import { createNotification } from "@/utils/createNotification";
import { getTestMode } from "@/utils/getTestMode";
import { sendWebPush } from "@/utils/sendWebPush";

async function pushToUser(supabase: any, userId: string, payload: { title: string; body: string; url?: string }) {
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, keys")
    .eq("user_id", userId);
  for (const sub of subs || []) {
    await sendWebPush({ endpoint: sub.endpoint, keys: sub.keys }, payload);
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = await createClient();
  const testMode = await getTestMode();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ─── 1. Plans médias ───────────────────────────────────────────────
  const { data: plans } = await supabase
    .from("plans_media")
    .select("id, statut, date_debut, date_fin, canal, client_id")
    .neq("statut", "Annulé");

  let plansUpdated = 0;
  const planChanges: { id: string; oldStatut: string; newStatut: string }[] = [];

  for (const plan of plans || []) {
    const debut = new Date(plan.date_debut);
    const fin = new Date(plan.date_fin);
    debut.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    let newStatut: string;
    if (today < debut) newStatut = "Planifié";
    else if (today <= fin) newStatut = "En cours";
    else newStatut = "Terminé";

    if (newStatut !== plan.statut) {
      planChanges.push({ id: plan.id, oldStatut: plan.statut, newStatut });
    }
  }

  for (const u of planChanges) {
    await supabase.from("plans_media").update({ statut: u.newStatut }).eq("id", u.id);
    plansUpdated++;

    if (!testMode && (u.newStatut === "En cours" || u.newStatut === "Terminé")) {
      const plan = (plans || []).find(p => p.id === u.id);
      if (plan) {
        const { data: clientData } = await supabase
          .from("clients")
          .select("nom, contact_email, auth_user_id")
          .eq("id", plan.client_id)
          .single();
        if (clientData?.auth_user_id && clientData?.contact_email) {
          await sendPlanStatusEmail({
            to: clientData.contact_email,
            clientNom: clientData.nom,
            canal: plan.canal,
            statut: u.newStatut,
          }).catch(() => {});
          await pushToUser(supabase, clientData.auth_user_id, {
            title: u.newStatut === "En cours" ? `Campagne ${plan.canal} lancée !` : `Campagne ${plan.canal} terminée`,
            body: u.newStatut === "En cours" ? "Votre campagne est maintenant en cours." : "Consultez votre portail pour le bilan.",
            url: "/portal",
          });
        }
      }
    }
  }

  // ─── 2. Campagnes sociales — auto-terminer si date_fin dépassée ────
  const { data: campagnes } = await supabase
    .from("campagnes_sociales")
    .select("id, statut, date_fin, plateforme, client_id")
    .eq("statut", "En ligne")
    .not("date_fin", "is", null);

  let campagnesUpdated = 0;

  for (const c of campagnes || []) {
    const fin = new Date(c.date_fin);
    fin.setHours(23, 59, 59, 999);
    if (today > fin) {
      await supabase.from("campagnes_sociales").update({ statut: "Terminé" }).eq("id", c.id);
      campagnesUpdated++;

      if (!testMode) {
        const { data: clientData } = await supabase
          .from("clients")
          .select("nom, contact_email, auth_user_id")
          .eq("id", c.client_id)
          .single();
        if (clientData?.auth_user_id && clientData?.contact_email) {
          await sendCampagneStatusEmail({
            to: clientData.contact_email,
            clientNom: clientData.nom,
            plateforme: c.plateforme,
            statut: "Terminé",
          }).catch(() => {});
          await pushToUser(supabase, clientData.auth_user_id, {
            title: `Campagne ${c.plateforme} terminée`,
            body: "Consultez votre portail pour le bilan.",
            url: "/portal",
          });
        }
      }
    }
  }

  // ─── 3. Relances renouvellement — plans se terminant dans 30 jours ─
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  const { data: plansEnCours } = await supabase
    .from("plans_media")
    .select("id, canal, date_fin, client_id")
    .eq("statut", "En cours");

  let relancesEnvoyees = 0;

  for (const plan of plansEnCours || []) {
    const fin = new Date(plan.date_fin);
    fin.setHours(0, 0, 0, 0);
    const diff = Math.round((fin.getTime() - today.getTime()) / 86400000);

    if (diff === 30) {
      const { data: clientData } = await supabase
        .from("clients")
        .select("nom, contact_email, auth_user_id")
        .eq("id", plan.client_id)
        .single();
      if (clientData?.auth_user_id && clientData?.contact_email && !testMode) {
        await sendRenewalReminderEmail({
          to: clientData.contact_email,
          clientNom: clientData.nom,
          canal: plan.canal,
          dateFin: plan.date_fin,
          joursRestants: 30,
        }).catch(() => {});
        relancesEnvoyees++;
      }
    }
  }

  // ─── Logs & notifications ───────────────────────────────────────────
  const totalUpdated = plansUpdated + campagnesUpdated;

  if (totalUpdated > 0 || relancesEnvoyees > 0) {
    const details = [
      plansUpdated > 0 && `${plansUpdated} plan(s) média mis à jour`,
      campagnesUpdated > 0 && `${campagnesUpdated} campagne(s) sociale(s) terminée(s)`,
      relancesEnvoyees > 0 && `${relancesEnvoyees} relance(s) envoyée(s)`,
    ].filter(Boolean).join(" · ");

    await logActivity({
      action: "Mise à jour automatique quotidienne",
      entity_type: "plan",
      details,
      role: "système",
    });

    if (totalUpdated > 0) {
      await createNotification({
        type: "plan_status",
        title: `Mise à jour automatique — ${totalUpdated} élément(s)`,
        body: details,
      });
    }
  }

  return NextResponse.json({
    success: true,
    plans: { total: plans?.length || 0, updated: plansUpdated, changes: planChanges.map(u => ({ id: u.id, from: u.oldStatut, to: u.newStatut })) },
    campagnes: { updated: campagnesUpdated },
    relances: { envoyees: relancesEnvoyees },
  });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return POST(request);
}
