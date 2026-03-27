import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${process.env.ZOHO_REDIRECT_URI?.replace("/api/zoho/callback", "")}/clients?error=zoho_auth_failed`
    );
  }

  // Échanger le code contre les tokens
  const tokenRes = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      redirect_uri: process.env.ZOHO_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    return NextResponse.redirect(
      `${process.env.ZOHO_REDIRECT_URI?.replace("/api/zoho/callback", "")}/clients?error=token_failed`
    );
  }

  // Sauvegarder les tokens dans Supabase
  const supabase = await createClient();
  await supabase.from("zoho_tokens").upsert({
    id: 1,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.redirect(
    `${process.env.ZOHO_REDIRECT_URI?.replace("/api/zoho/callback", "")}/clients?zoho=connected`
  );
}
