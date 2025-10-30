// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, data: projects });
}

export async function POST(req: Request) {
  const body = await req.json();

  // validações rápidas
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
    },
  });

  return NextResponse.json({ ok: true, data: project }, { status: 201 });
}
