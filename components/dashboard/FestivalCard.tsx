"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import type { Festival } from "@prisma/client";
import type { FestivalStatus } from "@/lib/utils";

const STATUS_LABELS: Record<FestivalStatus, { label: string; color: string }> = {
  active: { label: "En curso", color: "bg-green-100 text-green-700 border-green-200" },
  upcoming: { label: "Próximo", color: "bg-blue-100 text-blue-700 border-blue-200" },
  past: { label: "Pasado", color: "bg-gray-100 text-gray-500 border-gray-200" },
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:border-gray-300 transition-colors group">
      {/* Color dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: festival.coverColor }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <h3 className="font-serif text-base text-gray-900 leading-tight">
            {festival.name}
          </h3>
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs border ${color}`}
          >
            {label}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
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
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          title="Ver programa público"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={14} />
        </Link>
        <Link
          href={`/festival/${festival.id}`}
          className="text-sm text-[#3C3489] hover:text-[#322d70] font-medium transition-colors"
        >
          Abrir →
        </Link>
      </div>
    </div>
  );
}
