"use client";

import Link from "next/link";

export default function Home() {
  const buttonStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, #00eaff 0%, #007bff 100%)",
    color: "#000",
    fontWeight: 600,
    padding: "10px 22px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    transition: "all 0.25s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        Dashboard de Custos
      </h1>

      <p style={{ color: "#9ca3af" }}>BigQuery → API → Gráfico</p>

      {/* Card para o Billing */}
      <div
        style={{
          background: "#13131a",
          border: "1px solid #222",
          borderRadius: "16px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 20, fontWeight: 700 }}>
          Ir para o Billing
        </h2>

        <Link href="/billing">
          <button
            style={buttonStyle}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.filter = "brightness(1.15)")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.filter = "brightness(1)")
            }
          >
            Ver dashboard →
          </button>
        </Link>
      </div>

      {/* Card para Projetos */}
      <div
        style={{
          background: "#13131a",
          border: "1px solid #222",
          borderRadius: "16px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 20, fontWeight: 700 }}>
          Ir para Projetos
        </h2>

        <Link href="/projetos">
          <button
            style={buttonStyle}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.filter = "brightness(1.15)")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.filter = "brightness(1)")
            }
          >
            Ver projetos →
          </button>
        </Link>
      </div>
    </main>
  );
}
