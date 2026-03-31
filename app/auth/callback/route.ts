import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code).then(async () => {
      return supabase.auth.getUser();
    });
    const role = user?.user_metadata?.role;
    return NextResponse.redirect(`${origin}${role === "client" ? "/portal" : "/dashboard"}`);
  }

  return NextResponse.redirect(`${origin}/`);
}
