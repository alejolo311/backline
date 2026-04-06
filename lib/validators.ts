import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const categoryEnum = z.enum([
  "cultural",
  "deportes",
  "musica",
  "social",
  "religioso",
  "reinado",
  "produccion",
]);

export const createEventSchema = z.object({
  dayId: z.string().min(1),
  title: z.string().min(1, "Title is required").max(200),
  category: categoryEnum,
  isInternal: z.boolean().default(false),
  startTime: z.string().regex(timeRegex, "Invalid time format").optional().or(z.literal("")),
  endTime: z.string().regex(timeRegex, "Invalid time format").optional().or(z.literal("")),
  venue: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  externalContact: z.string().max(200).optional(),
  externalPhone: z.string().max(50).optional(),
  internalOwner: z.string().max(200).optional(),
  internalNotes: z.string().max(2000).optional(),
  order: z.number().int().default(0),
});

export const updateEventSchema = createEventSchema.partial().omit({ dayId: true });

export const reorderEventsSchema = z.object({
  // Array of { id, order, dayId } after drag
  events: z.array(
    z.object({
      id: z.string(),
      order: z.number().int(),
      dayId: z.string(),
    })
  ),
});

export const createFestivalSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  location: z.string().max(300).optional(),
  description: z.string().max(2000).optional(),
  coverColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateFestivalSchema = createFestivalSchema.partial();

export const createTeamMemberSchema = z.object({
  festivalId: z.string().min(1),
  name: z.string().min(1, "Name is required").max(200),
  role: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial().omit({ festivalId: true });

export const updateDayNoteSchema = z.object({
  content: z.string().max(5000),
});

export const updateDaySchema = z.object({
  label: z.string().max(100).optional(),
  internalNote: z.string().max(1000).optional(),
});
