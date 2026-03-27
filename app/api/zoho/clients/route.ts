import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

async function getAccessToken(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from("zoho_tokens").select("*").eq("id", 1).single();
  if (!data) return null;

  // Rafraîchir le token si besoin
  const refreshRes = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: data.refresh_token,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  const refreshed = await refreshRes.json();
  if (refreshed.access_token) {
    await supabase.from("zoho_tokens").update({
      access_token: refreshed.access_token,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    return refreshed.access_token;
  }

  return data.access_token;
}

export async function GET() {
  const supabase = await createClient();
  const accessToken = await getAccessToken(supabase);

  if (!accessToken) {
    return NextResponse.json({ error: "ZOHO non connecté" }, { status: 401 });
  }

  // Récupérer uniquement les comptes avec une offre MANA MEDIA remplie
  const res = await fetch(
    "https://www.zohoapis.com/crm/v2/Accounts/search?criteria=(Offre_REDSOYU_R_GIE_PUB:equals:START)OR(Offre_REDSOYU_R_GIE_PUB:equals:PERFORMANCE)OR(Offre_REDSOYU_R_GIE_PUB:equals:PREMIUM)&fields=Account_Name,Industry,Offre_REDSOYU_R_GIE_PUB,Budget_m_dia_mensuel,Statut_campagne,Canaux_actifs,ROI_estim&per_page=50",
    {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    }
  );

  const data = await res.json();

  if (!data.data) {
    return NextResponse.json({ clients: [] });
  }

  const clients = data.data.map((account: Record<string, unknown>) => ({
    zoho_id: account.id,
    nom: account.Account_Name,
    secteur: account.Industry ?? "",
    offre: account.Offre_REDSOYU_R_GIE_PUB ?? "",
    budget_mensuel: account.Budget_m_dia_mensuel ?? 0,
    statut: account.Statut_campagne ?? "Active",
    canaux: account.Canaux_actifs ?? [],
    roi: account.ROI_estim ?? "—",
  }));

  return NextResponse.json({ clients });
}
