"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Settings, Users, ExternalLink, Download } from "lucide-react";
import type { Festival } from "@prisma/client";

export function FestivalHeader({ festival }: { festival: Festival }) {
  function handleExportJSON() {
    fetch(`/api/festivals/${festival.id}`)
      .then((r) => r.json())
      .then((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${festival.slug}-backup.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  const navBtn = "flex items-center gap-1 text-xs text-[#5A8F8B] hover:text-[#2BADA0] px-2 py-1.5 rounded-lg hover:bg-[#E0F5F0] transition-colors";

  return (
    <div className="border-b border-[#d0e8e5] bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
      {/* Festival color dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white ring-offset-1"
        style={{ backgroundColor: festival.coverColor }}
      />

      <div className="flex-1 min-w-0">
        <h1 className="font-serif text-base font-normal truncate leading-tight text-[#0F1C34]">
          {festival.name}
        </h1>
        <p className="text-xs text-[#5A8F8B]">
          {format(festival.startDate, "d MMM", { locale: es })} –{" "}
          {format(festival.endDate, "d MMM yyyy", { locale: es })}
          {festival.location && ` · ${festival.location}`}
        </p>
      </div>

      <div className="flex items-center gap-0.5">
        <Link
          href={`/p/${festival.slug}`}
          target="_blank"
          className={navBtn}
          title="Ver programa público"
        >
          <ExternalLink size={13} />
          <span className="hidden sm:inline">Programa</span>
        </Link>

        <button onClick={handleExportJSON} className={navBtn} title="Exportar JSON">
          <Download size={13} />
          <span className="hidden sm:inline">Exportar</span>
        </button>

        <Link href={`/festival/${festival.id}/team`} className={navBtn}>
          <Users size={13} />
          <span className="hidden sm:inline">Equipo</span>
        </Link>

        <Link href={`/festival/${festival.id}/settings`} className={navBtn}>
          <Settings size={13} />
          <span className="hidden sm:inline">Config</span>
        </Link>
      </div>
    </div>
  );
}
