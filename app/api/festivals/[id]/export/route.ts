import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Returns full festival data as JSON for download/backup
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

  return new NextResponse(JSON.stringify(festival, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${festival.slug}-backup.json"`,
    },
  });
}
