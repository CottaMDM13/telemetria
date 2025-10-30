"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type ProjetoApi = {
  id: number;
  name: string;
  githubUrl: string | null;
  hostingUrl: string | null;
  author: string | null;
  apiKeyName: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProjetoForm = {
  nome: string;
  github: string;
  hospedagem: string;
  autor: string;
  apiKey: string;
};

const apiKeyOptions = ["Projeto Desenvolve", ".Edu"]; // mesmos nomes do dashboard

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<ProjetoApi[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProjetoForm>({
    nome: "",
    github: "",
    hospedagem: "",
    autor: "",
    apiKey: apiKeyOptions[0],
  });
  const [loading, setLoading] = useState(false);

  // 1) carrega do backend
  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setProjetos(json.data as ProjetoApi[]);
      } else {
        console.error("Erro ao carregar projetos", json.error);
      }
    } catch (err) {
      console.error("Erro ao buscar projetos", err);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  function resetForm() {
    setForm({
      nome: "",
      github: "",
      hospedagem: "",
      autor: "",
      apiKey: apiKeyOptions[0],
    });
    setEditId(null);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setLoading(true);

    // mapeia do front -> backend
    const payload = {
      name: form.nome,
      githubUrl: form.github || null,
      hostingUrl: form.hospedagem || null,
      author: form.autor || null,
      apiKeyName: form.apiKey,
    };

    try {
      if (editId !== null) {
        // edição
        await fetch(`/api/projects/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // criação
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      await fetchProjects();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Erro ao salvar projeto", err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(proj: ProjetoApi) {
    setShowForm(true);
    setEditId(proj.id);
    setForm({
      nome: proj.name,
      github: proj.githubUrl ?? "",
      hospedagem: proj.hostingUrl ?? "",
      autor: proj.author ?? "",
      apiKey: proj.apiKeyName,
    });
  }

  async function handleDelete(id: number) {
    setLoading(true);
    try {
      await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      await fetchProjects();
      if (editId === id) {
        resetForm();
        setShowForm(false);
      }
    } catch (err) {
      console.error("Erro ao deletar", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        fontFamily: "Inter, sans-serif",
        color: "#fff",
      }}
    >
      {/* topo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            Projetos
          </h1>
          <p style={{ color: "#9ca3af" }}>
            Cadastre e gerencie seus projetos ligados às API Keys do dashboard.
          </p>
        </div>
        <Link href="/">
          <button style={secondaryButton}>← Voltar</button>
        </Link>
      </div>

      {/* botão de criar */}
      <div>
        <button
          onClick={() => {
            if (showForm && editId === null) {
              setShowForm(false);
              return;
            }
            resetForm();
            setShowForm((prev) => !prev);
          }}
          style={primaryButton}
        >
          {showForm ? "Fechar formulário" : "Criar novo projeto +"}
        </button>
      </div>

      {/* card de formulário (abre/fecha) */}
      {showForm && (
        <div style={formCard}>
          <h2
            style={{
              margin: 0,
              marginBottom: 14,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {editId ? "Editar projeto" : "Novo projeto"}
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            {/* nome */}
            <div style={{ ...fieldContainer, flex: "1 1 240px" }}>
              <label style={labelStyle}>Nome do projeto *</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex.: Portal Alunos IA"
                style={inputStyle}
                required
              />
            </div>

            {/* github */}
            <div style={{ ...fieldContainer, flex: "1 1 240px" }}>
              <label style={labelStyle}>Link do GitHub</label>
              <input
                name="github"
                value={form.github}
                onChange={handleChange}
                placeholder="https://github.com/..."
                style={inputStyle}
                type="url"
              />
            </div>

            {/* hospedagem */}
            <div style={{ ...fieldContainer, flex: "1 1 240px" }}>
              <label style={labelStyle}>Link de hospedagem</label>
              <input
                name="hospedagem"
                value={form.hospedagem}
                onChange={handleChange}
                placeholder="https://app.seudominio.com"
                style={inputStyle}
                type="url"
              />
            </div>

            {/* quem fez */}
            <div style={{ ...fieldContainer, flex: "1 1 200px" }}>
              <label style={labelStyle}>Quem fez</label>
              <input
                name="autor"
                value={form.autor}
                onChange={handleChange}
                placeholder="Ex.: Eduardo, Alex..."
                style={inputStyle}
              />
            </div>

            {/* api key */}
            <div style={{ ...fieldContainer, flex: "1 1 200px" }}>
              <label style={labelStyle}>API Key utilizada</label>
              <select
                name="apiKey"
                value={form.apiKey}
                onChange={handleChange}
                style={selectStyle}
              >
                {apiKeyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* ações */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <button type="submit" style={primaryButton} disabled={loading}>
                {editId ? "Salvar alterações" : "Salvar projeto"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                style={ghostButton}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* lista de projetos */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          Projetos cadastrados
        </h2>

        {projetos.length === 0 ? (
          <p style={{ color: "#8f9097", fontSize: 13 }}>
            Nenhum projeto cadastrado ainda.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "14px",
            }}
          >
            {projetos.map((proj) => (
              <div key={proj.id} style={projectCard}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                    {proj.name}
                  </h3>
                  <span style={apiKeyPill}>{proj.apiKeyName}</span>
                </div>

                {proj.githubUrl ? (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={linkStyle}
                  >
                    GitHub: {proj.githubUrl}
                  </a>
                ) : null}

                {proj.hostingUrl ? (
                  <a
                    href={proj.hostingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={linkStyle}
                  >
                    Hospedagem: {proj.hostingUrl}
                  </a>
                ) : null}

                {proj.author ? (
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: 12,
                      color: "#d1d5db",
                    }}
                  >
                    Quem fez: <strong>{proj.author}</strong>
                  </p>
                ) : null}

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => handleEdit(proj)} style={smallButton}>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    style={dangerButton}
                    disabled={loading}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* estilos base */

const primaryButton: React.CSSProperties = {
  background: "linear-gradient(90deg, #00eaff 0%, #007bff 100%)",
  color: "#000",
  border: "none",
  borderRadius: 10,
  padding: "8px 16px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 13,
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
};

const secondaryButton: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: "7px 14px",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
};

const ghostButton: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 8,
  padding: "6px 12px",
  color: "#fff",
  cursor: "pointer",
  fontSize: 12,
};

const formCard: React.CSSProperties = {
  background: "#13131a",
  border: "1px solid #222",
  borderRadius: 16,
  padding: 18,
};

const fieldContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#d1d5db",
};

const inputStyle: React.CSSProperties = {
  background: "#1a1a22",
  border: "1px solid #333",
  borderRadius: 8,
  padding: "7px 10px",
  color: "#fff",
  fontSize: 13,
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  background: "#1a1a22",
  border: "1px solid #333",
  borderRadius: 8,
  padding: "7px 10px",
  color: "#fff",
  fontSize: 13,
  outline: "none",
};

const projectCard: React.CSSProperties = {
  background: "rgba(19,19,26,0.9)",
  border: "1px solid rgba(255,255,255,0.03)",
  borderRadius: 14,
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const apiKeyPill: React.CSSProperties = {
  background: "rgba(0,234,255,0.08)",
  border: "1px solid rgba(0,234,255,0.3)",
  borderRadius: 999,
  padding: "2px 10px",
  fontSize: 11,
  color: "#e2e8f0",
};

const linkStyle: React.CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  textDecoration: "none",
};

const smallButton: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 8,
  padding: "5px 10px",
  color: "#fff",
  cursor: "pointer",
  fontSize: 11,
};

const dangerButton: React.CSSProperties = {
  background: "rgba(255,0,76,0.12)",
  border: "1px solid rgba(255,0,76,0.4)",
  borderRadius: 8,
  padding: "5px 10px",
  color: "#fff",
  cursor: "pointer",
  fontSize: 11,
};
