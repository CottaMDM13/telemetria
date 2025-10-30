"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

type Row = {
  day: any;
  project_name: string;
  total_cost: number;
};

// mapeamento igual ao do filtro
const projectMap: Record<string, string> = {
  "Gemini API": "Projeto Desenvolve",
  IAPD: ".Edu",
};
// nomes que não queremos mostrar
const hiddenProjects = ["null", "My First Project", "", undefined as any, null as any];

const COLORS = [
  "#00FFFF",
  "#FF007F",
  "#FFD300",
  "#9B00FF",
  "#00FF7F",
  "#FF6A00",
  "#007BFF",
];

// normaliza o campo de data que vem do backend
function normalizeDay(input: any): string {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (typeof input === "object" && "value" in input) {
    return String((input as any).value);
  }
  if (input instanceof Date) {
    return input.toISOString().slice(0, 10);
  }
  return String(input);
}

// exibe a data no padrão brasileiro
function formatToBR(iso: string): string {
  if (!iso) return "";
  const onlyDate = iso.slice(0, 10);
  const [y, m, d] = onlyDate.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}`;
}

// aplica o mesmo rename do filtro
function normalizeProjectName(name: string | null | undefined): string | null {
  if (!name) return null;
  if (hiddenProjects.includes(name)) return null;
  if (projectMap[name]) return projectMap[name];
  return name;
}

export default function DailyCostsChart({
  filters,
}: {
  filters: { start?: string; end?: string; projects?: string[] };
}) {
  const [rows, setRows] = useState<Row[]>([]);

  // busca os dados
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.start) params.set("start", filters.start);
    if (filters.end) params.set("end", filters.end);
    fetch(`/api/daily-costs?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setRows(data.data);
      })
      .catch((e) => console.error(e));
  }, [filters.start, filters.end]);

  const chartData = useMemo(() => {
    if (!rows.length) return { labels: [], datasets: [] };

    // dias normalizados (para ordenar)
    const allDaysIso = Array.from(
      new Set(rows.map((r) => normalizeDay(r.day)))
    ).sort();

    // labels que vão aparecer no gráfico
    const allDaysBR = allDaysIso.map((d) => formatToBR(d));

    // pega todos os projetos que vieram, já renomeando e removendo os proibidos
    const allProjects = Array.from(
      new Set(
        rows
          .map((r) => normalizeProjectName(r.project_name))
          .filter((x): x is string => x !== null)
      )
    ).sort();

    // se o usuário filtrou na UI a gente respeita; se não, mostra todos
    const selected =
      filters.projects && filters.projects.length ? filters.projects : allProjects;

    const datasets = selected.map((proj, idx) => {
      const data = allDaysIso.map((isoDay) => {
        const row = rows.find((r) => {
          const normalized = normalizeProjectName(r.project_name);
          return normalized === proj && normalizeDay(r.day) === isoDay;
        });
      return row ? Number(row.total_cost) : 0;
      });

      return {
        label: proj,
        data,
        borderColor: COLORS[idx % COLORS.length],
        backgroundColor: COLORS[idx % COLORS.length],
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
      };
    });

    // linha de total combinado
    if (selected.length > 1) {
      const totalData = allDaysIso.map((isoDay) =>
        selected.reduce((sum, proj) => {
          const row = rows.find((r) => {
            const normalized = normalizeProjectName(r.project_name);
            return normalized === proj && normalizeDay(r.day) === isoDay;
          });
          return sum + (row ? Number(row.total_cost) : 0);
        }, 0)
      );
      datasets.push({
        label: "Total combinado",
        data: totalData,
        borderColor: "#ffffff",
        borderDash: [6, 6],
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
      } as any);
    }

    return {
      labels: allDaysBR,
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
        Custos diários por projeto
      </h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          interaction: {
            mode: "nearest", // pega o ponto mais próximo
            intersect: true,
          },
          scales: {
            x: {
              ticks: { color: "#BBB" },
              grid: { color: "rgba(255,255,255,0.05)" },
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
            legend: {
              labels: { color: "#fff" },
            },
            // 👇 AQUI o tooltip bonito
            tooltip: {
              enabled: true,
              backgroundColor: "#1a1a1f",
              borderColor: "#00eaff",
              borderWidth: 1,
              titleColor: "#00eaff",
              bodyColor: "#fff",
              cornerRadius: 8,
              padding: 10,
              displayColors: false,
              callbacks: {
                title: (ctx) => {
                  // data (dd/MM)
                  return "Data: " + ctx[0].label;
                },
                label: (ctx) => {
                  const v = ctx.parsed.y ?? 0;
                  // se quiser em dólar, troca o prefixo
                  return `${ctx.dataset.label}: R$ ${v.toFixed(2)}`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
}
