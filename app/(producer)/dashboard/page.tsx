import { prisma } from "@/lib/db";
import { getFestivalStatus } from "@/lib/utils";
import type { Metadata } from "next";
import { FestivalCard } from "@/components/dashboard/FestivalCard";
import { CreateFestivalButton } from "@/components/dashboard/CreateFestivalButton";

export const metadata: Metadata = { title: "Festivales" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const festivals = await prisma.festival.findMany({
    orderBy: { startDate: "desc" },
  });

  const grouped = {
    active: festivals.filter(
      (f) => !f.isArchived && getFestivalStatus(f.startDate, f.endDate) === "active"
    ),
    upcoming: festivals.filter(
      (f) => !f.isArchived && getFestivalStatus(f.startDate, f.endDate) === "upcoming"
    ),
    past: festivals.filter(
      (f) => f.isArchived || getFestivalStatus(f.startDate, f.endDate) === "past"
    ),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-normal">Mis festivales</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {festivals.filter((f) => !f.isArchived).length} activos
          </p>
        </div>
        <CreateFestivalButton />
      </div>

      {grouped.active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
            En curso
          </h2>
          <div className="space-y-3">
            {grouped.active.map((f) => (
              <FestivalCard key={f.id} festival={f} status="active" />
            ))}
          </div>
        </section>
      )}

      {grouped.upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
            Próximos
          </h2>
          <div className="space-y-3">
            {grouped.upcoming.map((f) => (
              <FestivalCard key={f.id} festival={f} status="upcoming" />
            ))}
          </div>
        </section>
      )}

      {grouped.past.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
            Pasados / Archivados
          </h2>
          <div className="space-y-3">
            {grouped.past.map((f) => (
              <FestivalCard key={f.id} festival={f} status="past" />
            ))}
          </div>
        </section>
      )}

      {festivals.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="font-serif text-lg text-gray-400">Sin festivales aún</p>
          <p className="text-sm text-gray-400 mt-1">
            Crea tu primer festival para empezar
          </p>
        </div>
      )}
    </div>
  );
}
