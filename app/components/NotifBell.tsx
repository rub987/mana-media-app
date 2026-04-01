"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};

const typeIcon: Record<string, string> = {
  contact: "✉️",
  plan_created: "📅",
  plan_updated: "✏️",
  plan_status: "🔄",
  portal_access: "🔑",
};

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

export default function NotifBell() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.read).length;

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    if (data.notifications) setNotifs(data.notifications);
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // rafraîchit toutes les 30s
    return () => clearInterval(interval);
  }, []);

  // Fermer si clic en dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    setOpen((o) => !o);
    if (!open && unread > 0) markAllRead();
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        title="Notifications"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 20px",
          background: open ? "#2a2a4e" : "transparent",
          border: "none",
          borderLeft: open ? "3px solid #7b9fff" : "3px solid transparent",
          color: open ? "#fff" : "#aaa",
          fontSize: "13px",
          cursor: "pointer",
          textAlign: "left",
          position: "relative",
        }}
      >
        <span style={{ position: "relative" }}>
          🔔
          {unread > 0 && (
            <span style={{
              position: "absolute",
              top: "-4px",
              right: "-6px",
              background: "#ef4444",
              color: "#fff",
              borderRadius: "50%",
              fontSize: "9px",
              fontWeight: 700,
              width: "14px",
              height: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
        Notifications
      </button>

      {open && (
        <div style={{
          position: "fixed",
          left: "228px",
          bottom: "80px",
          width: "320px",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          zIndex: 999,
          overflow: "hidden",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a2e" }}>Notifications</span>
            <Link href="/notifications" onClick={() => setOpen(false)} style={{ fontSize: "11px", color: "#7b9fff", textDecoration: "none" }}>
              Tout voir →
            </Link>
          </div>

          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: "#aaa" }}>
                Aucune notification
              </div>
            ) : notifs.slice(0, 8).map((n) => (
              <div key={n.id} style={{
                padding: "12px 16px",
                borderBottom: "1px solid #f9f9f9",
                background: n.read ? "#fff" : "#f0f4ff",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>{typeIcon[n.type] || "📌"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a2e", marginBottom: "2px" }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: "11px", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.body}</div>}
                  <div style={{ fontSize: "10px", color: "#bbb", marginTop: "3px" }}>{timeAgo(n.created_at)}</div>
                  {n.type === "contact" && (() => {
                    const nom = n.title.replace("Nouveau contact — ", "");
                    const email = n.body?.split(" : ")[0] || "";
                    const message = n.body?.split(" : ").slice(1).join(" : ") || "";
                    const url = `/nouveau-client?nom=${encodeURIComponent(nom)}&email=${encodeURIComponent(email)}&message=${encodeURIComponent(message)}`;
                    return (
                      <Link href={url} onClick={() => setOpen(false)} style={{ display: "inline-block", marginTop: "6px", padding: "3px 10px", background: "#1a1a2e", color: "#fff", borderRadius: "5px", fontSize: "10px", fontWeight: 600, textDecoration: "none" }}>
                        → Créer le client
                      </Link>
                    );
                  })()}
                </div>
                {!n.read && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7b9fff", flexShrink: 0, marginTop: "5px" }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
