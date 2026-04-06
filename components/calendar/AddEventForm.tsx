"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useFestivalStore } from "@/lib/store";
import { CATEGORIES, CATEGORY_META, PUBLIC_CATEGORIES } from "@/lib/colors";
import type { Category } from "@prisma/client";

type Props = {
  dayId: string;
  mode: "public" | "produccion";
  onClose: () => void;
};

export function AddEventForm({ dayId, mode, onClose }: Props) {
  const { addEvent, festival } = useFestivalStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isProduccion = mode === "produccion";
  const defaultCategory: Category = isProduccion ? "produccion" : "cultural";

  const teamMembers = festival?.teamMembers ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    const body = {
      dayId,
      title: fd.get("title") as string,
      category: (fd.get("category") as Category) ?? defaultCategory,
      isInternal: isProduccion,
      startTime: fd.get("startTime") || undefined,
      endTime: fd.get("endTime") || undefined,
      venue: fd.get("venue") || undefined,
      internalOwner: fd.get("internalOwner") || undefined,
      internalNotes: fd.get("internalNotes") || undefined,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al crear evento");
      } else {
        addEvent(data);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      className={`mt-2 rounded p-3 border text-xs ${
        isProduccion
          ? "bg-[#222] border-[#444] text-[#F0EEE8]"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`font-medium text-[11px] uppercase tracking-wide ${isProduccion ? "text-gray-400" : "text-gray-500"}`}>
          {isProduccion ? "⚙ Tarea de producción" : "+ Evento"}
        </span>
        <button type="button" onClick={onClose} className="opacity-50 hover:opacity-100">
          <X size={12} />
        </button>
      </div>

      {/* Title */}
      <input
        name="title"
        type="text"
        required
        autoFocus
        placeholder={isProduccion ? "Descripción de la tarea…" : "Nombre del evento…"}
        className={`w-full rounded px-2 py-1 mb-2 text-xs focus:outline-none focus:ring-1 ${
          isProduccion
            ? "bg-[#333] border border-[#555] text-white placeholder-gray-500 focus:ring-gray-400"
            : "border border-gray-300 focus:ring-[#3C3489]"
        }`}
      />

      {/* Category selector (public only) */}
      {!isProduccion && (
        <select
          name="category"
          defaultValue={defaultCategory}
          className="w-full rounded px-2 py-1 mb-2 text-xs border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
        >
          {PUBLIC_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_META[cat].label}
            </option>
          ))}
        </select>
      )}

      {/* Time range (public only) */}
      {!isProduccion && (
        <div className="flex gap-2 mb-2">
          <input
            name="startTime"
            type="time"
            placeholder="Inicio"
            className="flex-1 rounded px-2 py-1 text-xs border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
          />
          <input
            name="endTime"
            type="time"
            placeholder="Fin"
            className="flex-1 rounded px-2 py-1 text-xs border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
          />
        </div>
      )}

      {/* Venue (public only) */}
      {!isProduccion && (
        <input
          name="venue"
          type="text"
          placeholder="Lugar / escenario"
          className="w-full rounded px-2 py-1 mb-2 text-xs border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
        />
      )}

      {/* Internal owner (produccion only) */}
      {isProduccion && (
        <>
          {teamMembers.length > 0 ? (
            <select
              name="internalOwner"
              className="w-full rounded px-2 py-1 mb-2 text-xs bg-[#333] border border-[#555] text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">Sin asignar</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} {m.role ? `— ${m.role}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              name="internalOwner"
              type="text"
              placeholder="Responsable"
              className="w-full rounded px-2 py-1 mb-2 text-xs bg-[#333] border border-[#555] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          )}
          <textarea
            name="internalNotes"
            placeholder="Notas internas…"
            rows={2}
            className="w-full rounded px-2 py-1 mb-2 text-xs bg-[#333] border border-[#555] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
          />
        </>
      )}

      {error && (
        <p className="text-red-400 text-[10px] mb-1">{error}</p>
      )}

      <div className="flex justify-end gap-1.5">
        <button
          type="button"
          onClick={onClose}
          className={`text-xs px-2 py-1 rounded ${isProduccion ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`text-xs px-3 py-1 rounded transition-colors disabled:opacity-60 ${
            isProduccion
              ? "bg-gray-600 text-white hover:bg-gray-500"
              : "bg-[#3C3489] text-white hover:bg-[#322d70]"
          }`}
        >
          {loading ? "…" : "Agregar"}
        </button>
      </div>
    </form>
  );
}
