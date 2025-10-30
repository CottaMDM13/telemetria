"use client";

import { useEffect, useState } from "react";
import BillingFilters from "@/components/BillingFilters";
import DailyCostsChart from "@/components/DailyCostsChart";
import ServiceCostsChart from "@/components/ServiceCostsChart";

export default function BillingPage() {
  const [filters, setFilters] = useState<{ start?: string; end?: string; projects?: string[] }>({});
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);

  // fetch once to discover projects
  useEffect(() => {
    fetch("/api/daily-costs")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          const projects = Array.from(new Set(data.data.map((x: any) => x.project_name))).sort();
          setAvailableProjects(projects);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Custos</h1>
          <p className="text-sm text-white/50">Filtre por projeto, período e veja totais combinados no próprio front.</p>
        </div>
      </div>

      <BillingFilters onChange={setFilters} projects={availableProjects} />

      <div className="grid gap-6 md:grid-cols-2">
        <DailyCostsChart filters={filters} />
        <ServiceCostsChart filters={filters} />
      </div>
    </main>
  );
}
