import { createClient } from "@/utils/supabase/server";

export async function getTestMode(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("test_mode").eq("id", 1).single();
  return !!data?.test_mode;
}
