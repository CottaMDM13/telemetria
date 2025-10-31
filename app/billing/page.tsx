"use client";

import { useEffect, useState } from "react";
import BillingFilters from "@/components/BillingFilters";
import DailyCostsChart from "@/components/DailyCostsChart";
import ServiceCostsChart from "@/components/ServiceCostsChart";

type FiltersState = {
  start?: string;
  end?: string;
  project?: string;
};

export default function BillingPage() {
  const [filters, setFilters] = useState<FiltersState>({});
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);

  // carrega nomes de projetos a partir dos dados reais do BigQuery (via nossa API)
  useEffect(() => {
    fetch("/api/billing/daily")
      .then((res) => res.json())
      .then((data) => {
        // backend devolve algo como { ok: true, data: [...] }
        if (data && data.ok && Array.isArray(data.data)) {
          // extrai os nomes de projeto
          const projects = Array.from(
            new Set(
              (data.data as Array<{ project_name?: string }>)
                .map((x) => (x.project_name ? String(x.project_name) : ""))
                .filter(Boolean)
            )
          ).sort() as string[];

          setAvailableProjects(projects);
        } else if (Array.isArray(data)) {
          // fallback caso o backend devolva array direto
          const projects = Array.from(
            new Set(
              (data as Array<{ project_name?: string }>)
                .map((x) => (x.project_name ? String(x.project_name) : ""))
                .filter(Boolean)
            )
          ).sort() as string[];

          setAvailableProjects(projects);
        }
      })
      .catch((err) => {
        console.error("[billing/page] erro ao carregar projetos:", err);
      });
  }, []);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        Dashboard de Custos
      </h1>
      <p style={{ color: "var(--muted, #b3b6be)" }}>
        BigQuery → API → Gráfico
      </p>

      {/* Filtros (já com layout bonitinho que fizemos) */}
      <BillingFilters
        onChange={setFilters}
        availableProjects={availableProjects}
      />

      {/* Gráfico de custos diários por projeto */}
      <div
        style={{
          background: "#13131a",
          border: "1px solid #222",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <DailyCostsChart filters={filters} />
      </div>

      {/* Gráfico de custos por serviço */}
      <div
        style={{
          background: "#13131a",
          border: "1px solid #222",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <ServiceCostsChart filters={filters} />
      </div>
    </main>
  );
}
