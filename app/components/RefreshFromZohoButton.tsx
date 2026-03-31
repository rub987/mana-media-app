"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshFromZohoButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  async function handleRefresh() {
    setLoading(true);
    setStatus("idle");

    const res = await fetch("/api/clients/refresh-from-zoho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clientId }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setStatus("error");
    } else {
      setStatus("ok");
      router.refresh();
    }

    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      title="Récupérer les dernières données depuis ZOHO CRM"
      style={{
        padding: "8px 16px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "13px",
        cursor: loading ? "not-allowed" : "pointer",
        background: status === "ok" ? "#dcfce7" : status === "error" ? "#fee2e2" : "#fff",
        color: status === "ok" ? "#16a34a" : status === "error" ? "#dc2626" : "#374151",
        fontWeight: 500,
        transition: "all 0.2s",
      }}
    >
      {loading ? "Sync…" : status === "ok" ? "✓ À jour" : status === "error" ? "Erreur ZOHO" : "↻ Sync ZOHO"}
    </button>
  );
}
