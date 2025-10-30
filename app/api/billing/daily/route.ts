import { NextRequest } from "next/server";
import { bigquery } from "@/lib/bigquery";

export const runtime = "nodejs";

// valida YYYY-MM-DD
function isYMD(s?: string | null) {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function env(name: string, fallback?: string) {
  const v = process.env[name];
  return v && v.length ? v : fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // tabela atual
  const tablePath = env("BQ_TABLE_PATH");
  if (!tablePath) {
    return new Response(JSON.stringify({ error: "Missing BQ_TABLE_PATH" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  // campos atuais do export de billing
  const dateField = env("BQ_DATE_FIELD", "usage_start_time");
  const costField = env("BQ_COST_FIELD", "cost");
  const projectField = env("BQ_PROJECT_FIELD", "project.name");
  const location = env("BQ_LOCATION", "US");
  const maximumBytesBilled = String(5 * 1024 * 1024 * 1024);

  const where: string[] = [];
  const params: Record<string, any> = {};

  if (isYMD(start)) {
    where.push(`DATE(${dateField}) >= @start`);
    params.start = start;
  }
  if (isYMD(end)) {
    where.push(`DATE(${dateField}) <= @end`);
    params.end = end;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Aqui a mágica: somo por dia + projeto
  const query = `
    SELECT
      CAST(DATE(${dateField}) AS STRING) AS date,
      ${projectField} AS project_name,
      SUM(${costField}) AS cost
    FROM \`${tablePath}\`
    ${whereSql}
    GROUP BY 1, 2
    ORDER BY 1, 2
  `;

  try {
    const [rows] = await bigquery.query({
      query,
      params,
      location,
      maximumBytesBilled,
    });

    // normaliza
    const normalized = Array.isArray(rows)
      ? rows.map((r: any) => ({
          date: String(r?.date ?? r?.f0_ ?? ""),
          project_name: String(r?.project_name ?? r?.f1_ ?? ""),
          cost: Number(r?.cost ?? r?.f2_ ?? 0),
        }))
      : [];

    return new Response(JSON.stringify(normalized), {
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("BigQuery Error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "BigQuery query failed" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
