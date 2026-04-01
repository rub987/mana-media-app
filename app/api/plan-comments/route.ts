import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET — commentaires d'un plan
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan_id = searchParams.get("plan_id");
  if (!plan_id) return NextResponse.json({ error: "plan_id manquant" }, { status: 400 });

  const supabase = await createClient();
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
