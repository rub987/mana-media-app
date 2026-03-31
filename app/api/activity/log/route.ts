import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { user_email, role, action, entity_type, entity_id, entity_name, details } = body;

  if (!action) return NextResponse.json({ error: "Action manquante" }, { status: 400 });

  try {
    const supabase = await createClient();
    await supabase.from("activity_logs").insert({
      user_email: user_email || null,
      role: role || null,
      action,
      entity_type: entity_type || null,
      entity_id: entity_id || null,
      entity_name: entity_name || null,
      details: details || null,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur logging" }, { status: 500 });
  }
}
