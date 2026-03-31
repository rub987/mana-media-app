import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET — liste des notifications (50 dernières)
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data });
}

// PATCH — marquer tout comme lu
export async function PATCH() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
