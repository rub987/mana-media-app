import Link from "next/link";
import AuthHashRedirect from "./components/AuthHashRedirect";
import { createClient } from "@/utils/supabase/server";
import ContactForm from "./components/ContactForm";
import FAQSection from "./components/FAQSection";

const features = [
  {
    icon: "🗂️",
    titre: "CRM clients",
    desc: "Fiches complètes, offres, budgets, contacts. Synchronisation automatique avec ZOHO CRM.",
  },
  {
    icon: "📅",
    titre: "Plans médias",
    desc: "Créez et visualisez vos plans Radio, TV, Print, Affichage en vue Gantt interactive.",
  },
  {
    icon: "📱",
    titre: "Campagnes digitales",
    desc: "Meta, Google Ads, TikTok, LinkedIn, YouTube. Suivi budgétaire et calendrier mensuel.",
  },
  {
    icon: "📊",
    titre: "Rapports PDF",
    desc: "Générez des rapports professionnels en un clic. Parfaits pour vos rendez-vous clients.",
  },
  {
    icon: "🔐",
    titre: "Portail client",
    desc: "Chaque annonceur accède à son espace dédié pour consulter ses campagnes en temps réel.",
  },
  {
    icon: "👥",
    titre: "Gestion d'équipe",
    desc: "Rôles Admin et Community Manager. Chaque CM ne voit que ses clients assignés.",
  },
];

const steps = [
  {
    num: "01",
    titre: "Créez votre espace",
    desc: "Invitez votre équipe, importez vos clients depuis ZOHO ou créez-les manuellement.",
  },
  {
    num: "02",
    titre: "Pilotez vos campagnes",
    desc: "Plans médias, campagnes digitales, notes internes — tout au même endroit.",
  },
  {
    num: "03",
    titre: "Impressionnez vos clients",
    desc: "Rapports PDF en 1 clic et portail client dédié pour une relation transparente.",
  },
];

const plans = [
  {
    nom: "STARTER",
    prix: "9 900",
    euro: "83",
    cible: "Petites agences & indépendants",
    dark: false,
    populaire: false,
    inclus: [
      "2 utilisateurs",
      "Jusqu'à 15 clients",
      "Plans médias & campagnes digitales",
      "Rapports PDF",
      "Support standard",
    ],
    nonInclus: ["Portail client", "Rôles Community Manager", "Sync ZOHO CRM"],
  },
  {
    nom: "AGENCE",
    prix: "24 900",
    euro: "209",
    cible: "Agences & régies locales",
    dark: true,
    populaire: true,
    inclus: [
      "Jusqu'à 8 utilisateurs",
      "Clients illimités",
      "Plans médias & campagnes digitales",
      "Rapports PDF",
      "Portail client",
      "Rôles Community Manager",
      "Synchronisation ZOHO CRM",
      "Support prioritaire",
    ],
    nonInclus: [],
  },
  {
    nom: "RÉGIE",
    prix: null,
    euro: null,
    cible: "Grandes régies & groupes",
    dark: false,
    populaire: false,
    inclus: [
      "Utilisateurs illimités",
      "Clients illimités",
      "Toutes les fonctionnalités",
      "Personnalisation aux couleurs de l'agence",
      "Onboarding accompagné",
      "Support dédié",
    ],
    nonInclus: [],
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user && user.user_metadata?.role !== "client";

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#fff", color: "#1a1a2e" }}>
      <AuthHashRedirect />

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e5e7eb", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "0.5px", color: "#1a1a2e" }}>PilotMedia</span>
        </div>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <a href="#fonctionnalites" style={{ padding: "8px 14px", fontSize: "13px", color: "#555", textDecoration: "none" }}>Fonctionnalités</a>
          <a href="#tarifs" style={{ padding: "8px 14px", fontSize: "13px", color: "#555", textDecoration: "none" }}>Tarifs</a>
          <a href="#faq" style={{ padding: "8px 14px", fontSize: "13px", color: "#555", textDecoration: "none" }}>FAQ</a>
          <a href="#contact" style={{ padding: "8px 14px", fontSize: "13px", color: "#555", textDecoration: "none" }}>Contact</a>
          {isAdmin ? (
            <Link href="/dashboard" style={{ marginLeft: "8px", padding: "8px 18px", background: "#1a1a2e", color: "#fff", borderRadius: "6px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
              Tableau de bord →
            </Link>
          ) : (
            <Link href="/login" style={{ marginLeft: "8px", padding: "8px 18px", background: "#1a1a2e", color: "#fff", borderRadius: "6px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
              Connexion →
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 60%, #1a1a2e 100%)", padding: "100px 48px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(123,159,255,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(167,139,250,0.1) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: "780px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", background: "rgba(123,159,255,0.15)", borderRadius: "20px", fontSize: "12px", fontWeight: 600, color: "#7b9fff", letterSpacing: "1px", marginBottom: "28px", border: "1px solid rgba(123,159,255,0.2)" }}>
            ✦ THE AD AGENCY OS
          </div>
          <h1 style={{ fontSize: "56px", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "20px", letterSpacing: "-1px" }}>
            Le cockpit de votre<br />
            <span style={{ background: "linear-gradient(90deg, #7b9fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>régie publicitaire.</span>
          </h1>
          <p style={{ fontSize: "18px", color: "#9ca3b0", lineHeight: 1.7, marginBottom: "40px", maxWidth: "560px", margin: "0 auto 40px" }}>
            PilotMedia centralise vos clients, plans médias, campagnes digitales et rapports dans un seul outil — conçu pour les régies locales, testé sur le terrain en Polynésie française.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{ padding: "14px 28px", background: "#7b9fff", color: "#fff", borderRadius: "8px", fontSize: "15px", fontWeight: 700, textDecoration: "none" }}>
              Demander une démo →
            </a>
            <a href="#fonctionnalites" style={{ padding: "14px 28px", background: "rgba(255,255,255,0.07)", color: "#fff", borderRadius: "8px", fontSize: "15px", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>
              Voir les fonctionnalités
            </a>
          </div>
        </div>

        {/* Plateformes */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "60px", flexWrap: "wrap" }}>
          {["Radio", "TV", "Print", "Affichage", "Meta", "Google Ads", "TikTok Ads", "LinkedIn Ads", "YouTube"].map((c) => (
            <span key={c} style={{ padding: "5px 14px", background: "rgba(255,255,255,0.05)", borderRadius: "20px", fontSize: "12px", color: "#666", border: "1px solid rgba(255,255,255,0.07)" }}>
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding: "28px 48px", background: "#f8f9fc", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "1px" }}>Utilisé au quotidien par</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e" }}>RESOYU</span>
          <span style={{ fontSize: "12px", color: "#bbb" }}>·</span>
          <span style={{ fontSize: "13px", color: "#666" }}>Régie publicitaire — Polynésie française</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", background: "#dcfce7", borderRadius: "20px", fontSize: "11px", fontWeight: 600, color: "#16a34a" }}>
            ● En production
          </span>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalites" style={{ padding: "80px 48px", background: "#fff" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#1a1a2e", marginBottom: "8px" }}>Tout ce dont votre régie a besoin</h2>
            <p style={{ fontSize: "15px", color: "#888" }}>Un seul outil. Zéro Excel. Résultats visibles dès le premier mois.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {features.map((f) => (
              <div key={f.titre} style={{ background: "#f8f9fc", borderRadius: "12px", padding: "28px 24px", border: "1px solid #e5e7eb", transition: "border-color 0.2s" }}>
                <div style={{ fontSize: "32px", marginBottom: "14px" }}>{f.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e", marginBottom: "8px" }}>{f.titre}</div>
                <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section style={{ padding: "80px 48px", background: "#f8f9fc" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#1a1a2e", marginBottom: "8px" }}>Opérationnel en moins d'une heure</h2>
            <p style={{ fontSize: "15px", color: "#888" }}>Pas de formation longue. Pas d'installation. Juste votre navigateur.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {steps.map((s) => (
              <div key={s.num} style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ fontSize: "40px", fontWeight: 800, color: "#e5e7eb", marginBottom: "16px", letterSpacing: "-2px" }}>{s.num}</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e", marginBottom: "10px" }}>{s.titre}</div>
                <div style={{ fontSize: "13px", color: "#888", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" style={{ padding: "80px 48px", background: "#fff" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#1a1a2e", marginBottom: "8px" }}>Tarifs simples et transparents</h2>
            <p style={{ fontSize: "15px", color: "#888" }}>Sans engagement. Sans frais cachés. Premiers partenaires : 3 mois offerts.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {plans.map((p) => (
              <div key={p.nom} style={{ borderRadius: "14px", border: p.dark ? "2px solid #7b9fff" : "1px solid #e5e7eb", overflow: "hidden", boxShadow: p.dark ? "0 8px 40px rgba(123,159,255,0.2)" : "none", position: "relative" }}>
                {p.populaire && (
                  <div style={{ position: "absolute", top: "16px", right: "16px", background: "#7b9fff", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "10px", letterSpacing: "0.5px" }}>
                    POPULAIRE
                  </div>
                )}
                <div style={{ background: p.dark ? "#1a1a2e" : "#f8f9fc", padding: "28px 24px", borderBottom: `1px solid ${p.dark ? "#2a2a4e" : "#e5e7eb"}` }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: p.dark ? "#7b9fff" : "#888", letterSpacing: "1.5px", marginBottom: "12px" }}>{p.nom}</div>
                  {p.prix ? (
                    <>
                      <div style={{ fontSize: "30px", fontWeight: 800, color: p.dark ? "#fff" : "#1a1a2e" }}>
                        {p.prix} <span style={{ fontSize: "13px", fontWeight: 400, color: p.dark ? "#aaa" : "#888" }}>F CFP / mois</span>
                      </div>
                      <div style={{ fontSize: "12px", color: p.dark ? "#7b9fff" : "#aaa", marginTop: "4px" }}>≈ {p.euro} € / mois</div>
                    </>
                  ) : (
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a2e" }}>Sur devis</div>
                  )}
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>{p.cible}</div>
                </div>
                <div style={{ padding: "24px", background: p.dark ? "#0f0f1e" : "#fff" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                    {p.inclus.map((item) => (
                      <div key={item} style={{ display: "flex", gap: "8px", fontSize: "13px", color: p.dark ? "#ccc" : "#374151", alignItems: "flex-start" }}>
                        <span style={{ color: "#16a34a", flexShrink: 0 }}>✓</span>
                        {item}
                      </div>
                    ))}
                    {p.nonInclus.map((item) => (
                      <div key={item} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#bbb", alignItems: "flex-start" }}>
                        <span style={{ color: "#ddd", flexShrink: 0 }}>✕</span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <a href="#contact" style={{ display: "block", marginTop: "24px", padding: "11px", background: p.dark ? "#7b9fff" : "#1a1a2e", color: "#fff", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                    {p.prix ? "Commencer →" : "Nous contacter →"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* CONTACT */}
      <section id="contact" style={{ padding: "80px 48px", background: "#f8f9fc" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px", color: "#1a1a2e" }}>Discutons de votre projet</h2>
          <p style={{ color: "#888", fontSize: "15px", marginBottom: "40px" }}>
            Démo gratuite, accès pilote, questions techniques — on vous répond sous 24h.
          </p>
          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1a1a2e", padding: "40px 48px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>PilotMedia</div>
            <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>Le cockpit de votre régie publicitaire. · RESOYU · Polynésie française</div>
          </div>
          <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
            <a href="#fonctionnalites" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>Fonctionnalités</a>
            <a href="#tarifs" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>Tarifs</a>
            <a href="#faq" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>FAQ</a>
            <a href="#contact" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>Contact</a>
            <Link href="/login" style={{ fontSize: "12px", color: "#444", textDecoration: "none" }}>
              Connexion →
            </Link>
          </div>
        </div>
        <div style={{ maxWidth: "960px", margin: "20px auto 0", paddingTop: "20px", borderTop: "1px solid #2a2a4e", fontSize: "11px", color: "#444", textAlign: "center" }}>
          © 2026 PilotMedia · RESOYU · Tous droits réservés
        </div>
      </footer>

    </div>
  );
}
