"use client";

import { useState, useEffect, useRef } from "react";

type Comment = {
  id: string;
  user_email: string;
  contenu: string;
  created_at: string;
};

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getInitials(email: string) {
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

export default function PlanComments({
  planId,
  planLabel,
  onClose,
  onCountChange,
  apiPath = "/api/plan-comments",
  idParam = "plan_id",
}: {
  planId: string;
  planLabel: string;
  onClose: () => void;
  onCountChange?: (planId: string, delta: number) => void;
  apiPath?: string;
  idParam?: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [contenu, setContenu] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`${apiPath}?${idParam}=${planId}`);
    const data = await res.json();
    if (data.comments) setComments(data.comments);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contenu.trim()) return;
    setSending(true);
    const res = await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [idParam]: planId, contenu }),
    });
    const data = await res.json();
    if (data.comment) {
      setComments((prev) => [...prev, data.comment]);
      setContenu("");
      onCountChange?.(planId, +1);
    }
    setSending(false);
  }

  async function handleDelete(id: string) {
    await fetch(apiPath, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setComments((prev) => prev.filter((c) => c.id !== id));
    onCountChange?.(planId, -1);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "12px", width: "480px", maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding: "16px 24px", background: "#1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Notes internes</div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{planLabel}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", fontSize: "18px", cursor: "pointer" }}>✕</button>
        </div>

        {/* Liste commentaires */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px", background: "#f9fafb" }}>
          {loading ? (
            <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "24px" }}>Chargement…</div>
          ) : comments.length === 0 ? (
            <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "32px" }}>
              Aucune note pour ce plan.<br />
              <span style={{ fontSize: "12px" }}>Ajoute une note interne ci-dessous.</span>
            </div>
          ) : comments.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg, #7b9fff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "11px", flexShrink: 0 }}>
                {getInitials(c.user_email || "?")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#1a1a2e" }}>{c.user_email?.split("@")[0]}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "10px", color: "#bbb" }}>{timeAgo(c.created_at)}</span>
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{ background: "none", border: "none", color: "#ddd", fontSize: "12px", cursor: "pointer", padding: "0", lineHeight: 1 }}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#374151", lineHeight: 1.5, border: "1px solid #e5e7eb", wordBreak: "break-word" }}>
                  {c.contenu}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <textarea
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
              placeholder="Ajouter une note… (Entrée pour envoyer)"
              rows={2}
              style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", color: "#374151", outline: "none", resize: "none", lineHeight: 1.5 }}
            />
            <button
              type="submit"
              disabled={sending || !contenu.trim()}
              style={{ padding: "0 16px", background: sending || !contenu.trim() ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: sending || !contenu.trim() ? "not-allowed" : "pointer", flexShrink: 0 }}
            >
              {sending ? "…" : "→"}
            </button>
          </div>
          <div style={{ fontSize: "10px", color: "#bbb", marginTop: "4px" }}>Visible uniquement par l'équipe</div>
        </form>
      </div>
    </div>
  );
}
