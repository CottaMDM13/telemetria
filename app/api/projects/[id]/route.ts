// app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: { id: string };
};

export async function PATCH(req: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ ok: false, error: "id inválido" }, { status: 400 });
  }

  const body = await req.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: body.name,
      githubUrl: body.githubUrl,
      hostingUrl: body.hostingUrl,
      author: body.author,
      apiKeyName: body.apiKeyName,
    },
  });

  return NextResponse.json({ ok: true, data: project });
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ ok: false, error: "id inválido" }, { status: 400 });
  }

  await prisma.project.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
