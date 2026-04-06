"use client";

import { useEffect, useCallback } from "react";
import { X, Clock, MapPin, Phone, User, FileText, Settings } from "lucide-react";
import { useFestivalStore } from "@/lib/store";
import { CATEGORY_META } from "@/lib/colors";
import { formatTimeRange } from "@/lib/utils";

export function DetailModal() {
  const { detailEventId, closeDetail, festival } = useFestivalStore();

  const event = festival?.days
    .flatMap((d) => d.events)
    .find((e) => e.id === detailEventId);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetail();
    },
    [closeDetail]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!event) return null;

  const meta = CATEGORY_META[event.category];
  const isProduccion = event.category === "produccion";
  const timeRange = formatTimeRange(event.startTime, event.endTime);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) closeDetail(); }}
    >
      <div
        className="w-full max-w-md rounded-lg shadow-xl overflow-hidden"
        style={{
          backgroundColor: isProduccion ? "#1e1e1e" : "white",
          color: isProduccion ? "#F0EEE8" : undefined,
        }}
      >
        {/* Header bar with category color */}
        <div
          className="h-1.5"
          style={{ backgroundColor: meta.accent }}
        />

        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                {isProduccion && <Settings size={14} className="opacity-60" />}
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
              </div>
              <h2 className="font-serif text-lg leading-snug">{event.title}</h2>
            </div>
            <button
              onClick={closeDetail}
              className={`p-1 rounded transition-colors flex-shrink-0 ${
                isProduccion ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
            >
              <X size={16} />
            </button>
          </div>

          <dl className="space-y-3 text-sm">
            {timeRange && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="opacity-50 flex-shrink-0" />
                <span>{timeRange}</span>
              </div>
            )}

            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="opacity-50 flex-shrink-0" />
                <span>{event.venue}</span>
              </div>
            )}

            {event.internalOwner && (
              <div className="flex items-center gap-2">
                <User size={14} className="opacity-50 flex-shrink-0" />
                <span>{event.internalOwner}</span>
              </div>
            )}

            {event.externalContact && (
              <div className="flex items-start gap-2">
                <User size={14} className="opacity-50 flex-shrink-0 mt-0.5" />
                <div>
                  <div>{event.externalContact}</div>
                  {event.externalPhone && (
                    <div className="flex items-center gap-1 text-xs opacity-70 mt-0.5">
                      <Phone size={11} />
                      {event.externalPhone}
                    </div>
                  )}
                </div>
              </div>
            )}

            {event.description && (
              <div className="flex items-start gap-2">
                <FileText size={14} className="opacity-50 flex-shrink-0 mt-0.5" />
                <p className={`text-sm leading-relaxed ${isProduccion ? "opacity-80" : "text-gray-600"}`}>
                  {event.description}
                </p>
              </div>
            )}

            {event.internalNotes && (
              <div
                className={`rounded p-3 mt-2 ${
                  isProduccion
                    ? "bg-white/10 border border-white/20"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isProduccion ? "text-gray-400" : "text-yellow-700"}`}>
                  Notas internas
                </p>
                <p className={`text-sm leading-relaxed ${isProduccion ? "opacity-80" : "text-gray-700"}`}>
                  {event.internalNotes}
                </p>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
