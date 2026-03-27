import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    scope: "ZohoCRM.modules.Accounts.READ,ZohoCRM.modules.Contacts.READ",
    client_id: process.env.ZOHO_CLIENT_ID!,
    response_type: "code",
    access_type: "offline",
    redirect_uri: process.env.ZOHO_REDIRECT_URI!,
  });

  const zohoAuthUrl = `https://accounts.zoho.com/oauth/v2/auth?${params.toString()}`;
  return NextResponse.redirect(zohoAuthUrl);
}
