"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "380px", padding: "0 20px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", letterSpacing: "2px" }}>MANA MEDIA</div>
          <div style={{ fontSize: "11px", color: "#7b9fff", letterSpacing: "3px", marginTop: "4px" }}>PILOTAGE MÉDIA</div>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a2e", marginBottom: "6px" }}>Connexion</h2>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>Accès réservé à l'équipe MANA MEDIA</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "6px", padding: "10px 12px", fontSize: "13px", color: "#374151", outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "6px", padding: "10px 12px", fontSize: "13px", color: "#374151", outline: "none" }}
              />
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "10px 12px", fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "#9ca3af" : "#1a1a2e", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#555" }}>
          © 2026 MANA MEDIA · REDSOYU
        </div>
      </div>
    </div>
  );
}
