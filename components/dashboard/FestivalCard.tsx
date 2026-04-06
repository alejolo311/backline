"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import type { Festival } from "@prisma/client";
import type { FestivalStatus } from "@/lib/utils";

const STATUS_LABELS: Record<FestivalStatus, { label: string; color: string }> = {
  active: {
    label: "En curso",
    color: "bg-[#E0F5F0] text-[#0A4A42] border-[#2BADA0]/30",
  },
  upcoming: {
    label: "Próximo",
    color: "bg-[#EBF3FD] text-[#1E3A8A] border-[#90A9E8]/40",
  },
  past: {
    label: "Pasado",
    color: "bg-[#f0f3f5] text-[#5A8F8B] border-[#c8e0dd]",
  },
};

export function FestivalCard({
  festival,
  status,
}: {
  festival: Festival;
  status: FestivalStatus;
}) {
  const { label, color } = STATUS_LABELS[status];

  return (
    <div className="bg-white border border-[#d0e8e5] rounded-xl p-4 flex items-center gap-4 hover:border-[#2BADA0]/50 hover:shadow-[0_2px_12px_rgba(43,173,160,0.1)] transition-all group">
      {/* Color dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white ring-offset-1"
        style={{ backgroundColor: festival.coverColor }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <h3 className="font-serif text-base text-[#0F1C34] leading-tight">
            {festival.name}
          </h3>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border font-medium ${color}`}>
            {label}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs text-[#5A8F8B] flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {format(festival.startDate, "d MMM", { locale: es })} –{" "}
            {format(festival.endDate, "d MMM yyyy", { locale: es })}
          </span>
          {festival.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {festival.location}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/p/${festival.slug}`}
          target="_blank"
          className="text-[#5A8F8B] hover:text-[#2BADA0] transition-colors p-1.5 rounded-lg hover:bg-[#E0F5F0]"
          title="Ver programa público"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={13} />
        </Link>
        <Link
          href={`/festival/${festival.id}`}
          className="text-sm text-[#2BADA0] hover:text-[#1F8A7E] font-medium transition-colors"
        >
          Abrir →
        </Link>
      </div>
    </div>
  );
}
