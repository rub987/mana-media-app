import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/utils/logActivity";

export async function POST(request: Request) {
  // Vérification du secret (cron Vercel ou appel manuel admin)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isAdmin = !cronSecret; // Si pas de secret configuré, on accepte (dev)

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Vérifier si c'est un admin connecté
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = await createClient();

  // Récupérer tous les plans non annulés
  const { data: plans, error } = await supabase
    .from("plans_media")
    .select("id, statut, date_debut, date_fin")
    .neq("statut", "Annulé");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let updated = 0;
  const updates: { id: string; oldStatut: string; newStatut: string }[] = [];

  for (const plan of plans || []) {
    const debut = new Date(plan.date_debut);
    const fin = new Date(plan.date_fin);
    debut.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    let newStatut: string;
    if (today < debut) {
      newStatut = "Planifié";
    } else if (today >= debut && today <= fin) {
      newStatut = "En cours";
    } else {
      newStatut = "Terminé";
    }

    if (newStatut !== plan.statut) {
      updates.push({ id: plan.id, oldStatut: plan.statut, newStatut });
    }
  }

  // Appliquer les mises à jour
  for (const u of updates) {
    await supabase.from("plans_media").update({ statut: u.newStatut }).eq("id", u.id);
    updated++;
  }

  if (updated > 0) {
    await logActivity({
      action: "Statuts plans mis à jour",
      entity_type: "plan",
      details: `${updated} plan(s) mis à jour automatiquement`,
      role: "système",
    });
  }

  return NextResponse.json({
    success: true,
    total: plans?.length || 0,
    updated,
    changes: updates.map(u => ({ id: u.id, from: u.oldStatut, to: u.newStatut })),
  });
}

// Pour le cron Vercel (GET)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  return POST(request);
}
