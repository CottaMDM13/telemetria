import { NextRequest, NextResponse } from "next/server";
import { getDailyCostsByProject } from "@/lib/bigquery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // evita cache na Vercel

// valida YYYY-MM-DD
function isYMD(s?: string | null) {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // se vierem datas erradas, ignora e busca tudo
  const startDate = isYMD(start) ? start! : undefined;
  const endDate = isYMD(end) ? end! : undefined;

  try {
    // chama o helper que já monta o query e usa as envs
    const rows = await getDailyCostsByProject(startDate, endDate);

    // normaliza os campos pro front
    const data = rows.map((r) => ({
      day: r.day, // no lib você chamou de "day"
      project_name: r.project_name,
      total_cost: Number(r.total_cost ?? 0),
    }));

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error("[GET /api/billing/daily] BigQuery Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "BigQuery query failed" },
      { status: 500 }
    );
  }
}
