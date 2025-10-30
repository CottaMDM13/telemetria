"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip);

type Row = {
  project_name: string;
  service_name: string;
  total_cost: number;
};

// mesmo mapa
const projectMap: Record<string, string> = {
  "Gemini API": "Projeto Desenvolve",
  IAPD: ".Edu",
};
const hiddenProjects = ["null", "My First Project", "", undefined as any];

const COLORS = [
  "#00FFFF",
  "#FF007F",
  "#FFD300",
  "#9B00FF",
  "#00FF7F",
  "#FF6A00",
  "#007BFF",
];

function normalizeProjectName(name: string | null | undefined): string | null {
  if (!name) return null;
  if (hiddenProjects.includes(name)) return null;
  if (projectMap[name]) return projectMap[name];
  return name;
}

export default function ServiceCostsChart({
  filters,
}: {
  filters: { start?: string; end?: string; projects?: string[] };
}) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.start) params.set("start", filters.start);
    if (filters.end) params.set("end", filters.end);
    fetch(`/api/service-costs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setRows(data.data);
      })
      .catch((e) => console.error(e));
  }, [filters.start, filters.end]);

  const chartData = useMemo(() => {
    if (!rows.length) return { labels: [], datasets: [] };

    // serviços
    const allServices = Array.from(new Set(rows.map((r) => r.service_name))).sort();

    // projetos (já normalizados e sem os que queremos esconder)
    const allProjects = Array.from(
      new Set(
        rows
          .map((r) => normalizeProjectName(r.project_name))
          .filter((x): x is string => x !== null)
      )
    ).sort();

    // filtros vindos da UI (só que eles já vêm renomeados, então usamos direto)
    const selected =
      filters.projects && filters.projects.length ? filters.projects : allProjects;

    const datasets = selected.map((proj, idx) => {
      const data = allServices.map((service) => {
        // achar a linha cujo nome, depois de normalizar, bate com o proj
        const row = rows.find((r) => {
          const normalized = normalizeProjectName(r.project_name);
          return normalized === proj && r.service_name === service;
        });
        return row ? Number(row.total_cost) : 0;
      });

      return {
        label: proj,
        data,
        backgroundColor: COLORS[idx % COLORS.length] + "88",
        borderColor: COLORS[idx % COLORS.length],
        borderWidth: 1.5,
      };
    });

    // total combinado por serviço
    if (selected.length > 1) {
      const totalData = allServices.map((service) =>
        selected.reduce((sum, proj) => {
          const row = rows.find((r) => {
            const normalized = normalizeProjectName(r.project_name);
            return normalized === proj && r.service_name === service;
          });
          return sum + (row ? Number(row.total_cost) : 0);
        }, 0)
      );
      datasets.push({
        label: "Total combinado",
        data: totalData,
        backgroundColor: "#ffffff33",
        borderColor: "#ffffff",
        borderWidth: 1,
      } as any);
    }

    return {
      labels: allServices,
      datasets,
    };
  }, [rows, filters.projects]);

  return (
    <div
      style={{
        background: "#0b0b10",
        border: "1px solid #222",
        borderRadius: "14px",
        padding: "16px",
      }}
    >
      <h2 style={{ color: "#fff", fontWeight: 600, fontSize: "14px", marginBottom: "12px" }}>
        Custos por serviço
      </h2>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          scales: {
            x: {
              ticks: { color: "#CCC" },
              grid: { display: false },
            },
            y: {
              ticks: {
                color: "#BBB",
                callback: function (value: any) {
                  return "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
                },
              },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
          },
          plugins: {
            legend: { labels: { color: "#fff" } },
            tooltip: {
              backgroundColor: "#1a1a1f",
              borderColor: "#333",
              borderWidth: 1,
              titleColor: "#00FFFF",
              bodyColor: "#EEE",
              callbacks: {
                label: (ctx) => {
                  const v = ctx.parsed.y ?? 0;
                  return `${ctx.dataset.label}: R$${v.toFixed(2)}`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
}
