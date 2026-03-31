"use client";

import { useEffect } from "react";

export default function AuthHashRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("access_token=")) {
      window.location.replace("/auth/set-session" + window.location.hash);
    }
  }, []);

  return null;
}
