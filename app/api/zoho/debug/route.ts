import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // Vérifier si les tokens existent
  const { data: tokens } = await supabase
    .from("zoho_tokens")
    .select("*")
    .eq("id", 1)
    .single();

  if (!tokens?.access_token) {
    return NextResponse.json({ error: "Pas de tokens ZOHO", tokens });
  }

  // Tester l'API ZOHO — récupérer les Comptes bruts
  const res = await fetch(
    "https://www.zohoapis.com/crm/v2/Accounts?per_page=5",
    { headers: { Authorization: `Zoho-oauthtoken ${tokens.access_token}` } }
  );

  const data = await res.json();
  return NextResponse.json({ tokens_exist: true, zoho_response: data });
}
