"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Clients", href: "/clients", icon: "👥" },
  { label: "Plans médias", href: "/mediaplan", icon: "📅" },
  { label: "Reporting", href: "/reporting", icon: "📈" },
];

const adminItems = [
  { label: "Offres & Tarifs", href: "/offres", icon: "📦" },
  { label: "Paramètres", href: "/parametres", icon: "⚙️" },
];

function getInitials(email: string, displayName?: string): string {
  if (displayName) {
    const mots = displayName.trim().split(" ");
    return mots.length >= 2
      ? (mots[0][0] + mots[1][0]).toUpperCase()
      : displayName.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function getDisplayName(email: string, metadata?: Record<string, string>): string {
  if (metadata?.full_name) return metadata.full_name;
  if (metadata?.name) return metadata.name;
  // Utilise la partie avant le @ comme nom
  return email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRole(email: string): string {
  if (email.includes("admin") || email.includes("direction")) return "Administrateur";
  return "MANA MEDIA";
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [initials, setInitials] = useState<string>("…");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        const email = user.email;
        const meta = user.user_metadata as Record<string, string> | undefined;
        const name = getDisplayName(email, meta);
        setUserEmail(email);
        setDisplayName(name);
        setInitials(getInitials(email, meta?.full_name || meta?.name));
      }
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside style={{
      width: "220px",
      minHeight: "100vh",
      background: "#1a1a2e",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px", borderBottom: "1px solid #2a2a4e" }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", letterSpacing: "1px" }}>
          MANA MEDIA
        </div>
        <div style={{ fontSize: "10px", color: "#888", letterSpacing: "2px", marginTop: "2px" }}>
          PILOTAGE REDSOYU
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 0", flex: 1 }}>
        <div style={{ padding: "8px 20px 4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#555" }}>
          Navigation
        </div>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            color: pathname === item.href ? "#fff" : "#aaa",
            textDecoration: "none",
            fontSize: "13px",
            background: pathname === item.href ? "#2a2a4e" : "transparent",
            borderLeft: pathname === item.href ? "3px solid #7b9fff" : "3px solid transparent",
          }}>
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div style={{ padding: "16px 20px 4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#555" }}>
          Admin
        </div>
        {adminItems.map((item) => (
          <Link key={item.href} href={item.href} style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            color: pathname === item.href ? "#fff" : "#aaa",
            textDecoration: "none",
            fontSize: "13px",
            background: pathname === item.href ? "#2a2a4e" : "transparent",
            borderLeft: pathname === item.href ? "3px solid #7b9fff" : "3px solid transparent",
          }}>
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User block */}
      <div style={{ margin: "0 12px 4px", padding: "10px 12px", background: "#2a2a4e", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "32px", height: "32px",
          background: "linear-gradient(135deg, #7b9fff, #a78bfa)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: "12px",
          flexShrink: 0,
          letterSpacing: "0.5px",
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "12px", color: "#fff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayName || "…"}
          </div>
          <div style={{ fontSize: "10px", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {userEmail || "…"}
          </div>
        </div>
      </div>
      <button onClick={handleLogout} style={{ margin: "0 12px 12px", padding: "8px 12px", background: "transparent", border: "1px solid #2a2a4e", borderRadius: "8px", color: "#666", fontSize: "12px", cursor: "pointer", textAlign: "left" }}>
        🚪 Déconnexion
      </button>
    </aside>
  );
}
