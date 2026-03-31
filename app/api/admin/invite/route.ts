import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { logActivity } from "@/utils/logActivity";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  // Vérifier que l'appelant est un admin connecté
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mana-media-app.vercel.app";

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
    data: { role: "admin" },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    user_email: user.email,
    action: "Admin invité",
    entity_type: "admin",
    entity_name: email,
    details: `Invitation envoyée par ${user.email}`,
  });

  return NextResponse.json({ success: true, userId: data.user.id });
}
