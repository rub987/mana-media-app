"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Qu'est-ce que PilotMedia ?",
    a: "PilotMedia est un outil de pilotage tout-en-un conçu pour les régies publicitaires et agences de communication locales. Il centralise la gestion des clients, des plans médias classiques (Radio, TV, Print, Affichage), des campagnes sociales & digitales, et la production de rapports — dans une seule interface.",
  },
  {
    q: "Pour qui est conçu PilotMedia ?",
    a: "PilotMedia est fait pour les équipes de 2 à 15 personnes qui gèrent de la publicité locale. Régies pub, agences 360°, agences digitales — si vous jongler encore entre Excel, Drive et PowerPoint pour suivre vos clients et campagnes, PilotMedia est fait pour vous.",
  },
  {
    q: "Faut-il avoir ZOHO CRM pour utiliser PilotMedia ?",
    a: "Non. ZOHO est une intégration optionnelle. PilotMedia fonctionne de façon totalement autonome avec sa propre base de données clients. Si vous utilisez déjà ZOHO, la synchronisation est automatique à la création et modification de chaque client.",
  },
  {
    q: "Combien d'utilisateurs puis-je inviter ?",
    a: "Le plan Starter permet 2 utilisateurs. Le plan Agence jusqu'à 8. Le plan Régie est illimité. Vous pouvez inviter des Administrateurs (accès complet) ou des Community Managers (accès limité à leurs clients assignés).",
  },
  {
    q: "Quelle est la différence entre Admin et Community Manager ?",
    a: "Un Administrateur a accès à toutes les données, tous les clients, et toutes les fonctionnalités de gestion. Un Community Manager ne voit que les clients qui lui sont assignés — il peut créer et gérer des campagnes, mais n'a pas accès au reporting global, aux paramètres, ni aux emplacements.",
  },
  {
    q: "Mes clients peuvent-ils accéder à leurs campagnes ?",
    a: "Oui. Chaque client peut recevoir un accès à son Portail Client dédié — un espace en lecture seule où il consulte ses campagnes en cours, ses plans médias et ses indicateurs de performance, sans voir les données des autres clients.",
  },
  {
    q: "Les données sont-elles sécurisées ?",
    a: "Oui. Les données sont hébergées sur Supabase (PostgreSQL), avec chiffrement, Row Level Security et authentification JWT. L'accès à chaque page est protégé par un middleware qui vérifie le rôle de l'utilisateur à chaque requête. Aucune donnée client n'est jamais exposée côté navigateur.",
  },
  {
    q: "Y a-t-il une période d'essai ?",
    a: "Nous proposons un accès pilote de 3 mois à tarif préférentiel pour les premières agences partenaires en dehors de la Polynésie française. Contactez-nous via le formulaire ci-dessous pour en bénéficier.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{ padding: "80px 48px", background: "#fff" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#1a1a2e", marginBottom: "8px" }}>
            Questions fréquentes
          </h2>
          <p style={{ fontSize: "15px", color: "#888" }}>
            Tout ce que vous voulez savoir avant de commencer.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                border: "1px solid",
                borderColor: open === i ? "#7b9fff" : "#e5e7eb",
                borderRadius: "10px",
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 20px",
                  background: open === i ? "#f0f4ff" : "#fff",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e", flex: 1 }}>
                  {faq.q}
                </span>
                <span style={{
                  fontSize: "18px",
                  color: "#7b9fff",
                  flexShrink: 0,
                  transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  display: "inline-block",
                }}>
                  +
                </span>
              </button>
              {open === i && (
                <div style={{ padding: "0 20px 18px", fontSize: "14px", color: "#555", lineHeight: 1.7, background: "#f0f4ff" }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
