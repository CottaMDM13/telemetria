import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Billing Dashboard",
  description: "Dashboard de custos (BigQuery)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, Arial, sans-serif", background: "#0b0b0f", color: "#eef1f7" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
