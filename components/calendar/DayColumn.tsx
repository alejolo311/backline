"use client";

import { useState, useRef, useCallback } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StickyNote, Plus, Settings2 } from "lucide-react";
import type { DayWithRelations } from "@/lib/store";
import { useFestivalStore } from "@/lib/store";
import { EventCard } from "@/components/calendar/EventCard";
import { AddEventForm } from "@/components/calendar/AddEventForm";

type Props = {
  day: DayWithRelations;
  mobile?: boolean;
};

export function DayColumn({ day, mobile = false }: Props) {
  const { setDayNote } = useFestivalStore();
  const [noteOpen, setNoteOpen] = useState(!!day.dayNote?.content);
  const [addMode, setAddMode] = useState<"public" | "produccion" | null>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [noteValue, setNoteValue] = useState(day.dayNote?.content ?? "");

  const handleNoteChange = useCallback(
    (value: string) => {
      setNoteValue(value);
      setDayNote(day.id, value); // optimistic
      if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
      noteTimerRef.current = setTimeout(() => {
        fetch(`/api/days/${day.id}/note`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: value }),
        }).catch(console.error);
      }, 600);
    },
    [day.id, setDayNote]
  );

  const sortedEvents = [...day.events].sort((a, b) => a.order - b.order);

  const dayOfWeek = format(day.date, "EEEE", { locale: es });
  const dayDate = format(day.date, "d MMM", { locale: es });

  return (
    <div
      className={`flex flex-col border-r border-gray-200 last:border-r-0 ${
        mobile ? "border-b" : "h-full overflow-hidden"
      }`}
    >
      {/* Day header */}
      <div className="px-3 pt-3 pb-2 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 capitalize">
              {dayOfWeek}
            </div>
            <div className="font-serif text-sm text-gray-900 leading-tight">
              {day.label ?? dayDate}
            </div>
            <div className="text-xs text-gray-400">{dayDate}</div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setNoteOpen((v) => !v)}
              title="Nota del día"
              className={`p-1 rounded transition-colors ${
                noteValue
                  ? "text-yellow-600 hover:text-yellow-700"
                  : "text-gray-300 hover:text-gray-500"
              }`}
            >
              <StickyNote size={14} />
            </button>
          </div>
        </div>

        {/* Inline day note */}
        {noteOpen && (
          <div className="mt-2">
            <textarea
              className="day-note w-full"
              placeholder="Nota interna del día…"
              value={noteValue}
              rows={2}
              onChange={(e) => handleNoteChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setNoteOpen(false);
                if (e.key === "Enter" && e.ctrlKey) e.currentTarget.blur();
              }}
            />
          </div>
        )}

        {/* Add event buttons */}
        <div className="flex gap-1.5 mt-2">
          <button
            onClick={() => setAddMode(addMode === "public" ? null : "public")}
            className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-[#3C3489] transition-colors px-1.5 py-0.5 rounded hover:bg-indigo-50"
          >
            <Plus size={11} />
            Evento
          </button>
          <button
            onClick={() => setAddMode(addMode === "produccion" ? null : "produccion")}
            className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-1.5 py-0.5 rounded hover:bg-gray-100"
            title="Añadir tarea de producción"
          >
            <Settings2 size={11} />
          </button>
        </div>

        {/* Inline add form */}
        {addMode && (
          <AddEventForm
            dayId={day.id}
            mode={addMode}
            onClose={() => setAddMode(null)}
          />
        )}
      </div>

      {/* Events list with DnD */}
      <Droppable droppableId={day.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-2 py-2 space-y-1.5 transition-colors ${
              snapshot.isDraggingOver ? "bg-blue-50/50" : ""
            } ${mobile ? "min-h-[80px]" : ""}`}
          >
            {sortedEvents.length === 0 && !snapshot.isDraggingOver && (
              <div className="border-2 border-dashed border-gray-200 rounded p-3 text-center">
                <p className="text-xs text-gray-300">Sin eventos</p>
              </div>
            )}

            {sortedEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
