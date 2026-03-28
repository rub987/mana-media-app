import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, canal, budget, date_debut, date_fin, statut, notes } = body;

  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans_media")
    .update({
      canal,
      budget: parseInt(budget) || 0,
      date_debut,
      date_fin,
      statut: statut || "Planifié",
      notes: notes || "",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, plan: data });
}
