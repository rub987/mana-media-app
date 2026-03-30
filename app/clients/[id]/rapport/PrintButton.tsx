"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: "9px 20px",
        background: "#fff",
        color: "#1a1a2e",
        border: "none",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Télécharger PDF
    </button>
  );
}
