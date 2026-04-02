import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/utils/logActivity";

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campagne } = await supabase
    .from("campagnes_sociales")
    .select("plateforme, type_campagne, client_id")
    .eq("id", id)
    .single();

  let clientNom = "";
  if (campagne?.client_id) {
    const { data: client } = await supabase.from("clients").select("nom").eq("id", campagne.client_id).single();
    clientNom = client?.nom || "";
  }

  const { error } = await supabase.from("campagnes_sociales").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    user_email: user?.email,
    action: "Campagne sociale supprimée",
    entity_type: "social",
    entity_id: id,
    entity_name: `${campagne?.plateforme || ""} · ${campagne?.type_campagne || ""} — ${clientNom}`,
  });

  return NextResponse.json({ success: true });
}
