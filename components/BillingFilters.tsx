"use client";

import React, { useState, useMemo } from "react";

type Props = {
  onChange: (filters: { start?: string; end?: string; projects?: string[] }) => void;
  projects: string[];
};

// mapeia nomes
const projectMap: Record<string, string> = {
  "Gemini API": "Projeto Desenvolve",
  IAPD: ".Edu",
};

// nomes que não devem aparecer
const hiddenProjects = ["null", "My First Project", "", undefined as any, null as any];

export default function BillingFilters({ onChange, projects }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // aplica renomeação + remove vazios
  const cleanProjects = useMemo(() => {
    return projects
      .map((p) => {
        if (!p) return ""; // protege de undefined
        if (projectMap[p]) return projectMap[p];
        return p;
      })
      .filter((p) => !hiddenProjects.includes(p));
  }, [projects]);

  function toggleProject(p: string) {
    const next = selectedProjects.includes(p)
      ? selectedProjects.filter((x) => x !== p)
      : [...selectedProjects, p];

    setSelectedProjects(next);
    onChange({ start, end, projects: next });
  }

  function clearAll() {
    setStart("");
    setEnd("");
    setSelectedProjects([]);
    onChange({ start: "", end: "", projects: [] });
  }

  return (
    <div style={styles.container}>
      <div style={styles.dateRow}>
        <div style={styles.field}>
          <label style={styles.label}>Início</label>
          <input
            type="date"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              onChange({ start: e.target.value, end, projects: selectedProjects });
            }}
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Fim</label>
          <input
            type="date"
            value={end}
            onChange={(e) => {
              setEnd(e.target.value);
              onChange({ start, end: e.target.value, projects: selectedProjects });
            }}
            style={styles.input}
          />
        </div>
        <button onClick={clearAll} style={styles.clearButton}>
          Limpar
        </button>
      </div>

      <div style={styles.projectsRow}>
        {cleanProjects.map((p) => {
          const active = selectedProjects.includes(p);
          return (
            <button
              key={p}
              onClick={() => toggleProject(p)}
              style={active ? styles.projectButtonActive : styles.projectButton}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#13131a",
    border: "1px solid #222",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "20px",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  dateRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "12px",
    color: "#ccc",
  },
  input: {
    backgroundColor: "#1a1a22",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "6px 10px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
  },
  projectsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  // estado DESMARCADO (ficava feio antes)
  projectButton: {
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e0e0e0",
    borderRadius: "999px",
    padding: "6px 14px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.15s ease-out",
  },
  // estado MARCADO
  projectButtonActive: {
    backgroundColor: "#ffffff",
    color: "#000",
    border: "1px solid #ffffff",
    borderRadius: "999px",
    padding: "6px 14px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    transition: "all 0.15s ease-out",
  },
  clearButton: {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#f5f5f5",
    borderRadius: "10px",
    padding: "6px 14px",
    fontSize: "12px",
    cursor: "pointer",
    marginLeft: "auto",
  },
};
