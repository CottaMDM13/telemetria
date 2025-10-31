import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// export const preferredRegion = "iad1";

// PATCH /api/projects/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  if (Number.isNaN(id)) {
    return NextResponse.json(
      { ok: false, error: "id inválido" },
      { status: 400 }
    );
  }

  const body = await req.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: body.name,
      githubUrl: body.githubUrl ?? null,
      hostingUrl: body.hostingUrl ?? null,
      author: body.author ?? null,
      apiKeyName: body.apiKeyName,
    },
  });

  return NextResponse.json({ ok: true, data: project });
}

// DELETE /api/projects/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  if (Number.isNaN(id)) {
    return NextResponse.json(
      { ok: false, error: "id inválido" },
      { status: 400 }
    );
  }

  await prisma.project.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
