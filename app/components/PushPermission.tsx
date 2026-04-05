"use client";

import { useEffect, useState } from "react";

export default function PushPermission() {
  const [status, setStatus] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission);
  }, []);

  async function requestPermission() {
    if (!("serviceWorker" in navigator)) return;

    const permission = await Notification.requestPermission();
    setStatus(permission);
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const existing = await reg.pushManager.getSubscription();
    const subscription = existing || await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
  }

  if (status === "unsupported" || status === "granted" || status === "denied") return null;

  return (
    <button
      onClick={requestPermission}
      style={{
        width: "100%",
        padding: "8px 12px",
        background: "#f0f4ff",
        border: "1px solid #c7d7fe",
        borderRadius: "8px",
        fontSize: "11px",
        color: "#4f6ef5",
        cursor: "pointer",
        fontWeight: 600,
        textAlign: "left",
        marginBottom: "8px",
      }}
    >
      🔔 Activer les notifications
    </button>
  );
}

