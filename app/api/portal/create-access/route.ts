import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { logActivity } from "@/utils/logActivity";

export async function POST(request: Request) {
  const { client_id, email } = await request.json();
  if (!client_id || !email) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  // Client admin Supabase avec service role (droits admin)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const supabase = await createServerClient();

  // Vérifier que le client existe
  const { data: client } = await supabase.from("clients").select("id, nom, auth_user_id").eq("id", client_id).single();
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });

  // Si un accès existe déjà
  if (client.auth_user_id) {
    return NextResponse.json({ error: "Ce client a déjà un accès portail" }, { status: 400 });
  }

  // Inviter l'utilisateur par email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mana-media-app.vercel.app";
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
    data: {
      role: "client",
      client_id,
    },
  });

  if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 });

  // Lier l'auth_user_id au client
  await supabase.from("clients").update({
    auth_user_id: inviteData.user.id,
    contact_email: email,
  }).eq("id", client_id);

  const { data: { user: adminUser } } = await supabase.auth.getUser();
  await logActivity({
    user_email: adminUser?.email,
    action: "Accès portail créé",
    entity_type: "client",
    entity_id: client_id,
    entity_name: client.nom,
    details: `Invitation envoyée à ${email}`,
  });

  return NextResponse.json({ success: true, email });
}
