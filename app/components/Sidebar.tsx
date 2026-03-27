"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Clients", href: "/clients", icon: "👥" },
  { label: "Plans médias", href: "/mediaplan", icon: "📅" },
  { label: "Reporting", href: "/reporting", icon: "📈" },
];

const adminItems = [
  { label: "Offres & Tarifs", href: "/offres", icon: "📦" },
  { label: "Paramètres", href: "/parametres", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

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
          PILOTAGE MÉDIA
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
      <div style={{ margin: "0 12px 12px", padding: "10px 12px", background: "#2a2a4e", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", background: "#7b9fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
          AL
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#fff", fontWeight: 600 }}>Amandine Launois</div>
          <div style={{ fontSize: "10px", color: "#888" }}>Directrice MANA MEDIA</div>
        </div>
      </div>
    </aside>
  );
}
