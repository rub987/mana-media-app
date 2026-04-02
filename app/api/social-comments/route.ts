import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET — commentaires d'une campagne OU comptage pour plusieurs campagnes
// ?campagne_id=xxx → liste complète
// ?campagne_ids=id1,id2,... → { counts: { id1: 2, ... } }
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campagne_id = searchParams.get("campagne_id");
  const campagne_ids = searchParams.get("campagne_ids");

  const supabase = await createClient();

  if (campagne_ids) {
    const ids = campagne_ids.split(",").filter(Boolean);
    const { data, error } = await supabase
      .from("social_comments")
      .select("campagne_id")
      .in("campagne_id", ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const counts: Record<string, number> = {};
    for (const id of ids) counts[id] = 0;
    for (const row of data || []) counts[row.campagne_id] = (counts[row.campagne_id] || 0) + 1;
    return NextResponse.json({ counts });
  }

  if (!campagne_id) return NextResponse.json({ error: "campagne_id manquant" }, { status: 400 });

  const { data, error } = await supabase
    .from("social_comments")
    .select("*")
    .eq("campagne_id", campagne_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data });
}

// POST
export async function POST(request: Request) {
  const { campagne_id, contenu } = await request.json();
  if (!campagne_id || !contenu?.trim()) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("social_comments")
    .insert({ campagne_id, contenu: contenu.trim(), user_email: user?.email })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data });
}

// DELETE
export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from("social_comments").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
