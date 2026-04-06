import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateFestivalSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const festival = await prisma.festival.findUnique({
    where: { id: params.id },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: {
          events: { orderBy: { order: "asc" } },
          dayNote: true,
        },
      },
      teamMembers: { orderBy: { name: "asc" } },
    },
  });

  if (!festival) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(festival);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateFestivalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updated = await prisma.festival.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.festival.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
