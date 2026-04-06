import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { reorderEventsSchema } from "@/lib/validators";

// Batch update order + dayId for all affected events after a drag
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = reorderEventsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Run all updates in a single transaction
  await prisma.$transaction(
    parsed.data.events.map(({ id, order, dayId }) =>
      prisma.event.update({
        where: { id },
        data: { order, dayId },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
