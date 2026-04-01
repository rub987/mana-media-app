import Sidebar from "../components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import ZohoImportButton from "../components/ZohoImportButton";
import ClientsGrid from "../components/ClientsGrid";
import Link from "next/link";

export const revalidate = 0;

export default async function Clients() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("nom", { ascending: true });

  const allClients = clients ?? [];
  const actifs = allClients.filter((c) => c.statut === "Active").length;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a2e" }}>Clients</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
              {allClients.length} clients · {actifs} actifs
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <ZohoImportButton />
            <Link href="/nouveau-client" style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontWeight: 500, textDecoration: "none" }}>
              + Nouveau client
            </Link>
          </div>
        </div>

        <div className="page-content">
          <ClientsGrid clients={allClients} />
        </div>
      </main>
    </div>
  );
}
