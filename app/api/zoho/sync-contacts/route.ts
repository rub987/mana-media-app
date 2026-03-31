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

export async function POST() {
  const supabase = await createClient();
  const accessToken = await getZohoAccessToken(supabase);

  if (!accessToken) {
    return NextResponse.json({ error: "ZOHO non connecté" }, { status: 401 });
  }

  // Récupérer tous les clients Supabase qui ont un zoho_id
  const { data: clients } = await supabase
    .from("clients")
    .select("id, zoho_id, contact_nom, contact_email, contact_tel, zoho_contact_id")
    .not("zoho_id", "is", null);

  if (!clients || clients.length === 0) {
    return NextResponse.json({ synced: 0, message: "Aucun client avec zoho_id" });
  }

  let synced = 0;

  for (const client of clients) {
    // Passer les clients qui ont déjà leurs infos contact complètes
    if (client.contact_nom && client.contact_email) continue;

    // Récupérer les contacts ZOHO liés à ce compte
    const res = await fetch(
      `https://www.zohoapis.com/crm/v2/Contacts/search?criteria=(Account_Name.id:equals:${client.zoho_id})&fields=id,First_Name,Last_Name,Email,Phone`,
      { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
    );

    const data = await res.json();
    if (!data.data || data.data.length === 0) continue;

    const contact = data.data[0];
    const firstName = contact.First_Name || "";
    const lastName = contact.Last_Name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    await supabase.from("clients").update({
      contact_nom: fullName || null,
      contact_email: contact.Email || null,
      contact_tel: contact.Phone || null,
      zoho_contact_id: contact.id || null,
    }).eq("id", client.id);

    synced++;
  }

  return NextResponse.json({ synced, total: clients.length });
}
