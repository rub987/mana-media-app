import Sidebar from "../components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import SyncContactsButton from "../components/SyncContactsButton";
import SyncStatusButton from "../components/SyncStatusButton";
import TeamSection from "../components/TeamSection";

export const revalidate = 0;

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function Parametres() {
  const supabase = await createClient();

  const [{ data: { user } }, { data: zohoToken }, { data: clients }, { data: plans }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("zoho_tokens").select("*").eq("id", 1).single(),
    supabase.from("clients").select("id"),
    supabase.from("plans_media").select("id"),
  ]);

  const zohoConnected = !!zohoToken?.refresh_token;
  const zohoUpdatedAt = zohoToken?.updated_at;

  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f5f5f5", fontSize: "13px" }}>
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ fontWeight: 500, color: "#1a1a2e" }}>{value}</span>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        <div className="page-header">
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Paramètres</h1>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>Compte, intégrations et informations agence</p>
        </div>

        <div className="page-content" style={{ maxWidth: "720px" }}>

          {/* Compte */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
              Compte
            </div>
            <div style={{ padding: "4px 20px 8px" }}>
              {row("Email", user?.email || "—")}
              {row("Rôle", "Administrateur")}
              {row("Connecté depuis", user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : "—")}
              {row("ID utilisateur", <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#888" }}>{user?.id?.slice(0, 16)}…</span>)}
            </div>
          </div>

          {/* ZOHO CRM */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Intégration ZOHO CRM</span>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: zohoConnected ? "#dcfce7" : "#fee2e2", color: zohoConnected ? "#16a34a" : "#dc2626" }}>
                {zohoConnected ? "Connecté" : "Non connecté"}
              </span>
            </div>
            <div style={{ padding: "4px 20px 8px" }}>
              {row("Statut", zohoConnected ? "Token actif" : "Authentification requise")}
              {row("Dernière sync", zohoUpdatedAt ? formatDate(zohoUpdatedAt) : "—")}
              {row("Clients en base", String(clients?.length ?? 0))}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Link
                href="/api/zoho/auth"
                style={{ padding: "8px 16px", background: "#1a1a2e", color: "#fff", borderRadius: "6px", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}
              >
                {zohoConnected ? "Re-authentifier ZOHO" : "Connecter ZOHO CRM"}
              </Link>
              {zohoConnected && (
                <Link
                  href="/clients"
                  style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", textDecoration: "none", background: "#fff" }}
                >
                  Importer les clients →
                </Link>
              )}
            </div>
            {zohoConnected && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                  Importe les contacts ZOHO existants vers les fiches clients de l'app
                </div>
                <SyncContactsButton />
              </div>
            )}
          </div>

          <TeamSection />

          {/* Statuts des plans */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
              Statuts des plans médias
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "12px" }}>
                Met à jour automatiquement les statuts selon les dates (Planifié → En cours → Terminé). Exécuté chaque nuit à minuit.
              </div>
              <SyncStatusButton />
            </div>
          </div>

          {/* Base de données */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
              Base de données
            </div>
            <div style={{ padding: "4px 20px 8px" }}>
              {row("Clients", String(clients?.length ?? 0))}
              {row("Plans médias", String(plans?.length ?? 0))}
              {row("Hébergement", "Supabase (PostgreSQL)")}
              {row("Région", "ap-southeast-1 (Singapour)")}
            </div>
          </div>

          {/* Agence */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>
              Agence
            </div>
            <div style={{ padding: "4px 20px 8px" }}>
              {row("Nom", "PilotMedia")}
              {row("Entité", "RESOYU")}
              {row("Territoire", "Polynésie française")}
              {row("Application", "PilotMedia v1.0")}
              {row("Déployé sur", "Vercel")}
            </div>
          </div>

          {/* Danger zone */}
          <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #fecaca", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #fee2e2", fontSize: "14px", fontWeight: 600, color: "#dc2626" }}>
              Zone sensible
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
                Ces actions sont irréversibles. À utiliser avec précaution.
              </div>
              <Link
                href="/login"
                style={{ display: "inline-block", padding: "8px 16px", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "13px", color: "#dc2626", textDecoration: "none", background: "#fff" }}
              >
                Se déconnecter
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
