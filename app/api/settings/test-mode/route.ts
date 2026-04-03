import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role === "client") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data } = await supabase.from("app_settings").select("test_mode").eq("id", 1).single();
  return NextResponse.json({ test_mode: !!data?.test_mode });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role === "client") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { test_mode } = await request.json();

  const { error } = await supabase
    .from("app_settings")
    .upsert({ id: 1, test_mode: !!test_mode });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, test_mode: !!test_mode });
}
