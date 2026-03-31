import { createClient } from "@/utils/supabase/server";

type NotifType = "contact" | "plan_created" | "plan_updated" | "plan_status" | "portal_access";

export async function createNotification({
  type,
  title,
  body,
}: {
  type: NotifType;
  title: string;
  body?: string;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("notifications").insert({ type, title, body });
  } catch {
    // Ne jamais bloquer si la notif échoue
  }
}
