import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emplacements")
    .select("*")
    .order("commune", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ emplacements: data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emplacements")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ emplacement: data });
}

export async function PUT(request: Request) {
  const { id, ...body } = await request.json();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emplacements")
    .update(body)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ emplacement: data });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const supabase = await createClient();
  const { error } = await supabase.from("emplacements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
