import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANA MEDIA — Pilotage Média",
  description: "Plateforme de pilotage média locale — Polynésie française",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
