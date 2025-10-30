"use client";

import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

type Row = { date: string; cost: number };

// Formata YYYY-MM-DD -> DD/MM/YYYY
function formatBR(iso: string) {
  const [y, m, d] = (iso || "").split("-");
  if (!y || !m || !d) return iso || "";
  return `${d}/${m}/${y}`;
}

export default function BillingChart({
  filters,
}: {
  filters: { start?: string; end?: string; project?: string };
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [acumulado, setAcumulado] = useState(false);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filters.start) p.set("start", filters.start);
    if (filters.end) p.set("end", filters.end);
    if (filters.project) p.set("project", filters.project);

    fetch(`/api/billing/daily?${p.toString()}`)
      .then((r) => r.json())
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : [];
        const clean: Row[] = arr.map((r: any) => ({
          date:
            typeof r?.date === "object"
              ? String(r?.date?.value ?? "")
              : String(r?.date ?? ""),
          cost: Number(r?.cost ?? 0),
        }));
        setRows(clean);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [filters.start, filters.end, filters.project]);

  const labels = useMemo(() => rows.map((r) => formatBR(r.date)), [rows]);

  const values = useMemo(
    () =>
      rows.map((r, i) =>
        acumulado
          ? rows
              .slice(0, i + 1)
              .reduce((s, x) => s + (Number(x.cost) || 0), 0)
          : Number(r.cost) || 0
      ),
    [rows, acumulado]
  );

  const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    }).format(v);

  if (loading) return <div>Carregando…</div>;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className="btn-primary" onClick={() => setAcumulado((a) => !a)}>
          {acumulado ? "Mostrar diário" : "Mostrar acumulado"}
        </button>
      </div>

      <Line
        data={{
          labels,
          datasets: [
            {
              label: acumulado ? "Custo acumulado" : "Custo diário",
              data: values,
              borderWidth: 2,
              fill: true,
              tension: 0.35,
              borderColor: "rgba(59,130,246,1)",
              backgroundColor: "rgba(59,130,246,0.18)",
              pointRadius: 2,
              pointHitRadius: 12,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(15, 23, 42, .95)",
              borderColor: "rgba(59,130,246,.4)",
              borderWidth: 1,
              padding: 12,
              callbacks: {
                // Mostra a data em DD/MM/YYYY
                title: (items) => formatBR((items[0]?.label as string) ?? ""),
                label: (ctx) => currency(Number(ctx.raw)),
              },
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (val) => currency(Number(val)),
                color: "#a1a5b3",
              },
              grid: { color: "rgba(255,255,255,.06)" },
            },
            x: {
              ticks: { color: "#a1a5b3", maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
              grid: { color: "rgba(255,255,255,.04)" },
            },
          },
        }}
      />
    </div>
  );
}
