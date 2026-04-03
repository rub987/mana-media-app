"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Emplacement = {
  id: string;
  nom: string;
  commune: string;
  type: string;
  adresse: string;
  latitude: number;
  longitude: number;
  statut: string;
  visibilite: string;
  trafic_journalier: number;
  dimensions: string;
  prix_semaine: number;
  prix_mois: number;
  prix_negocie: number;
  prix_negocie_duree?: string;
  remise_longue_duree: number;
  notes: string;
  created_at?: string;
};

const statutDot: Record<string, string> = {
  "Disponible": "#22c55e",
  "Réservé": "#f97316",
  "Non disponible": "#ef4444",
};

const statutBadge: Record<string, { bg: string; color: string }> = {
  "Disponible": { bg: "#dcfce7", color: "#16a34a" },
  "Réservé": { bg: "#fff7ed", color: "#c2410c" },
  "Non disponible": { bg: "#fee2e2", color: "#dc2626" },
};

function createMarkerIcon(statut: string) {
  const color = statutDot[statut] || "#aaa";
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

function FlyToController({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 17, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView({
  emplacements,
  onMapClick,
  onEdit,
  onDelete,
  flyToCoords,
}: {
  emplacements: Emplacement[];
  onMapClick: (lat: number, lng: number) => void;
  onEdit: (e: Emplacement) => void;
  onDelete: (id: string) => void;
  flyToCoords?: { lat: number; lng: number } | null;
}) {
  return (
    <MapContainer
      center={[-17.65, -149.43]}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />
      <FlyToController coords={flyToCoords ?? null} />

      {emplacements.map((emp) => (
        <Marker
          key={emp.id}
          position={[emp.latitude, emp.longitude]}
          icon={createMarkerIcon(emp.statut)}
        >
          <Popup>
            <div style={{ minWidth: "190px", fontFamily: "system-ui, sans-serif" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a2e", marginBottom: "2px" }}>{emp.nom}</div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                {emp.commune} · {emp.type}
                {emp.dimensions && ` · ${emp.dimensions}`}
              </div>

              <span style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: 600,
                background: statutBadge[emp.statut]?.bg || "#f3f4f6",
                color: statutBadge[emp.statut]?.color || "#888",
                marginBottom: "10px",
              }}>
                {emp.statut}
              </span>

              {(emp.visibilite || emp.trafic_journalier) && (
                <div style={{ fontSize: "11px", color: "#555", marginBottom: "6px" }}>
                  {emp.visibilite && <span>Visibilité : <strong>{emp.visibilite}</strong></span>}
                  {emp.visibilite && emp.trafic_journalier && " · "}
                  {emp.trafic_journalier && <span>~{emp.trafic_journalier.toLocaleString("fr-FR")} passage/j</span>}
                </div>
              )}

              {(emp.prix_semaine || emp.prix_mois) && (
                <div style={{ background: "#f9fafb", borderRadius: "6px", padding: "6px 8px", fontSize: "12px", marginBottom: "10px" }}>
                  {emp.prix_semaine && (
                    <div>Semaine : <strong>{emp.prix_semaine.toLocaleString("fr-FR")} F</strong></div>
                  )}
                  {emp.prix_mois && (
                    <div>Mois : <strong>{emp.prix_mois.toLocaleString("fr-FR")} F</strong>
                      {emp.remise_longue_duree > 0 && (
                        <span style={{ color: "#16a34a", fontSize: "10px", marginLeft: "4px" }}>-{emp.remise_longue_duree}% longue durée</span>
                      )}
                    </div>
                  )}
                  {emp.prix_negocie && (
                    <div style={{ color: "#7c3aed" }}>Négocié : <strong>{emp.prix_negocie.toLocaleString("fr-FR")} F</strong> / {emp.prix_negocie_duree || "mois"}</div>
                  )}
                </div>
              )}

              {emp.notes && (
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px", fontStyle: "italic" }}>{emp.notes}</div>
              )}

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => onEdit(emp)}
                  style={{ flex: 1, padding: "5px 8px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Supprimer "${emp.nom}" ?`)) onDelete(emp.id);
                  }}
                  style={{ padding: "5px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "5px", fontSize: "12px", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
