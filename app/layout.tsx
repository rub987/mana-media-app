import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PilotMedia — Le cockpit de votre régie publicitaire.",
  description: "Le cockpit de votre régie publicitaire — Polynésie française",
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
