import { NextRequest, NextResponse } from "next/server";
import { getServiceCostsByProject } from "@/lib/bigquery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// valida YYYY-MM-DD
function isYMD(s?: string | null) {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const startDate = isYMD(start) ? start! : undefined;
  const endDate = isYMD(end) ? end! : undefined;

  try {
    const rows = await getServiceCostsByProject(startDate, endDate);

    // normaliza para o formato que o front está usando
    const data = Array.isArray(rows)
      ? rows.map((r: any) => ({
          project_name: String(r.project_name ?? ""),
          service_name: String(r.service_name ?? ""),
          total_cost: Number(r.total_cost ?? 0),
        }))
      : [];

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error("[GET /api/billing/services] error", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Erro ao consultar BigQuery" },
      { status: 500 }
    );
  }
}
