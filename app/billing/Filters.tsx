"use client";

import { useEffect, useState } from "react";

// Garante formato YYYY-MM-DD (input type="date" já usa isso)
function toYMD(s?: string) {
  if (!s) return undefined;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : undefined;
}

export default function Filters({
  onChange,
}: {
  onChange: (v: { start?: string; end?: string; project?: string }) => void;
}) {
  const [start, setStart] = useState<string | undefined>();
  const [end, setEnd] = useState<string | undefined>();
  const [project, setProject] = useState<string | undefined>();

  useEffect(() => {
    onChange({ start, end, project });
  }, [start, end, project, onChange]);

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        <label className="field">
          <div className="field-label">Início</div>
          {/** O calendário nativo aparece com type="date" */}
          <input
            type="date"
            value={start ?? ""}
            onChange={(e) => setStart(toYMD(e.target.value))}
            className="input"
          />
        </label>
        <label className="field">
          <div className="field-label">Fim</div>
          <input
            type="date"
            value={end ?? ""}
            onChange={(e) => setEnd(toYMD(e.target.value))}
            className="input"
          />
        </label>
        <label className="field">
          <div className="field-label">Projeto</div>
          <input
            placeholder="ex.: meu-projeto"
            value={project ?? ""}
            onChange={(e) => setProject(e.target.value || undefined)}
            className="input"
          />
        </label>
      </div>
    </div>
  );
}
