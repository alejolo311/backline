import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FestivalSettingsClient } from "@/components/settings/FestivalSettingsClient";

export const dynamic = "force-dynamic";
type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const festival = await prisma.festival.findUnique({ where: { id: params.id } });
  return { title: `Configuración — ${festival?.name ?? "Festival"}` };
}

export default async function SettingsPage({ params }: Props) {
  const festival = await prisma.festival.findUnique({ where: { id: params.id } });
  if (!festival) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a
          href={`/festival/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-[#5A8F8B] hover:text-[#2BADA0] transition-colors"
        >
          ← {festival.name}
        </a>
      </div>
      <h1 className="font-serif text-2xl text-[#0F1C34] mb-6">Configuración del festival</h1>
      <FestivalSettingsClient festival={festival} />
    </div>
  );
}
