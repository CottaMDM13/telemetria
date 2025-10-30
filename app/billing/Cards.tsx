"use client";

import { useEffect, useState } from "react";

type Row = { date: string; cost: number };

function currency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function Cards({ filters }: { filters: { start?: string; end?: string; project?: string } }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.start) params.set("start", filters.start);
    if (filters.end) params.set("end", filters.end);
    if (filters.project) params.set("project", filters.project);

    fetch(`/api/billing/daily?${params.toString()}`)
      .then((r) => r.json())
      .then((data: any) => {
        // Normaliza: garante array
        const arr = Array.isArray(data) ? data : [];
        // Garante nomes e tipos (BigQuery pode enviar strings e aliases f0_/f1_)
        const normalized: Row[] = arr.map((r: any) => ({
          date: String(r.date ?? r.f0_ ?? ""),
          cost: Number(r.cost ?? r.f1_ ?? 0),
        }));
        setRows(normalized);
      })
      .catch(() => setRows([]));
  }, [filters.start, filters.end, filters.project]);

  const totalPeriodo = Array.isArray(rows)
    ? rows.reduce((s, r) => s + (Number(r.cost) || 0), 0)
    : 0;

  const pico = Array.isArray(rows)
    ? rows.reduce((m, r) => Math.max(m, Number(r.cost) || 0), 0)
    : 0;

  const ultimoDia = Array.isArray(rows) && rows.length
    ? Number(rows.at(-1)!.cost) || 0
    : 0;

  return (
    <div className="grid grid-2">
      <div className="card">
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Total do período</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{currency(totalPeriodo)}</div>
      </div>
      <div className="card">
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Maior pico diário</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{currency(pico)}</div>
      </div>
      <div className="card">
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Último dia</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{currency(ultimoDia)}</div>
      </div>
    </div>
  );
}
