# Encore — Implementation Notes

## Setup

1. Copy `.env.example` → `.env` and fill in `DATABASE_URL` and `NEXTAUTH_SECRET`.
2. Run `npm install`
3. Run `npx prisma migrate dev --name init` to create the database schema.
4. Run `npm run db:seed` to seed the producer user and a sample festival.
5. Run `npm run dev` and log in at `http://localhost:3000/login` with `producer` / `changeme123`.

## Architecture

- **App Router** with route groups: `(auth)` for login, `(producer)` for authenticated views, `p/[slug]` for the public unauthenticated program.
- **Prisma + PostgreSQL** for persistence. The `Day` records are auto-created when a Festival is created, one per calendar day in the date range.
- **NextAuth credentials** — single producer user stored in the DB with bcrypt hash.
- **Zustand store** (`lib/store.ts`) holds the live festival state client-side. The server renders the initial data; the client hydrates the store on mount.
- **@hello-pangea/dnd** for drag-and-drop. After a drop, `reorderEvents()` updates the store optimistically, then a 600ms debounced POST to `/api/events/reorder` persists the new order in a single DB transaction.

## Known Limitations

- **Realtime sync across tabs**: The spec mentions Supabase Realtime or polling for multi-tab updates. This version does _not_ implement real-time sync. The store is per-tab. If two tabs are open simultaneously, changes in one tab will not appear in the other without a page refresh. Adding Supabase Realtime requires replacing `@prisma/client` with the Supabase client and channel subscriptions — left as a future enhancement.
- **Day label editing**: Day labels (e.g., "Día 1") are set at festival creation. They can be updated via `PATCH /api/days/:id` but there is no dedicated inline editor on the calendar for editing the label string directly. The label is displayed as-is.
- **Print/PDF**: Uses `window.print()` with `@media print` CSS. For pixel-perfect A4 output, a server-side PDF library (e.g. Puppeteer, react-pdf) would produce more reliable results.
- **Auth**: Only a single producer account is supported. Multi-user or role-based access is not implemented.
- **Festival date range changes**: If you update `startDate`/`endDate` in settings, existing Day records are _not_ automatically added or removed to match the new range. This avoids accidental data loss. Manage days manually via the DB if needed.
- **Optimistic UI errors**: If a network request fails after an optimistic update, the UI will be out of sync with the DB. A full error-recovery strategy (re-fetching festival data) is not implemented — the page refresh will fix it.
- **Mobile DnD**: @hello-pangea/dnd supports touch events. On mobile, the columns collapse to a single vertical list (no grid) so DnD works within a day. Cross-day drag on mobile requires scrolling the list, which works but may be awkward on very small screens.

## Folder Map

```
app/
  (auth)/login/        — Login page (unauthenticated)
  (producer)/          — Layout with ProducerNav, requires auth
    dashboard/         — Festival list
    festival/[id]/     — Calendar board
      team/            — Team members CRUD
      settings/        — Festival settings + danger zone
  p/[slug]/            — Public program page (no auth)
  api/
    auth/[...nextauth] — NextAuth handler
    events/            — POST create; [id] PATCH/DELETE; reorder/ POST
    festivals/         — GET list, POST create; [id] GET/PATCH/DELETE; export/ GET
    days/[id]/         — PATCH day; note/ PUT/DELETE day note
    team/              — POST create; [id] PATCH/DELETE
components/
  auth/LoginForm
  calendar/
    CalendarBoard      — DnD context, desktop grid + mobile stack
    DayColumn          — Day header, note editor, event list droppable
    EventCard          — Draggable card with hover actions
    AddEventForm       — Inline add form (public / produccion modes)
    InlineEditForm     — Inline edit form on card
    DetailModal        — Full event detail overlay
    FestivalHeader     — Festival title bar with nav links
  dashboard/
    FestivalCard       — Card in festival list
    CreateFestivalButton — Modal to create new festival
  settings/FestivalSettingsClient
  team/TeamClient
  ui/toast, toaster, use-toast  — Radix UI toast primitives
  Providers            — SessionProvider + Toaster
lib/
  auth.ts              — NextAuth options
  colors.ts            — Category color metadata
  db.ts                — Prisma singleton
  store.ts             — Zustand festival store
  utils.ts             — cn(), formatTime, slugify, getFestivalStatus
  validators.ts        — Zod schemas for all API inputs
prisma/
  schema.prisma
  seed.ts
```
