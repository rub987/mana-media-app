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

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, nom, secteur, offre, budget_mensuel, contrat, canaux, statut, roi, progression } = body;

  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const supabase = await createClient();

  // 1. Mettre à jour Supabase
  const { data: updated, error } = await supabase
    .from("clients")
    .update({ nom, secteur, offre, budget_mensuel: parseInt(budget_mensuel) || 0, contrat, canaux, statut, roi, progression: parseInt(progression) || 0 })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2. Mettre à jour ZOHO si zoho_id existe
  const zohoId = updated?.zoho_id;
  if (zohoId) {
    const accessToken = await getZohoAccessToken(supabase);
    if (accessToken) {
      await fetch(`https://www.zohoapis.com/crm/v2/Accounts/${zohoId}`, {
        method: "PUT",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
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
    }
  }

  return NextResponse.json({ success: true, zoho_synced: !!zohoId });
}
