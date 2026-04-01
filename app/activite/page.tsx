import Sidebar from "../components/Sidebar";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

const actionColor: Record<string, { bg: string; color: string; dot: string }> = {
  "Connexion admin":       { bg: "#f0f4ff", color: "#4f6ef5", dot: "#4f6ef5" },
  "Connexion portail client": { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
  "Client créé":           { bg: "#fef9c3", color: "#92400e", dot: "#f59e0b" },
  "Client modifié":        { bg: "#fff7ed", color: "#c2410c", dot: "#f97316" },
  "Plan créé":             { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  "Plan modifié":          { bg: "#f0f4ff", color: "#1d4ed8", dot: "#7b9fff" },
  "Plan supprimé":         { bg: "#fef2f2", color: "#dc2626", dot: "#f87171" },
  "Accès portail créé":    { bg: "#faf5ff", color: "#7c3aed", dot: "#a78bfa" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getInitials(email?: string) {
  if (!email) return "?";
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

export default async function ActivitePage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const allLogs = logs || [];

  // Stats
  const today = new Date().toDateString();
  const logsToday = allLogs.filter(l => new Date(l.created_at).toDateString() === today).length;
  const connexions = allLogs.filter(l => l.action.startsWith("Connexion")).length;
  const modifications = allLogs.filter(l => l.action.includes("modifié") || l.action.includes("créé") || l.action.includes("supprimé")).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">

        {/* Header */}
        <div className="page-header">
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Journal d'activité</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Toutes les actions effectuées sur l'application</p>
        </div>

        <div className="page-content">

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {[
              { label: "Actions aujourd'hui", value: String(logsToday), color: "#7b9fff" },
              { label: "Connexions totales", value: String(connexions), color: "#34d399" },
              { label: "Modifications", value: String(modifications), color: "#fbbf24" },
            ].map((k) => (
              <div key={k.label} style={{ background: "#fff", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#1a1a2e", margin: "6px 0 0" }}>{k.value}</div>
                <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: k.color, borderRadius: "0 10px 10px 0" }} />
              </div>
            ))}
          </div>

          {/* Liste des logs */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Événements récents</span>
              <span style={{ fontSize: "12px", color: "#888" }}>{allLogs.length} entrées</span>
            </div>

            {allLogs.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>
                Aucune activité enregistrée pour l'instant.
              </div>
            ) : (
              <div>
                {allLogs.map((log, i) => {
                  const style = actionColor[log.action] || { bg: "#f9fafb", color: "#374151", dot: "#9ca3af" };
                  return (
                    <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 20px", borderBottom: i < allLogs.length - 1 ? "1px solid #f5f5f5" : "none" }}>

                      {/* Avatar */}
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: style.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 700, color: style.color }}>
                        {getInitials(log.user_email)}
                      </div>

                      {/* Contenu */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: style.bg, color: style.color }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: style.dot }} />
                            {log.action}
                          </span>
                          {log.entity_name && (
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a2e" }}>{log.entity_name}</span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "12px", color: "#888" }}>
                          <span>{log.user_email || "—"}</span>
                          {log.role && <span style={{ color: "#bbb" }}>·</span>}
                          {log.role && <span>{log.role}</span>}
                          {log.details && <span style={{ color: "#bbb" }}>·</span>}
                          {log.details && <span>{log.details}</span>}
                        </div>
                      </div>

                      {/* Date */}
                      <div style={{ fontSize: "11px", color: "#bbb", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {formatDate(log.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
