"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Event } from "@prisma/client";
import { CATEGORY_META } from "@/lib/colors";
import { formatTimeRange } from "@/lib/utils";
import { useFestivalStore } from "@/lib/store";
import { Expand, Pencil, Trash2, FileText, Settings } from "lucide-react";
import { useState } from "react";
import { InlineEditForm } from "@/components/calendar/InlineEditForm";

type Props = {
  event: Event;
  index: number;
};

export function EventCard({ event, index }: Props) {
  const { openDetail, removeEvent, updateEvent } = useFestivalStore();
  const [editMode, setEditMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const meta = CATEGORY_META[event.category];
  const timeRange = formatTimeRange(event.startTime, event.endTime);
  const isProduccion = event.category === "produccion";

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${event.title}"?`)) return;
    setDeleting(true);
    removeEvent(event.id); // optimistic
    await fetch(`/api/events/${event.id}`, { method: "DELETE" }).catch(
      console.error
    );
  }

  if (editMode) {
    return (
      <InlineEditForm
        event={event}
        onClose={() => setEditMode(false)}
        onSave={(updated) => {
          updateEvent(event.id, updated);
          setEditMode(false);
        }}
      />
    );
  }

  return (
    <Draggable draggableId={event.id} index={index} isDragDisabled={deleting}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`event-card group ${snapshot.isDragging ? "shadow-lg rotate-[1deg] opacity-90" : ""}`}
          style={{
            backgroundColor: meta.bg,
            borderColor: meta.border,
            borderLeftColor: meta.accent,
            color: meta.text,
            ...provided.draggableProps.style,
          }}
        >
          {/* Action buttons — shown on hover */}
          <div className="event-card-actions absolute top-1 right-1 flex items-center gap-0.5 bg-white/90 rounded shadow-sm border border-gray-100 px-0.5">
            <button
              onClick={() => openDetail(event.id)}
              className="p-0.5 hover:text-blue-600 transition-colors"
              title="Ver detalle"
            >
              <Expand size={10} />
            </button>
            <button
              onClick={() => setEditMode(true)}
              className="p-0.5 hover:text-amber-600 transition-colors"
              title="Editar"
            >
              <Pencil size={10} />
            </button>
            <button
              onClick={handleDelete}
              className="p-0.5 hover:text-red-600 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={10} />
            </button>
          </div>

          <div className="pr-10">
            {/* Title */}
            <div className="flex items-start gap-1">
              {isProduccion && (
                <Settings size={10} className="flex-shrink-0 mt-0.5 opacity-70" />
              )}
              <span className="font-serif leading-snug break-words">{event.title}</span>
              {event.internalNotes && (
                <span title="Tiene notas">
                  <FileText size={9} className="flex-shrink-0 mt-0.5 opacity-60" />
                </span>
              )}
            </div>

            {/* Time range */}
            {timeRange && (
              <div className="text-[10px] opacity-70 mt-0.5">{timeRange}</div>
            )}

            {/* Venue or owner */}
            {(event.venue || event.internalOwner) && (
              <div className="text-[10px] opacity-70 truncate">
                {event.venue ?? event.internalOwner}
              </div>
            )}

            {/* Category badge */}
            <div className="mt-1">
              <span
                className="badge-category"
                style={{ backgroundColor: meta.bg, color: meta.text, border: `1px solid ${meta.border}` }}
              >
                {isProduccion ? meta.icon : null} {meta.label}
              </span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
