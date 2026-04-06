"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import type { Event, Category } from "@prisma/client";
import { CATEGORY_META, PUBLIC_CATEGORIES } from "@/lib/colors";

type Props = {
  event: Event;
  onClose: () => void;
  onSave: (updated: Partial<Event>) => void;
};

export function InlineEditForm({ event, onClose, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const isProduccion = event.category === "produccion";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const updates: Partial<Event> = {
      title: fd.get("title") as string,
      startTime: (fd.get("startTime") as string) || null,
      endTime: (fd.get("endTime") as string) || null,
      venue: (fd.get("venue") as string) || null,
      internalOwner: (fd.get("internalOwner") as string) || null,
      internalNotes: (fd.get("internalNotes") as string) || null,
    };
    if (!isProduccion) {
      updates.category = fd.get("category") as Category;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        onSave(data);
      }
    } finally {
      setLoading(false);
    }
  }

  if (isProduccion) {
    return (
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
        className="rounded-lg p-2 border text-xs bg-[#0F1C34] border-[#1F3558] text-[#E8F4F2]"
      >
        <input
          name="title"
          defaultValue={event.title}
          required
          autoFocus
          className="w-full rounded-lg px-2 py-1 mb-1.5 text-xs bg-[#1A2E4A] border border-[#2BADA0]/30 text-[#E8F4F2] focus:outline-none focus:ring-1 focus:ring-[#2BADA0]"
        />
        <input
          name="internalOwner"
          defaultValue={event.internalOwner ?? ""}
          placeholder="Responsable"
          className="w-full rounded-lg px-2 py-1 mb-1.5 text-xs bg-[#1A2E4A] border border-[#2BADA0]/30 text-[#E8F4F2] placeholder-[#5A8F8B] focus:outline-none"
        />
        <textarea
          name="internalNotes"
          defaultValue={event.internalNotes ?? ""}
          placeholder="Notas"
          rows={2}
          className="w-full rounded-lg px-2 py-1 mb-1.5 text-xs bg-[#1A2E4A] border border-[#2BADA0]/30 text-[#E8F4F2] placeholder-[#5A8F8B] resize-none focus:outline-none"
        />
        <div className="flex justify-end gap-1">
          <button type="button" onClick={onClose} className="p-1 text-[#5A8F8B] hover:text-[#E8F4F2]"><X size={11} /></button>
          <button type="submit" disabled={loading} className="p-1 text-[#2BADA0]"><Check size={11} /></button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      className="rounded-lg p-2 border text-xs bg-white border-[#d0e8e5] shadow-sm"
    >
      <input
        name="title"
        defaultValue={event.title}
        required
        autoFocus
        className="w-full rounded-lg px-2 py-1 mb-1.5 text-xs border border-[#c8e0dd] focus:outline-none focus:ring-1 focus:ring-[#2BADA0]"
      />
      <select
        name="category"
        defaultValue={event.category}
        className="w-full rounded-lg px-2 py-1 mb-1.5 text-xs border border-[#c8e0dd] focus:outline-none bg-white"
      >
        {PUBLIC_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{CATEGORY_META[cat].label}</option>
        ))}
      </select>
      <div className="flex gap-1.5 mb-1.5">
        <input name="startTime" type="time" defaultValue={event.startTime ?? ""} className="flex-1 rounded-lg px-2 py-1 text-xs border border-[#c8e0dd] focus:outline-none" />
        <input name="endTime" type="time" defaultValue={event.endTime ?? ""} className="flex-1 rounded-lg px-2 py-1 text-xs border border-[#c8e0dd] focus:outline-none" />
      </div>
      <input
        name="venue"
        defaultValue={event.venue ?? ""}
        placeholder="Lugar"
        className="w-full rounded-lg px-2 py-1 mb-1.5 text-xs border border-[#c8e0dd] focus:outline-none"
      />
      <div className="flex justify-end gap-1">
        <button type="button" onClick={onClose} className="p-1 text-[#8BBDB9] hover:text-[#0F1C34]"><X size={11} /></button>
        <button type="submit" disabled={loading} className="p-1 text-[#2BADA0]"><Check size={11} /></button>
      </div>
    </form>
  );
}
