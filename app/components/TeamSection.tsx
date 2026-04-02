"use client";

import { useState, useEffect } from "react";

type Member = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  invited: boolean;
};

type Client = { id: string; nom: string };
type Assignment = { client_id: string; clients: { id: string; nom: string } };

function getInitials(email: string) {
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function AssignModal({ cm, allClients, onClose }: { cm: Member; allClients: Client[]; onClose: () => void }) {
  const [assigned, setAssigned] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/assign-cm?cm_user_id=${cm.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.assignments) {
          setAssigned(data.assignments.map((a: Assignment) => a.client_id));
        }
      });
  }, [cm.id]);

  async function toggle(clientId: string) {
    const isAssigned = assigned.includes(clientId);
    setSaving(true);
    await fetch("/api/admin/assign-cm", {
      method: isAssigned ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cm_user_id: cm.id, client_id: clientId }),
    });
    setAssigned(prev => isAssigned ? prev.filter(id => id !== clientId) : [...prev, clientId]);
    setSaving(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "12px", width: "460px", maxHeight: "80vh", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 24px", background: "#1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>Clients assignés</h3>
            <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{cm.email}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", fontSize: "18px", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: "8px 0" }}>
          {allClients.length === 0 ? (
            <p style={{ padding: "24px", textAlign: "center", color: "#aaa", fontSize: "13px" }}>Aucun client en base.</p>
          ) : allClients.map((client) => {
            const isChecked = assigned.includes(client.id);
            return (
              <div
                key={client.id}
                onClick={() => !saving && toggle(client.id)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 24px", cursor: saving ? "not-allowed" : "pointer", borderBottom: "1px solid #f5f5f5", background: isChecked ? "#f0f4ff" : "#fff" }}
              >
                <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${isChecked ? "#7b9fff" : "#d1d5db"}`, background: isChecked ? "#7b9fff" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {isChecked && <span style={{ color: "#fff", fontSize: "11px", fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: "13px", color: "#1a1a2e", fontWeight: isChecked ? 600 : 400 }}>{client.nom}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#888" }}>{assigned.length} client{assigned.length > 1 ? "s" : ""} assigné{assigned.length > 1 ? "s" : ""}</span>
          <button onClick={onClose} style={{ padding: "8px 18px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamSection() {
  const [members, setMembers] = useState<Member[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [assigningCM, setAssigningCM] = useState<Member | null>(null);

  async function loadMembers() {
    const [membersRes, clientsRes] = await Promise.all([
      fetch("/api/admin/list").then(r => r.json()),
      fetch("/api/clients").then(r => r.json()).catch(() => ({ clients: [] })),
    ]);
    if (membersRes.admins) setMembers(membersRes.admins);
    if (clientsRes.clients) setAllClients(clientsRes.clients);
    setLoading(false);
  }

  useEffect(() => { loadMembers(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: inviteRole }),
    });
    const data = await res.json();
    setSending(false);

    if (data.error) {
      setError(data.error);
    } else {
      setSuccess(`Invitation envoyée à ${email}`);
      setEmail("");
      loadMembers();
    }
  }

  const admins = members.filter(m => m.role !== "community_manager");
  const cms = members.filter(m => m.role === "community_manager");

  const inputStyle = {
    flex: 1,
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "13px",
    outline: "none",
  };

  const selectStyle = {
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "8px 10px",
    fontSize: "13px",
    outline: "none",
    background: "#fff",
    color: "#374151",
  };

  function MemberRow({ member }: { member: Member }) {
    const isCM = member.role === "community_manager";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: isCM ? "linear-gradient(135deg, #34d399, #7b9fff)" : "linear-gradient(135deg, #7b9fff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
          {getInitials(member.email || "")}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {member.email}
          </div>
          <div style={{ fontSize: "11px", color: "#888" }}>
            {member.invited ? "Invitation en attente" : `Dernière connexion : ${member.last_sign_in_at ? formatDate(member.last_sign_in_at) : "—"}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
          {isCM && (
            <button
              onClick={() => setAssigningCM(member)}
              style={{ padding: "3px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "11px", cursor: "pointer", background: "#fff", color: "#374151" }}
            >
              Clients →
            </button>
          )}
          <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: member.invited ? "#fff7ed" : "#dcfce7", color: member.invited ? "#c2410c" : "#16a34a" }}>
            {member.invited ? "En attente" : "Actif"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {assigningCM && (
        <AssignModal
          cm={assigningCM}
          allClients={allClients}
          onClose={() => { setAssigningCM(null); loadMembers(); }}
        />
      )}

      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
          Équipe
        </div>

        {loading ? (
          <div style={{ padding: "16px 20px", fontSize: "13px", color: "#aaa" }}>Chargement…</div>
        ) : (
          <div style={{ padding: "0 20px" }}>
            {/* Admins */}
            {admins.length > 0 && (
              <>
                <div style={{ padding: "10px 0 4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#aaa", fontWeight: 700 }}>
                  Administrateurs
                </div>
                {admins.map(m => <MemberRow key={m.id} member={m} />)}
              </>
            )}

            {/* Community Managers */}
            {cms.length > 0 && (
              <>
                <div style={{ padding: "14px 0 4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#aaa", fontWeight: 700 }}>
                  Community Managers
                </div>
                {cms.map(m => <MemberRow key={m.id} member={m} />)}
              </>
            )}

            {members.length === 0 && (
              <div style={{ padding: "16px 0", fontSize: "13px", color: "#aaa" }}>Aucun membre.</div>
            )}
          </div>
        )}

        {/* Formulaire invitation */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>
            Inviter un nouveau membre
          </div>
          <form onSubmit={handleInvite} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder="email@resoyu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={selectStyle}>
              <option value="admin">Administrateur</option>
              <option value="community_manager">Community Manager</option>
            </select>
            <button
              type="submit"
              disabled={sending}
              style={{ padding: "8px 16px", background: sending ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: sending ? "not-allowed" : "pointer" }}
            >
              {sending ? "Envoi…" : "Inviter"}
            </button>
          </form>
          {success && <p style={{ fontSize: "12px", color: "#16a34a", marginTop: "8px", fontWeight: 600 }}>✓ {success}</p>}
          {error && <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "8px" }}>{error}</p>}
        </div>
      </div>
    </>
  );
}
