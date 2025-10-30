import { NextResponse } from "next/server";
import { getDailyCostsByProject } from "@/lib/bigquery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start") || undefined;
  const end = searchParams.get("end") || undefined;

  try {
    const rows = await getDailyCostsByProject(start, end);
    return NextResponse.json({ ok: true, data: rows });
  } catch (error: any) {
    console.error("[daily-costs] error", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
