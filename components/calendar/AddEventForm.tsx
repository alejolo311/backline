"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useFestivalStore } from "@/lib/store";
import { CATEGORY_META, PUBLIC_CATEGORIES } from "@/lib/colors";
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

  if (isProduccion) {
    // Dark navy form for internal tasks
    return (
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
        className="mt-2 rounded-lg p-3 border text-xs bg-[#0F1C34] border-[#1F3558] text-[#E8F4F2]"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-[11px] uppercase tracking-wide text-[#2BADA0]">
            ⚙ Producción
          </span>
          <button type="button" onClick={onClose} className="text-[#5A8F8B] hover:text-[#E8F4F2]">
            <X size={12} />
          </button>
        </div>

        <input
          name="title"
          type="text"
          required
          autoFocus
          placeholder="Descripción de la tarea…"
          className="w-full rounded-lg px-2 py-1 mb-2 text-xs bg-[#1A2E4A] border border-[#2BADA0]/30 text-[#E8F4F2] placeholder-[#5A8F8B] focus:outline-none focus:ring-1 focus:ring-[#2BADA0]"
        />

        {teamMembers.length > 0 ? (
          <select
            name="internalOwner"
            className="w-full rounded-lg px-2 py-1 mb-2 text-xs bg-[#1A2E4A] border border-[#2BADA0]/30 text-[#E8F4F2] focus:outline-none focus:ring-1 focus:ring-[#2BADA0]"
          >
            <option value="">Sin asignar</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}{m.role ? ` — ${m.role}` : ""}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="internalOwner"
            type="text"
            placeholder="Responsable"
            className="w-full rounded-lg px-2 py-1 mb-2 text-xs bg-[#1A2E4A] border border-[#2BADA0]/30 text-[#E8F4F2] placeholder-[#5A8F8B] focus:outline-none focus:ring-1 focus:ring-[#2BADA0]"
          />
        )}

        <textarea
          name="internalNotes"
          placeholder="Notas internas…"
          rows={2}
          className="w-full rounded-lg px-2 py-1 mb-2 text-xs bg-[#1A2E4A] border border-[#2BADA0]/30 text-[#E8F4F2] placeholder-[#5A8F8B] focus:outline-none focus:ring-1 focus:ring-[#2BADA0] resize-none"
        />

        {error && <p className="text-red-400 text-[10px] mb-1">{error}</p>}

        <div className="flex justify-end gap-1.5">
          <button type="button" onClick={onClose} className="text-xs px-2 py-1 text-[#5A8F8B] hover:text-[#E8F4F2]">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="text-xs px-3 py-1 rounded-lg text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #2BADA0, #3575B0)" }}
          >
            {loading ? "…" : "Agregar"}
          </button>
        </div>
      </form>
    );
  }

  // Light form for public events
  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      className="mt-2 rounded-lg p-3 border text-xs bg-white border-[#d0e8e5] shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-[11px] uppercase tracking-wide text-[#2BADA0]">
          + Evento
        </span>
        <button type="button" onClick={onClose} className="text-[#8BBDB9] hover:text-[#0F1C34]">
          <X size={12} />
        </button>
      </div>

      <input
        name="title"
        type="text"
        required
        autoFocus
        placeholder="Nombre del evento…"
        className="w-full rounded-lg px-2 py-1 mb-2 text-xs border border-[#c8e0dd] focus:outline-none focus:ring-1 focus:ring-[#2BADA0] focus:border-[#2BADA0] bg-white"
      />

      <select
        name="category"
        defaultValue={defaultCategory}
        className="w-full rounded-lg px-2 py-1 mb-2 text-xs border border-[#c8e0dd] focus:outline-none focus:ring-1 focus:ring-[#2BADA0] bg-white"
      >
        {PUBLIC_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{CATEGORY_META[cat].label}</option>
        ))}
      </select>

      <div className="flex gap-2 mb-2">
        <input name="startTime" type="time" className="flex-1 rounded-lg px-2 py-1 text-xs border border-[#c8e0dd] focus:outline-none focus:ring-1 focus:ring-[#2BADA0] bg-white" />
        <input name="endTime" type="time" className="flex-1 rounded-lg px-2 py-1 text-xs border border-[#c8e0dd] focus:outline-none focus:ring-1 focus:ring-[#2BADA0] bg-white" />
      </div>

      <input
        name="venue"
        type="text"
        placeholder="Lugar / escenario"
        className="w-full rounded-lg px-2 py-1 mb-2 text-xs border border-[#c8e0dd] focus:outline-none focus:ring-1 focus:ring-[#2BADA0] bg-white"
      />

      {error && <p className="text-red-500 text-[10px] mb-1">{error}</p>}

      <div className="flex justify-end gap-1.5">
        <button type="button" onClick={onClose} className="text-xs px-2 py-1 text-[#5A8F8B] hover:text-[#0F1C34]">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="text-xs px-3 py-1 rounded-lg text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #4DD5BB, #2BADA0)" }}
        >
          {loading ? "…" : "Agregar"}
        </button>
      </div>
    </form>
  );
}
