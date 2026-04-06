import { create } from "zustand";
import type { Event, Day, DayNote, TeamMember, Festival, Category } from "@prisma/client";

export type EventWithRelations = Event;

export type DayWithRelations = Day & {
  events: Event[];
  dayNote: DayNote | null;
};

export type FestivalWithRelations = Festival & {
  days: DayWithRelations[];
  teamMembers: TeamMember[];
};

type FestivalStore = {
  festival: FestivalWithRelations | null;
  setFestival: (f: FestivalWithRelations) => void;

  // Optimistic event mutations
  addEvent: (event: Event) => void;
  updateEvent: (id: string, partial: Partial<Event>) => void;
  removeEvent: (id: string) => void;

  // Reorder: move event within or between days
  reorderEvents: (
    sourceDayId: string,
    destDayId: string,
    sourceIndex: number,
    destIndex: number
  ) => { id: string; order: number; dayId: string }[];

  // Day note
  setDayNote: (dayId: string, content: string) => void;

  // Detail modal
  detailEventId: string | null;
  openDetail: (id: string) => void;
  closeDetail: () => void;
};

export const useFestivalStore = create<FestivalStore>((set, get) => ({
  festival: null,
  setFestival: (f) => set({ festival: f }),

  addEvent: (event) =>
    set((state) => {
      if (!state.festival) return state;
      const days = state.festival.days.map((d) =>
        d.id === event.dayId ? { ...d, events: [...d.events, event] } : d
      );
      return { festival: { ...state.festival, days } };
    }),

  updateEvent: (id, partial) =>
    set((state) => {
      if (!state.festival) return state;
      const days = state.festival.days.map((d) => ({
        ...d,
        events: d.events.map((e) => (e.id === id ? { ...e, ...partial } : e)),
      }));
      return { festival: { ...state.festival, days } };
    }),

  removeEvent: (id) =>
    set((state) => {
      if (!state.festival) return state;
      const days = state.festival.days.map((d) => ({
        ...d,
        events: d.events.filter((e) => e.id !== id),
      }));
      return { festival: { ...state.festival, days } };
    }),

  reorderEvents: (sourceDayId, destDayId, sourceIndex, destIndex) => {
    const state = get();
    if (!state.festival) return [];

    const days = [...state.festival.days];
    const sourceDay = days.find((d) => d.id === sourceDayId);
    const destDay = days.find((d) => d.id === destDayId);
    if (!sourceDay || !destDay) return [];

    const sourceEvents = [...sourceDay.events].sort((a, b) => a.order - b.order);
    const [movedEvent] = sourceEvents.splice(sourceIndex, 1);

    if (sourceDayId === destDayId) {
      sourceEvents.splice(destIndex, 0, movedEvent);
      const reindexed = sourceEvents.map((e, i) => ({ ...e, order: i, dayId: sourceDayId }));
      const updatedDays = days.map((d) =>
        d.id === sourceDayId ? { ...d, events: reindexed } : d
      );
      set({ festival: { ...state.festival, days: updatedDays } });
      return reindexed.map((e) => ({ id: e.id, order: e.order, dayId: e.dayId }));
    }

    // Cross-day move
    const destEvents = [...destDay.events].sort((a, b) => a.order - b.order);
    const movedWithNewDay = { ...movedEvent, dayId: destDayId };
    destEvents.splice(destIndex, 0, movedWithNewDay);

    const reindexedSource = sourceEvents.map((e, i) => ({ ...e, order: i }));
    const reindexedDest = destEvents.map((e, i) => ({ ...e, order: i }));

    const updatedDays = days.map((d) => {
      if (d.id === sourceDayId) return { ...d, events: reindexedSource };
      if (d.id === destDayId) return { ...d, events: reindexedDest };
      return d;
    });

    set({ festival: { ...state.festival, days: updatedDays } });

    return [
      ...reindexedSource.map((e) => ({ id: e.id, order: e.order, dayId: sourceDayId })),
      ...reindexedDest.map((e) => ({ id: e.id, order: e.order, dayId: destDayId })),
    ];
  },

  setDayNote: (dayId, content) =>
    set((state) => {
      if (!state.festival) return state;
      const days = state.festival.days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              dayNote: d.dayNote
                ? { ...d.dayNote, content }
                : { id: dayId + "-note", dayId, content, updatedAt: new Date() },
            }
          : d
      );
      return { festival: { ...state.festival, days } };
    }),

  detailEventId: null,
  openDetail: (id) => set({ detailEventId: id }),
  closeDetail: () => set({ detailEventId: null }),
}));
