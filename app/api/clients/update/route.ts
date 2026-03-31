import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/utils/logActivity";

async function getZohoAccessToken(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from("zoho_tokens").select("*").eq("id", 1).single();
  if (!data?.refresh_token) return null;

  const res = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: data.refresh_token,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  const refreshed = await res.json();
  if (refreshed.access_token) {
    await supabase.from("zoho_tokens").update({
      access_token: refreshed.access_token,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    return refreshed.access_token;
  }

  return data.access_token;
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, nom, secteur, offre, budget_mensuel, contrat, canaux, statut, roi, progression, contact_nom, contact_email, contact_tel } = body;

  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Capturer l'état avant modification
  const { data: before } = await supabase.from("clients").select("*").eq("id", id).single();

  // 1. Mettre à jour Supabase
  const { data: updated, error } = await supabase
    .from("clients")
    .update({
      nom, secteur, offre,
      budget_mensuel: parseInt(budget_mensuel) || 0,
      contrat, canaux, statut, roi,
      progression: parseInt(progression) || 0,
      contact_nom: contact_nom || null,
      contact_email: contact_email || null,
      contact_tel: contact_tel || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const zohoId = updated?.zoho_id;
  const zohoContactId = updated?.zoho_contact_id;

  if (zohoId) {
    const accessToken = await getZohoAccessToken(supabase);
    if (accessToken) {
      // Mettre à jour le Compte ZOHO
      await fetch(`https://www.zohoapis.com/crm/v2/Accounts/${zohoId}`, {
        method: "PUT",
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [{
            id: zohoId,
            Account_Name: nom,
            Industry: secteur,
            Offre_REDSOYU_R_GIE_PUB: offre,
            Budget_m_dia_mensuel: parseInt(budget_mensuel) || 0,
            Statut_campagne: statut,
            Canaux_actifs: canaux || [],
            ROI_estim: roi || "",
          }],
        }),
      });

      // Mettre à jour ou créer le Contact ZOHO
      if (contact_nom) {
        const nameParts = contact_nom.trim().split(" ");
        const contactPayload = {
          Last_Name: nameParts.length >= 2 ? nameParts.slice(1).join(" ") : contact_nom,
          First_Name: nameParts.length >= 2 ? nameParts[0] : "",
          Email: contact_email || null,
          Phone: contact_tel || null,
          Account_Name: { id: zohoId },
        };

        if (zohoContactId) {
          // Mettre à jour le contact existant
          await fetch(`https://www.zohoapis.com/crm/v2/Contacts/${zohoContactId}`, {
            method: "PUT",
            headers: { Authorization: `Zoho-oauthtoken ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ data: [{ id: zohoContactId, ...contactPayload }] }),
          });
        } else {
          // Créer un nouveau contact et sauvegarder son ID
          const res = await fetch("https://www.zohoapis.com/crm/v2/Contacts", {
            method: "POST",
            headers: { Authorization: `Zoho-oauthtoken ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ data: [contactPayload] }),
          });
          const data = await res.json();
          const newContactId = data?.data?.[0]?.details?.id;
          if (newContactId) {
            await supabase.from("clients").update({ zoho_contact_id: newContactId }).eq("id", id);
          }
        }
      }
    }
  }

  // Calculer le diff
  const labels: Record<string, string> = {
    nom: "Nom", secteur: "Secteur", offre: "Offre", statut: "Statut",
    budget_mensuel: "Budget", contrat: "Contrat", roi: "ROI",
    progression: "Progression", contact_nom: "Contact", contact_email: "Email", contact_tel: "Tél",
  };
  const newValues: Record<string, unknown> = { nom, secteur, offre, statut, contrat, roi, budget_mensuel: parseInt(budget_mensuel) || 0, progression: parseInt(progression) || 0, contact_nom, contact_email, contact_tel };
  const diffs: string[] = [];
  if (before) {
    for (const key of Object.keys(labels)) {
      const oldVal = String(before[key] ?? "—");
      const newVal = String(newValues[key] ?? "—");
      if (oldVal !== newVal) diffs.push(`${labels[key]}: ${oldVal} → ${newVal}`);
    }
  }

  await logActivity({
    user_email: user?.email,
    action: "Client modifié",
    entity_type: "client",
    entity_id: id,
    entity_name: nom,
    details: diffs.length > 0 ? diffs.join(" · ") : "Aucun changement détecté",
  });

  return NextResponse.json({ success: true, zoho_synced: !!zohoId });
}
