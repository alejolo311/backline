import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createFestivalSchema } from "@/lib/validators";
import { eachDayOfInterval, parseISO } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const festivals = await prisma.festival.findMany({
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(festivals);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createFestivalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, slug, startDate, endDate, location, description, coverColor } = parsed.data;

  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (end < start) {
    return NextResponse.json({ error: "La fecha de fin debe ser posterior al inicio" }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await prisma.festival.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe un festival con ese slug" }, { status: 409 });
  }

  const festival = await prisma.festival.create({
    data: {
      name,
      slug,
      startDate: start,
      endDate: end,
      location: location ?? null,
      description: description ?? null,
      coverColor: coverColor ?? "#3C3489",
    },
  });

  // Auto-create Day records for each day in the festival range
  const days = eachDayOfInterval({ start, end });
  await prisma.day.createMany({
    data: days.map((date, index) => ({
      festivalId: festival.id,
      date,
      label: `Día ${index + 1}`,
      order: index,
    })),
  });

  return NextResponse.json(festival, { status: 201 });
}
