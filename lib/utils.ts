import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isFuture, isPast } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  return time; // stored as "HH:MM" already
}

export function formatTimeRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (!start && !end) return "";
  if (start && end) return `${start} – ${end}`;
  if (start) return `${start}`;
  return "";
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE d 'de' MMMM", { locale: es });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM", { locale: es });
}

export type FestivalStatus = "upcoming" | "active" | "past";

export function getFestivalStatus(
  startDate: Date,
  endDate: Date
): FestivalStatus {
  const now = new Date();
  if (isPast(endDate)) return "past";
  if (isFuture(startDate)) return "upcoming";
  return "active";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
