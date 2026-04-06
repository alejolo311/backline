"use client";

import { useEffect, useRef, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useFestivalStore, type FestivalWithRelations } from "@/lib/store";
import { DayColumn } from "@/components/calendar/DayColumn";
import { DetailModal } from "@/components/calendar/DetailModal";

type Props = { festival: FestivalWithRelations };

export function CalendarBoard({ festival }: Props) {
  const { setFestival, reorderEvents, detailEventId } = useFestivalStore();
  const festivalFromStore = useFestivalStore((s) => s.festival);

  // Initialize store with server data
  useEffect(() => {
    setFestival(festival);
  }, [festival.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncReorder = useCallback(
    (events: { id: string; order: number; dayId: string }[]) => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        fetch("/api/events/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events }),
        }).catch(console.error);
      }, 600);
    },
    []
  );

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const affected = reorderEvents(
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
    syncReorder(affected);
  }

  const days = festivalFromStore?.days ?? festival.days;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Desktop: 4-column grid; Mobile: single scrollable column */}
        <div className="flex-1 overflow-hidden">
          {/* Desktop grid */}
          <div className="hidden md:grid h-full overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
          >
            {days.map((day) => (
              <DayColumn key={day.id} day={day} />
            ))}
          </div>

          {/* Mobile: vertical stacked list */}
          <div className="md:hidden overflow-y-auto h-full pb-4">
            {days.map((day) => (
              <DayColumn key={day.id} day={day} mobile />
            ))}
          </div>
        </div>
      </DragDropContext>

      {detailEventId && <DetailModal />}
    </>
  );
}
