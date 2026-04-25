"use client";

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        textAlign: "center",
        color: "#0f172a",
        background: "#f8fafc",
      }}
    >
      <div style={{ maxWidth: 360 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: "#0f766e",
            color: "white",
            margin: "0 auto 1.25rem",
            display: "grid",
            placeItems: "center",
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          M
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          MedStick is offline
        </h1>
        <p style={{ marginTop: 12, color: "#475569", lineHeight: 1.5 }}>
          The local server isn&rsquo;t reachable. Make sure the MedStick
          launcher is running, then reload.
        </p>
        <button
          onClick={() => location.reload()}
          style={{
            marginTop: 20,
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: "#0f766e",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    </main>
  );
}
