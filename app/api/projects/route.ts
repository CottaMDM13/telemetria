// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, data: projects });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.name || !body.apiKeyName) {
    return NextResponse.json(
      { ok: false, error: "name e apiKeyName são obrigatórios" },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      name: body.name,
      githubUrl: body.githubUrl ?? null,
      hostingUrl: body.hostingUrl ?? null,
      author: body.author ?? null,
      apiKeyName: body.apiKeyName,
      description: body.description ?? null,
      docUrl: body.docUrl ?? null,
    },
  });

  return NextResponse.json({ ok: true, data: project }, { status: 201 });
}
