import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { client_id, canal, budget, date_debut, date_fin, statut, notes } = body;

  const supabase = await createClient();

  const { data, error } = await supabase.from("plans_media").insert({
    client_id,
    canal,
    budget: parseInt(budget) || 0,
    date_debut,
    date_fin,
    statut: statut || "Planifié",
    notes: notes || "",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, plan: data });
}
