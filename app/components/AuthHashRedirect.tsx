"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthHashRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.includes("access_token=")) return;

    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.setSession({ access_token, refresh_token }).then(async ({ data: { session } }) => {
      if (session) {
        const role = session.user.user_metadata?.role;
        await fetch("/api/activity/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: session.user.email,
            role: role || "client",
            action: "Connexion portail client",
          }),
        });
        window.location.replace(role === "client" ? "/portal" : "/dashboard");
      }
    });
  }, []);

  return null;
}
