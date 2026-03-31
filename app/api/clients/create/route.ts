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

export async function POST(request: Request) {
  const body = await request.json();
  const { nom, secteur, offre, budget_mensuel, canaux, contrat, contact_nom, contact_email, contact_tel, notes } = body;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const mots = nom.trim().split(" ");
  const initiales = mots.length >= 2
    ? (mots[0][0] + mots[1][0]).toUpperCase()
    : nom.substring(0, 2).toUpperCase();

  // 1. Créer dans Supabase
  const { data: newClient, error } = await supabase.from("clients").insert({
    nom,
    secteur,
    offre,
    budget_mensuel: parseInt(budget_mensuel) || 0,
    canaux: canaux || [],
    statut: "Active",
    roi: "—",
    contrat,
    initiales,
    progression: 0,
    contact_nom: contact_nom || null,
    contact_email: contact_email || null,
    contact_tel: contact_tel || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2. Créer dans ZOHO
  const accessToken = await getZohoAccessToken(supabase);
  if (accessToken) {
    // Créer le Compte ZOHO
    const zohoAccountRes = await fetch("https://www.zohoapis.com/crm/v2/Accounts", {
      method: "POST",
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{
          Account_Name: nom,
          Industry: secteur,
          Offre_REDSOYU_R_GIE_PUB: offre,
          Budget_m_dia_mensuel: parseInt(budget_mensuel) || 0,
          Statut_campagne: "Active",
          Canaux_actifs: canaux || [],
          Description: notes || "",
        }],
      }),
    });
    const zohoAccountData = await zohoAccountRes.json();
    const zohoId = zohoAccountData?.data?.[0]?.details?.id;

    let zohoContactId = null;

    // Créer le Contact ZOHO si un contact est renseigné
    if (zohoId && contact_nom) {
      const nameParts = contact_nom.trim().split(" ");
      const zohoContactRes = await fetch("https://www.zohoapis.com/crm/v2/Contacts", {
        method: "POST",
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [{
            Last_Name: nameParts.length >= 2 ? nameParts.slice(1).join(" ") : contact_nom,
            First_Name: nameParts.length >= 2 ? nameParts[0] : "",
            Email: contact_email || null,
            Phone: contact_tel || null,
            Account_Name: { id: zohoId },
          }],
        }),
      });
      const zohoContactData = await zohoContactRes.json();
      zohoContactId = zohoContactData?.data?.[0]?.details?.id || null;
    }

    if (zohoId) {
      await supabase.from("clients").update({
        zoho_id: zohoId,
        zoho_contact_id: zohoContactId,
      }).eq("id", newClient.id);
    }
  }

  await logActivity({
    user_email: user?.email,
    action: "Client créé",
    entity_type: "client",
    entity_id: newClient.id,
    entity_name: nom,
    details: `Offre: ${offre} · Secteur: ${secteur}`,
  });

  return NextResponse.json({ success: true, client: newClient });
}
