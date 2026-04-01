import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logActivity } from "@/utils/logActivity";

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Récupérer les infos avant suppression
  const { data: plan } = await supabase.from("plans_media").select("canal, client_id, emplacement_id").eq("id", id).single();
  let clientNom = "";
  if (plan?.client_id) {
    const { data: client } = await supabase.from("clients").select("nom").eq("id", plan.client_id).single();
    clientNom = client?.nom || "";
  }

  // Libérer l'emplacement si le plan en avait un
  if (plan?.emplacement_id) {
    await supabase.from("emplacements").update({ statut: "Disponible" }).eq("id", plan.emplacement_id);
  }

  const { error } = await supabase.from("plans_media").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    user_email: user?.email,
    action: "Plan supprimé",
    entity_type: "plan",
    entity_id: id,
    entity_name: `${plan?.canal || ""} — ${clientNom}`,
  });

  return NextResponse.json({ success: true });
}
