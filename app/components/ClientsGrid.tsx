"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const offreBadge: Record<string, { bg: string; color: string }> = {
  PREMIUM: { bg: "#f3e8ff", color: "#7c3aed" },
  PERFORMANCE: { bg: "#dbeafe", color: "#1d4ed8" },
  START: { bg: "#f3f4f6", color: "#6b7280" },
};

const progressColor: Record<string, string> = {
  PREMIUM: "#7b9fff",
  PERFORMANCE: "#fbbf24",
  START: "#34d399",
};

type Client = {
  id: string;
  nom: string;
  secteur: string;
  offre: string;
  budget_mensuel: number;
  roi: string;
  canaux: string[];
  contrat: string;
  statut: string;
  progression: number;
  initiales: string;
};

const OFFRES = ["Tous", "PREMIUM", "PERFORMANCE", "START"] as const;
const STATUTS = ["Tous", "Active", "En pause", "Terminée"] as const;

export default function ClientsGrid({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");
  const [filtreOffre, setFiltreOffre] = useState<string>("Tous");
  const [filtreStatut, setFiltreStatut] = useState<string>("Tous");
  const [showArchived, setShowArchived] = useState(false);

  const archivedCount = useMemo(() => clients.filter(c => c.statut === "Archivé").length, [clients]);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (!showArchived && c.statut === "Archivé") return false;
      const q = search.toLowerCase();
      const matchSearch = !q || c.nom.toLowerCase().includes(q) || (c.secteur || "").toLowerCase().includes(q);
      const matchOffre = filtreOffre === "Tous" || c.offre === filtreOffre;
      const matchStatut = filtreStatut === "Tous" || c.statut === filtreStatut;
      return matchSearch && matchOffre && matchStatut;
    });
  }, [clients, search, filtreOffre, filtreStatut, showArchived]);

  const filterBtn = (active: boolean) => ({
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600 as const,
    cursor: "pointer" as const,
    border: active ? "none" : "1px solid #e5e7eb",
    background: active ? "#1a1a2e" : "#fff",
    color: active ? "#fff" : "#555",
  });

  return (
    <>
      {/* Barre recherche + filtres */}
      <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "14px 20px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Rechercher un client ou secteur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "200px", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", outline: "none", color: "#374151" }}
        />

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Offre</span>
          {OFFRES.map((o) => (
            <button key={o} style={filterBtn(filtreOffre === o)} onClick={() => setFiltreOffre(o)}>
              {o === "Tous" ? "Toutes" : o}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Statut</span>
          {STATUTS.map((s) => (
            <button key={s} style={filterBtn(filtreStatut === s)} onClick={() => setFiltreStatut(s)}>
              {s === "Tous" ? "Tous" : s}
            </button>
          ))}
        </div>

        {archivedCount > 0 && (
          <button
            onClick={() => setShowArchived(!showArchived)}
            style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", cursor: "pointer", border: "1px solid #e5e7eb", background: showArchived ? "#f3f4f6" : "#fff", color: "#6b7280", fontWeight: 600 }}
          >
            {showArchived ? "Masquer archivés" : `Archivés (${archivedCount})`}
          </button>
        )}
        {(search || filtreOffre !== "Tous" || filtreStatut !== "Tous") && (
          <button
            onClick={() => { setSearch(""); setFiltreOffre("Tous"); setFiltreStatut("Tous"); }}
            style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", cursor: "pointer", border: "1px solid #fecaca", background: "#fff", color: "#dc2626", fontWeight: 600 }}
          >
            Effacer ✕
          </button>
        )}
      </div>

      {/* Résultat */}
      <div style={{ marginBottom: "8px", fontSize: "12px", color: "#888" }}>
        {filtered.length} client{filtered.length > 1 ? "s" : ""}
        {(search || filtreOffre !== "Tous" || filtreStatut !== "Tous") && ` sur ${clients.length}`}
      </div>

      {/* Grille */}
      <div className="grid-3col">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: "48px", textAlign: "center", background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", color: "#aaa", fontSize: "13px" }}>
            Aucun client ne correspond à cette recherche.
          </div>
        ) : (
          filtered.map((c) => {
            const offre = c.offre as string;
            // Générer une couleur d'avatar basée sur les initiales
            const colors = [
              { bg: "#e8ecff", color: "#4f6ef5" },
              { bg: "#fff0db", color: "#c2410c" },
              { bg: "#fce7f3", color: "#be185d" },
              { bg: "#dcfce7", color: "#16a34a" },
              { bg: "#fef3c7", color: "#b45309" },
              { bg: "#f3e8ff", color: "#7c3aed" },
            ];
            const avatarColor = colors[(c.initiales?.charCodeAt(0) || 0) % colors.length];

            return (
              <Link key={c.id} href={`/clients/${c.id}`} style={{ background: c.statut === "Archivé" ? "#fafafa" : "#fff", borderRadius: "10px", border: `1px solid ${c.statut === "Archivé" ? "#e5e7eb" : "#e5e7eb"}`, padding: "18px", cursor: "pointer", textDecoration: "none", display: "block", opacity: c.statut === "Archivé" ? 0.7 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: avatarColor.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", color: avatarColor.color, flexShrink: 0 }}>
                    {c.initiales}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nom}</div>
                    <div style={{ fontSize: "12px", color: "#888", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.secteur || "—"}</span>
                      <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: 600, background: offreBadge[offre]?.bg, color: offreBadge[offre]?.color, flexShrink: 0 }}>
                        {offre}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                  <div style={{ width: `${c.progression}%`, height: "100%", borderRadius: "4px", background: c.progression === 0 ? "#f87171" : progressColor[offre] }} />
                </div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "4px", marginBottom: "12px" }}>
                  {c.progression === 0
                    ? <span style={{ background: "#fff7ed", color: "#c2410c", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>Campagne en pause</span>
                    : `Budget utilisé : ${c.progression}%`
                  }
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "Budget/mois", value: `${Math.round((c.budget_mensuel || 0) / 1000)}k F` },
                    { label: "ROI estimé", value: c.roi || "—", highlight: c.roi?.startsWith("×") },
                    { label: "Canaux", value: String(c.canaux?.length ?? 0) },
                    { label: "Contrat", value: c.contrat || "—" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "#f8f9fc", borderRadius: "6px", padding: "8px 10px" }}>
                      <div style={{ fontSize: "10px", color: "#888" }}>{stat.label}</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: stat.highlight ? "#16a34a" : "#1a1a2e" }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })
        )}

        {/* Carte ajout */}
        <Link href="/nouveau-client" style={{ background: "#fafbff", borderRadius: "10px", border: "2px dashed #e5e7eb", padding: "18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "200px", gap: "8px", textDecoration: "none" }}>
          <div style={{ fontSize: "28px", color: "#aaa" }}>+</div>
          <div style={{ fontSize: "13px", color: "#aaa", fontWeight: 500 }}>Ajouter un client</div>
        </Link>
      </div>
    </>
  );
}
