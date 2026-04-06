import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CATEGORY_META } from "@/lib/colors";
import { formatTimeRange } from "@/lib/utils";
import { MapPin, Clock, User, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const festival = await prisma.festival.findUnique({
    where: { slug: params.slug },
  });
  if (!festival) return { title: "Programa no encontrado" };
  return {
    title: `Programa — ${festival.name}`,
    description: festival.description ?? undefined,
  };
}

export default async function PublicProgramPage({ params }: Props) {
  const festival = await prisma.festival.findUnique({
    where: { slug: params.slug },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: {
          events: {
            where: { isInternal: false, category: { not: "produccion" } },
            orderBy: [{ startTime: "asc" }, { order: "asc" }],
          },
        },
      },
    },
  });

  if (!festival) notFound();

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Print / PDF button — hidden in print */}
      <div className="no-print fixed bottom-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimir / PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Festival header */}
        <header className="mb-10 border-b border-gray-200 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: festival.coverColor }}
            />
            {festival.location && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin size={12} />
                {festival.location}
              </span>
            )}
          </div>
          <h1
            className="font-serif text-4xl font-normal tracking-tight text-gray-900"
          >
            {festival.name}
          </h1>
          <p className="text-lg text-gray-500 mt-2 font-serif">
            {format(festival.startDate, "d 'de' MMMM", { locale: es })} –{" "}
            {format(festival.endDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          {festival.description && (
            <p className="mt-3 text-gray-600 leading-relaxed max-w-xl">
              {festival.description}
            </p>
          )}
        </header>

        {/* Days */}
        <div className="space-y-12">
          {festival.days.map((day) => {
            const eventsForDay = day.events;
            if (eventsForDay.length === 0) return null;

            return (
              <section key={day.id} className="print-page-break">
                {/* Day heading */}
                <div className="flex items-baseline gap-3 mb-6">
                  <h2 className="font-serif text-2xl text-gray-900">
                    {day.label ??
                      format(day.date, "EEEE d 'de' MMMM", { locale: es })}
                  </h2>
                  <span className="text-sm text-gray-400">
                    {format(day.date, "EEEE d MMM", { locale: es })}
                  </span>
                </div>

                {/* Events list */}
                <div className="space-y-4">
                  {eventsForDay.map((event) => {
                    const meta = CATEGORY_META[event.category];
                    const timeRange = formatTimeRange(event.startTime, event.endTime);

                    return (
                      <article
                        key={event.id}
                        className="flex gap-4 group"
                      >
                        {/* Left accent stripe */}
                        <div
                          className="w-1 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: meta.accent, minHeight: "40px" }}
                        />

                        <div className="flex-1 pb-4 border-b border-gray-100">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <h3 className="font-serif text-lg text-gray-900 leading-snug">
                                {event.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {/* Category pill */}
                                <span
                                  className="badge-category"
                                  style={{
                                    backgroundColor: meta.bg,
                                    color: meta.text,
                                    border: `1px solid ${meta.border}`,
                                  }}
                                >
                                  {meta.label}
                                </span>
                                {timeRange && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock size={11} />
                                    {timeRange}
                                  </span>
                                )}
                                {event.venue && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin size={11} />
                                    {event.venue}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Contact info */}
                            {(event.externalContact || event.externalPhone) && (
                              <div className="text-xs text-gray-500 text-right">
                                {event.externalContact && (
                                  <div className="flex items-center gap-1 justify-end">
                                    <User size={10} />
                                    {event.externalContact}
                                  </div>
                                )}
                                {event.externalPhone && (
                                  <div className="flex items-center gap-1 justify-end mt-0.5">
                                    <Phone size={10} />
                                    {event.externalPhone}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {event.description && (
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-2xl">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Programa generado con Encore</p>
        </footer>
      </div>
    </div>
  );
}
