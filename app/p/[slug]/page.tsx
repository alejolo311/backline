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
  const festival = await prisma.festival.findUnique({ where: { slug: params.slug } });
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
    <div className="min-h-screen bg-[#f7fafb]">
      {/* Print / PDF button */}
      <div className="no-print fixed bottom-5 right-5 z-50">
        <button
          onClick={() => window.print()}
          className="text-white text-sm px-4 py-2 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #2BADA0, #3575B0)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Imprimir / PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Festival header */}
        <header className="mb-10 pb-8 border-b border-[#d0e8e5]">
          {/* Gradient accent bar */}
          <div
            className="h-1 rounded-full mb-6 w-16"
            style={{ background: "linear-gradient(90deg, #4DD5BB, #3575B0)" }}
          />
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full ring-2 ring-white ring-offset-1"
              style={{ backgroundColor: festival.coverColor }}
            />
            {festival.location && (
              <span className="text-sm text-[#5A8F8B] flex items-center gap-1">
                <MapPin size={12} />
                {festival.location}
              </span>
            )}
          </div>
          <h1 className="font-serif text-4xl font-normal tracking-tight text-[#0F1C34]">
            {festival.name}
          </h1>
          <p className="text-lg text-[#5A8F8B] mt-2 font-serif">
            {format(festival.startDate, "d 'de' MMMM", { locale: es })} –{" "}
            {format(festival.endDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          {festival.description && (
            <p className="mt-3 text-[#2D5052] leading-relaxed max-w-xl">
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
                <div className="flex items-baseline gap-3 mb-6">
                  <h2 className="font-serif text-2xl text-[#0F1C34]">
                    {day.label ?? format(day.date, "EEEE d 'de' MMMM", { locale: es })}
                  </h2>
                  <span className="text-sm text-[#8BBDB9]">
                    {format(day.date, "EEEE d MMM", { locale: es })}
                  </span>
                </div>

                <div className="space-y-4">
                  {eventsForDay.map((event) => {
                    const meta = CATEGORY_META[event.category];
                    const timeRange = formatTimeRange(event.startTime, event.endTime);

                    return (
                      <article key={event.id} className="flex gap-4">
                        {/* Left accent stripe */}
                        <div
                          className="w-[3px] rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: meta.accent, minHeight: "40px" }}
                        />

                        <div className="flex-1 pb-4 border-b border-[#e8f4f2]">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <h3 className="font-serif text-lg text-[#0F1C34] leading-snug">
                                {event.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
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
                                  <span className="flex items-center gap-1 text-xs text-[#5A8F8B]">
                                    <Clock size={11} />
                                    {timeRange}
                                  </span>
                                )}
                                {event.venue && (
                                  <span className="flex items-center gap-1 text-xs text-[#5A8F8B]">
                                    <MapPin size={11} />
                                    {event.venue}
                                  </span>
                                )}
                              </div>
                            </div>

                            {(event.externalContact || event.externalPhone) && (
                              <div className="text-xs text-[#5A8F8B] text-right">
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
                            <p className="text-sm text-[#2D5052] mt-2 leading-relaxed max-w-2xl">
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
        <footer className="mt-16 pt-8 border-t border-[#d0e8e5] flex items-center justify-between">
          <p className="text-xs text-[#8BBDB9]">Programa generado con Encore</p>
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="footer-g" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#4DD5BB" />
                  <stop offset="1" stopColor="#3575B0" />
                </linearGradient>
              </defs>
              <path d="M6 6 L14 6 L6 14 Z M18 18 L26 26 L18 26 Z M8 24 L24 8" stroke="url(#footer-g)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-serif text-brand-gradient">Encore</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
