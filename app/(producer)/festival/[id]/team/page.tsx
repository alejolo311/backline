import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TeamClient } from "@/components/team/TeamClient";

export const dynamic = "force-dynamic";
type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const festival = await prisma.festival.findUnique({ where: { id: params.id } });
  return { title: `Equipo — ${festival?.name ?? "Festival"}` };
}

export default async function TeamPage({ params }: Props) {
  const festival = await prisma.festival.findUnique({
    where: { id: params.id },
    include: { teamMembers: { orderBy: { name: "asc" } } },
  });

  if (!festival) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <a href={`/festival/${params.id}`} className="text-sm text-gray-400 hover:text-gray-600">
          ← {festival.name}
        </a>
      </div>
      <h1 className="font-serif text-2xl mb-6">Equipo</h1>
      <TeamClient festivalId={params.id} initialMembers={festival.teamMembers} />
    </div>
  );
}
