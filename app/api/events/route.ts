import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createEventSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { dayId, ...rest } = parsed.data;

  // Verify day exists
  const day = await prisma.day.findUnique({ where: { id: dayId } });
  if (!day) return NextResponse.json({ error: "Day not found" }, { status: 404 });

  // Assign order = max existing + 1
  const maxOrder = await prisma.event.aggregate({
    where: { dayId },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? -1) + 1;

  const event = await prisma.event.create({
    data: {
      dayId,
      ...rest,
      startTime: rest.startTime || null,
      endTime: rest.endTime || null,
      order,
      // produccion category implies isInternal
      isInternal: rest.category === "produccion" ? true : rest.isInternal,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
