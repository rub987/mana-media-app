import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const members = users
    .filter(u => u.user_metadata?.role !== "client")
    .map(u => ({
      id: u.id,
      email: u.email,
      role: (u.user_metadata?.role as string) || "admin",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      invited: !u.last_sign_in_at,
    }));

  return NextResponse.json({ admins: members });
}
