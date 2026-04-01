import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET — commentaires d'un plan OU comptage pour plusieurs plans
// ?plan_id=xxx → liste complète
// ?plan_ids=id1,id2,id3 → { counts: { id1: 2, id2: 0, ... } }
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan_id = searchParams.get("plan_id");
  const plan_ids = searchParams.get("plan_ids");

  const supabase = await createClient();

  if (plan_ids) {
    const ids = plan_ids.split(",").filter(Boolean);
    const { data, error } = await supabase
      .from("plan_comments")
      .select("plan_id")
      .in("plan_id", ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const counts: Record<string, number> = {};
    for (const id of ids) counts[id] = 0;
    for (const row of data || []) counts[row.plan_id] = (counts[row.plan_id] || 0) + 1;
    return NextResponse.json({ counts });
  }

  if (!plan_id) return NextResponse.json({ error: "plan_id manquant" }, { status: 400 });

  const { data, error } = await supabase
    .from("plan_comments")
    .select("*")
    .eq("plan_id", plan_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data });
}

// POST — ajouter un commentaire
export async function POST(request: Request) {
  const { plan_id, contenu } = await request.json();
  if (!plan_id || !contenu?.trim()) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("plan_comments")
    .insert({ plan_id, contenu: contenu.trim(), user_email: user?.email })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data });
}

// DELETE — supprimer un commentaire
export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from("plan_comments").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
