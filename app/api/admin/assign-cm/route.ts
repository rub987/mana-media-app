import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET — clients assignés à un CM
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cm_user_id = searchParams.get("cm_user_id");
  if (!cm_user_id) return NextResponse.json({ error: "cm_user_id requis" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cm_clients")
    .select("client_id, clients(id, nom)")
    .eq("cm_user_id", cm_user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assignments: data });
}

// POST — assigner un client à un CM
export async function POST(request: Request) {
  const { cm_user_id, client_id } = await request.json();
  if (!cm_user_id || !client_id) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from("cm_clients")
    .upsert({ cm_user_id, client_id }, { onConflict: "cm_user_id,client_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — désassigner un client d'un CM
export async function DELETE(request: Request) {
  const { cm_user_id, client_id } = await request.json();
  if (!cm_user_id || !client_id) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from("cm_clients")
    .delete()
    .eq("cm_user_id", cm_user_id)
    .eq("client_id", client_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
