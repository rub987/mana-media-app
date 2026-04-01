import Sidebar from "../components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const revalidate = 0;

const typeIcon: Record<string, string> = {
  contact: "✉️",
  plan_created: "📅",
  plan_updated: "✏️",
  plan_status: "🔄",
  portal_access: "🔑",
};

const typeLabel: Record<string, string> = {
  contact: "Nouveau contact",
  plan_created: "Plan créé",
  plan_updated: "Plan modifié",
  plan_status: "Statut mis à jour",
  portal_access: "Accès portail",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLeadUrl(title: string, body: string | null): string {
  const nom = title.replace("Nouveau contact — ", "");
  const email = body?.split(" : ")[0] || "";
  const message = body?.split(" : ").slice(1).join(" : ") || "";
  return `/nouveau-client?nom=${encodeURIComponent(nom)}&email=${encodeURIComponent(email)}&message=${encodeURIComponent(message)}`;
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: notifs } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const unreadCount = (notifs || []).filter((n) => !n.read).length;

  // Marquer tout comme lu
  if (unreadCount > 0) {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
  }

  const grouped: Record<string, typeof notifs> = {};
  for (const n of notifs || []) {
    const day = new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    if (!grouped[day]) grouped[day] = [];
    grouped[day]!.push(n);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        <div style={{ background: "#fff", padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Notifications</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
              {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Tout est à jour"}
            </p>
          </div>
        </div>

        <div style={{ padding: "24px 28px", maxWidth: "720px" }}>
          {!notifs || notifs.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "48px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
              Aucune notification pour l'instant
            </div>
          ) : Object.entries(grouped).map(([day, items]) => (
            <div key={day} style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#888", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "10px" }}>
                {day}
              </div>
              <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                {items!.map((n, i) => (
                  <div key={n.id} style={{
                    display: "flex",
                    gap: "14px",
                    padding: "14px 20px",
                    borderBottom: i < items!.length - 1 ? "1px solid #f5f5f5" : "none",
                    background: n.read ? "#fff" : "#f0f4ff",
                    alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#f5f6fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}>
                      {typeIcon[n.type] || "📌"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "11px", fontWeight: 600, color: "#7b9fff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {typeLabel[n.type] || n.type}
                          </span>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e", marginTop: "2px" }}>{n.title}</div>
                          {n.body && <div style={{ fontSize: "12px", color: "#888", marginTop: "3px", lineHeight: 1.5 }}>{n.body}</div>}
                          {n.type === "contact" && (
                            <Link href={getLeadUrl(n.title, n.body)} style={{ display: "inline-block", marginTop: "8px", padding: "4px 12px", background: "#1a1a2e", color: "#fff", borderRadius: "6px", fontSize: "11px", fontWeight: 600, textDecoration: "none" }}>
                              → Créer le client
                            </Link>
                          )}
                        </div>
                        <div style={{ fontSize: "11px", color: "#bbb", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {new Date(n.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
