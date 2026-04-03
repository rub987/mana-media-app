"use client";

import { useState } from "react";

export default function TestModeToggle({ initialValue }: { initialValue: boolean }) {
  const [active, setActive] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const newValue = !active;
    const res = await fetch("/api/settings/test-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test_mode: newValue }),
    });
    if (res.ok) setActive(newValue);
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: "13px", color: "#1a1a2e", fontWeight: 500, marginBottom: "2px" }}>
          Mode test actif
        </div>
        <div style={{ fontSize: "12px", color: "#888" }}>
          {active
            ? "Les emails sont redirigés vers votre adresse à la place du client."
            : "Les emails sont envoyés normalement aux clients."}
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        style={{
          position: "relative",
          width: "44px",
          height: "24px",
          borderRadius: "12px",
          background: active ? "#1a1a2e" : "#d1d5db",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
        aria-label="Activer/désactiver le mode test"
      >
        <span style={{
          position: "absolute",
          top: "3px",
          left: active ? "23px" : "3px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          display: "block",
        }} />
      </button>
    </div>
  );
}
