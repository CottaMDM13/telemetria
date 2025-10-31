"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type FiltersState = {
  start?: string;
  end?: string;
  project?: string;
};

type BillingFiltersProps = {
  onChange: Dispatch<SetStateAction<FiltersState>>;
  // 👇 essa era a prop que o page.tsx está mandando
  availableProjects?: string[];
};

export default function BillingFilters({
  onChange,
  availableProjects = [],
}: BillingFiltersProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [project, setProject] = useState("");

  useEffect(() => {
    onChange({
      start: start || undefined,
      end: end || undefined,
      project: project || undefined,
    });
  }, [start, end, project, onChange]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        background: "#13131a",
        border: "1px solid #222",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label
          htmlFor="start"
          style={{ color: "#b3b6be", fontSize: 14, marginBottom: 4 }}
        >
          Data inicial
        </label>
        <input
          id="start"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          style={{
            background: "#0b0b0f",
            border: "1px solid #333",
            borderRadius: 6,
            padding: "8px 10px",
            color: "white",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label
          htmlFor="end"
          style={{ color: "#b3b6be", fontSize: 14, marginBottom: 4 }}
        >
          Data final
        </label>
        <input
          id="end"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          style={{
            background: "#0b0b0f",
            border: "1px solid #333",
            borderRadius: 6,
            padding: "8px 10px",
            color: "white",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 200 }}>
        <label
          htmlFor="project"
          style={{ color: "#b3b6be", fontSize: 14, marginBottom: 4 }}
        >
          Projeto
        </label>
        <select
          id="project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          style={{
            background: "#0b0b0f",
            border: "1px solid #333",
            borderRadius: 6,
            padding: "8px 10px",
            color: "white",
          }}
        >
          <option value="">Todos</option>
          {availableProjects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
