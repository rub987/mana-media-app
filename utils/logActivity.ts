import { createClient } from "@/utils/supabase/server";

export async function logActivity({
  user_email,
  role,
  action,
  entity_type,
  entity_id,
  entity_name,
  details,
}: {
  user_email?: string;
  role?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  entity_name?: string;
  details?: string;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("activity_logs").insert({
      user_email: user_email || null,
      role: role || "admin",
      action,
      entity_type: entity_type || null,
      entity_id: entity_id || null,
      entity_name: entity_name || null,
      details: details || null,
    });
  } catch {
    // Ne jamais bloquer une action à cause du logging
  }
}
