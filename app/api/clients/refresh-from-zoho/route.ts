import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const supabase = await createClient();

  // Récupérer le client depuis Supabase
  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client?.zoho_id) {
    return NextResponse.json({ error: "Ce client n'est pas lié à ZOHO" }, { status: 400 });
  }

  const accessToken = await getZohoAccessToken(supabase);
  if (!accessToken) return NextResponse.json({ error: "ZOHO non connecté" }, { status: 401 });

  // Récupérer le compte ZOHO
  const accountRes = await fetch(
    `https://www.zohoapis.com/crm/v2/Accounts/${client.zoho_id}?fields=Account_Name,Industry,Offre_REDSOYU_R_GIE_PUB,Budget_m_dia_mensuel,Statut_campagne,Canaux_actifs,ROI_estim`,
    { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
  );
  const accountData = await accountRes.json();
  const account = accountData?.data?.[0];

  if (!account) return NextResponse.json({ error: "Compte introuvable dans ZOHO" }, { status: 404 });

  // Récupérer le contact ZOHO lié
  let contactUpdate = {};
  const contactRes = await fetch(
    `https://www.zohoapis.com/crm/v2/Contacts/search?criteria=(Account_Name.id:equals:${client.zoho_id})&fields=id,First_Name,Last_Name,Email,Phone`,
    { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
  );
  const contactData = await contactRes.json();
  if (contactData?.data?.[0]) {
    const c = contactData.data[0];
    const fullName = [c.First_Name, c.Last_Name].filter(Boolean).join(" ");
    contactUpdate = {
      contact_nom: fullName || null,
      contact_email: c.Email || null,
      contact_tel: c.Phone || null,
      zoho_contact_id: c.id || null,
    };
  }

  // Mettre à jour Supabase
  const updates = {
    nom: account.Account_Name || client.nom,
    secteur: account.Industry || client.secteur,
    offre: account.Offre_REDSOYU_R_GIE_PUB || client.offre,
    budget_mensuel: account.Budget_m_dia_mensuel || client.budget_mensuel,
    statut: account.Statut_campagne || client.statut,
    canaux: account.Canaux_actifs || client.canaux,
    roi: account.ROI_estim || client.roi,
    ...contactUpdate,
  };

  await supabase.from("clients").update(updates).eq("id", id);

  return NextResponse.json({ success: true, updates });
}
