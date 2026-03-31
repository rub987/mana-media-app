import Link from "next/link";
import AuthHashRedirect from "./components/AuthHashRedirect";
import { createClient } from "@/utils/supabase/server";
import ContactForm from "./components/ContactForm";

const offres = [
  {
    nom: "START",
    prix: "20 000",
    badgeBg: "#f3f4f6",
    badgeColor: "#6b7280",
    cible: "Petits commerces & budgets limités",
    dark: false,
    populaire: false,
    inclus: [
      "Diagnostic rapide (1 échange)",
      "Plan média simplifié (2 canaux)",
      "Accès tarifs négociés",
      "Suivi mensuel léger",
    ],
  },
  {
    nom: "PERFORMANCE",
    prix: "80 000 – 120 000",
    badgeBg: "#dbeafe",
    badgeColor: "#1d4ed8",
    cible: "PME, tourisme & enseignes",
    dark: true,
    populaire: true,
    inclus: [
      "Stratégie média complète",
      "Gestion multi-supports",
      "Optimisation mensuelle",
      "Reporting clair & régulier",
      "Réservation & coordination médias",
    ],
  },
  {
    nom: "PREMIUM",
    prix: "150 000+",
    badgeBg: "#f3e8ff",
    badgeColor: "#7c3aed",
    cible: "Gros budgets & institutionnels",
    dark: false,
    populaire: false,
    inclus: [
      "Stratégie annuelle complète",
      "Achat média optimisé",
      "Négociation exclusive médias",
      "Dashboard + analyse ROI",
      "Directeur marketing externalisé",
    ],
  },
];

const avantages = [
  { icon: "🎯", titre: "Expertise locale", desc: "Connaissance approfondie des médias polynésiens — Radio 1, TNTV, La Dépêche, affichage urbain." },
  { icon: "📊", titre: "Pilotage en temps réel", desc: "Tableau de bord dédié pour suivre vos campagnes, budgets et ROI à tout moment." },
  { icon: "🤝", titre: "Interlocuteur unique", desc: "Un seul contact pour tous vos supports. Vous gagnez du temps, nous gérons la complexité." },
  { icon: "📈", titre: "Résultats mesurés", desc: "Chaque campagne est suivie et optimisée. Nous vous montrons ce qui fonctionne." },
];

const canaux = ["Radio", "Digital", "Print", "Affichage", "Télévision"];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user && user.user_metadata?.role !== "client";

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#fff", color: "#1a1a2e" }}>
      <AuthHashRedirect />

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e5e7eb", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        <div>
          <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "1px", color: "#1a1a2e" }}>MANA MEDIA</span>
          <span style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginLeft: "10px" }}>PILOTAGE REDSOYU</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <a href="#offres" style={{ padding: "8px 14px", fontSize: "13px", color: "#555", textDecoration: "none" }}>Offres</a>
          <a href="#contact" style={{ padding: "8px 14px", fontSize: "13px", color: "#555", textDecoration: "none" }}>Contact</a>
          {isAdmin ? (
            <Link href="/dashboard" style={{ padding: "8px 18px", background: "#1a1a2e", color: "#fff", borderRadius: "6px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
              Backoffice →
            </Link>
          ) : (
            <Link href="/login" style={{ padding: "8px 18px", background: "#1a1a2e", color: "#fff", borderRadius: "6px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
              Accès client →
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 60%, #1a1a2e 100%)", padding: "96px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(123,159,255,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(167,139,250,0.1) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 14px", background: "rgba(123,159,255,0.2)", borderRadius: "20px", fontSize: "12px", fontWeight: 600, color: "#7b9fff", letterSpacing: "1px", marginBottom: "24px" }}>
            RÉGIE PUBLICITAIRE — POLYNÉSIE FRANÇAISE
          </div>
          <h1 style={{ fontSize: "52px", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "20px", letterSpacing: "-0.5px" }}>
            Votre stratégie média,<br />
            <span style={{ background: "linear-gradient(90deg, #7b9fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>pilotée par des experts</span>
          </h1>
          <p style={{ fontSize: "18px", color: "#aaa", lineHeight: 1.6, marginBottom: "36px", maxWidth: "560px", margin: "0 auto 36px" }}>
            MANA MEDIA gère vos campagnes publicitaires sur tous les supports locaux. Radio, digital, print, affichage — un seul interlocuteur, des résultats mesurés.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <a href="#offres" style={{ padding: "14px 28px", background: "#7b9fff", color: "#fff", borderRadius: "8px", fontSize: "15px", fontWeight: 700, textDecoration: "none" }}>
              Découvrir nos offres
            </a>
            <a href="#contact" style={{ padding: "14px 28px", background: "rgba(255,255,255,0.08)", color: "#fff", borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" }}>
              Nous contacter
            </a>
          </div>
        </div>

        {/* Canaux */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "56px", flexWrap: "wrap" }}>
          {canaux.map((c) => (
            <span key={c} style={{ padding: "6px 16px", background: "rgba(255,255,255,0.06)", borderRadius: "20px", fontSize: "12px", color: "#888", border: "1px solid rgba(255,255,255,0.08)" }}>
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* AVANTAGES */}
      <section style={{ padding: "80px 48px", background: "#f5f6fa" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, textAlign: "center", marginBottom: "8px" }}>Pourquoi MANA MEDIA ?</h2>
          <p style={{ textAlign: "center", color: "#888", fontSize: "15px", marginBottom: "48px" }}>La seule régie pub locale qui pilote vos campagnes de A à Z</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {avantages.map((a) => (
              <div key={a.titre} style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{a.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>{a.titre}</div>
                <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFRES */}
      <section id="offres" style={{ padding: "80px 48px", background: "#fff" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, textAlign: "center", marginBottom: "8px" }}>Nos offres</h2>
          <p style={{ textAlign: "center", color: "#888", fontSize: "15px", marginBottom: "48px" }}>Choisissez le niveau d'accompagnement adapté à votre activité</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {offres.map((o) => (
              <div key={o.nom} style={{ borderRadius: "14px", border: o.dark ? "2px solid #7b9fff" : "1px solid #e5e7eb", overflow: "hidden", boxShadow: o.dark ? "0 8px 32px rgba(123,159,255,0.2)" : "none", position: "relative" }}>
                {o.populaire && (
                  <div style={{ position: "absolute", top: "16px", right: "16px", background: "#7b9fff", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "10px", letterSpacing: "0.5px" }}>
                    POPULAIRE
                  </div>
                )}
                <div style={{ background: o.dark ? "#1a1a2e" : "#f8f9fc", padding: "28px 24px", textAlign: "center", borderBottom: `1px solid ${o.dark ? "#2a2a4e" : "#e5e7eb"}` }}>
                  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, background: o.badgeBg, color: o.badgeColor, marginBottom: "12px" }}>
                    {o.nom}
                  </span>
                  <div style={{ fontSize: "30px", fontWeight: 800, color: o.dark ? "#fff" : "#1a1a2e" }}>
                    {o.prix} <span style={{ fontSize: "13px", fontWeight: 400, color: o.dark ? "#aaa" : "#888" }}>F / mois</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>{o.cible}</div>
                </div>
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {o.inclus.map((item) => (
                      <div key={item} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#374151", alignItems: "flex-start" }}>
                        <span style={{ color: "#16a34a", flexShrink: 0, marginTop: "1px" }}>✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <a href="#contact" style={{ display: "block", marginTop: "24px", padding: "11px", background: o.dark ? "#7b9fff" : "#1a1a2e", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                    Demander un devis →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "80px 48px", background: "#f5f6fa" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>Parlons de votre projet</h2>
          <p style={{ color: "#888", fontSize: "15px", marginBottom: "40px" }}>Contactez-nous pour un diagnostic gratuit de votre présence médiatique</p>
          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1a1a2e", padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", letterSpacing: "1px" }}>MANA MEDIA</div>
          <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>Régie publicitaire · RESOYU · Polynésie française</div>
        </div>
        <Link href="/login" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>
          Accès administration →
        </Link>
      </footer>

    </div>
  );
}
