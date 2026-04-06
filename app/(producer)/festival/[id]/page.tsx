import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarBoard } from "@/components/calendar/CalendarBoard";
import { FestivalHeader } from "@/components/calendar/FestivalHeader";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const festival = await prisma.festival.findUnique({ where: { id: params.id } });
  return { title: festival?.name ?? "Festival" };
}

export default async function FestivalPage({ params }: Props) {
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

  if (!festival) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      <FestivalHeader festival={festival} />
      <CalendarBoard festival={festival} />
    </div>
  );
}
