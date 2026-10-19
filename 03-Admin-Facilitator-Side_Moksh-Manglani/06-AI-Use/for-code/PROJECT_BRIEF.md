# StudyBuddy — Project Brief
*Context document for Claude Code. Read this in full before writing any code.*

## What this is

StudyBuddy is a two-tier platform that lets people without formal teaching qualifications deliver structured, consistent K–12 lessons. Coordinators (admins) build lessons as an ordered sequence of content blocks; facilitators log in and are guided through that sequence step by step. The platform supplies the teaching expertise; the facilitator supplies the presence in the room.

This is a University of Auckland Honours software engineering project (SOFTENG 700A). It targets underserved learning environments — rural schools, lower-income communities, and homeschooling contexts in New Zealand — where qualified teachers are scarce.

A separate, **not-yet-built** AI layer (learner readiness assessment, ML-driven facilitator insights) is planned future work by a project partner and is **out of scope** for this build. Do not build AI features. Where the UI references AI (e.g. "AI-generated worksheet"), treat it as a placeholder/mocked feature for now — a button that simulates generation, not a real model call — unless explicitly asked to wire up a real LLM call later.

## Stack

- **Framework:** Next.js (App Router), TypeScript
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth:** Supabase Auth (email/password to start)
- **File storage:** Supabase Storage (signed URLs for videos/worksheets — never public direct links)
- **Hosting:** Vercel
- **Styling:** Tailwind CSS, matching the design tokens in `DESIGN_TOKENS.md`

## The two roles

| Role | Can do |
|---|---|
| **Admin / Coordinator** | Create/edit/publish lessons, manage block flows, assign facilitators to classes/subjects, view all facilitators, approve AI-generated worksheets, message facilitators |
| **Facilitator** | View only their assigned classes/subjects/lessons, play through lesson flows, view/print worksheets, message admin |

These are not just permission flags on one UI — they are functionally separate experiences with separate navigation. A facilitator should never be able to reach an admin-only route, even by direct URL.

## Core data hierarchy

```
Organisation
 └─ Class (a.k.a. Grade — these are the same concept, one field)
     └─ Subject
         └─ Lesson
             └─ Block (ordered, one of several types)
```

A **Lesson** is the atomic teaching unit. A **Flow** is just the ordered list of **Blocks** belonging to a lesson — it is not a separate top-level entity, it's a property of Lesson (its blocks, ordered).

Every Block shares one underlying shape regardless of type — `id`, `lessonId`, `type`, `title`, `order`, `facilitatorNote`, and a `content` field whose shape depends on `type`. This is what makes new block types cheap to add later. Do not create a separate table per block type — use one `Block` table with a `type` enum and a `content` JSON column.

### Block types (launch set)

`VIDEO`, `WORKBOOK`, `ACTIVITY`, `WORKSHEET`, `READING`, `QUIZ`, `DISCUSSION`, `BREAK`, `NOTE`

Only `VIDEO`, `WORKBOOK`, `ACTIVITY`, `WORKSHEET` need full content editing in v1. The rest can exist as selectable types with a generic title + instructions content shape — don't over-build their specific editors yet.

## The lesson flow behaviour (the core mechanic — get this exactly right)

This is the single most important interaction in the product. It must work precisely like this:

1. **First time** a facilitator opens a lesson, blocks must be completed **strictly in order**. They cannot jump ahead. Attempting to access a block beyond the current one should be blocked server-side, not just hidden in the UI.
2. Each block has a "mark done" action that records completion and advances the facilitator to the next block, unlocking it.
3. **Partial progress persists.** A facilitator can leave mid-lesson and resume exactly where they left off — store `currentBlockIndex` and a set/array of completed block IDs against a `LessonProgress` record per (facilitator, lesson).
4. **Once the final block is marked done, the lesson is marked `completed` with a timestamp.** From that point on, **all blocks become freely navigable** — the lock no longer applies. The facilitator can jump to any block, in any order, indefinitely.
5. Worksheets are **view/print only** in this version — no upload-back, no submission capture.

This needs to be modeled as real server-side state (a `LessonProgress` table), not just client-side UI state — the whole point is that progress persists across sessions and devices.

## Admin lesson builder

- Admin creates a lesson with required fields: **name, class/grade, subject**. Optional-but-encouraged fields (shown with a "Recommended" tag, not enforced): **duration, description, learning objectives**.
- Blocks are added via a type picker, then edited inline, and can be **reordered** (drag-and-drop in the UI; the underlying `order` field on Block is just an integer you resequence).
- Lessons have a draft/published state. Facilitators only ever see published lessons.

## Facilitator assignment

- A `FacilitatorAssignment` join table links a facilitator (user) to a Class + Subject pair.
- Assignment should be reachable from two places in the UI: the facilitator's profile (admin picks classes/subjects for them) and from within class/subject context (admin picks a facilitator) — but both write to the same underlying table. Don't build two different data models for this.

## What NOT to build yet

- No AI/ML model integration — mock it
- No file upload-back from facilitators
- No multi-organisation / multi-tenant logic — build for a single organisation context for now, but don't hardcode in a way that makes it painful to add later (i.e. still have an `Organisation` table, just don't build switching UI)
- No payment, billing, or subscription logic
- No notifications system beyond a simple in-app list (no email/push needed yet)

## Reference materials in this repo

- `studybuddy-mockup.html` — a static, fully clickable HTML/CSS/JS reference implementation of the UI and the lesson-flow interaction logic. **This is the design and interaction source of truth.** Match its visual language (see `DESIGN_TOKENS.md`) and replicate its exact state machine for the lesson flow, now backed by a real database instead of in-memory JS variables.
- `DESIGN_TOKENS.md` — colour palette, spacing, radius, and type values extracted from the mockup
- `SCHEMA.sql` — the Prisma/Postgres schema to start from

## Build order (recommended)

Work in this order — each phase should be functional before moving to the next:

1. Scaffold Next.js + Tailwind + Prisma + Supabase connection. Confirm a basic page renders and the DB connects.
2. Implement the schema (`SCHEMA.sql` → Prisma schema → migrate).
3. Auth: sign up/sign in, role assignment, protected routes per role.
4. Admin: lesson CRUD (no block editing yet) — just name/class/subject/draft-publish.
5. Admin: block builder (add/edit/reorder/delete blocks within a lesson).
6. Facilitator: browse assigned classes → subjects → lessons (read-only list views).
7. Facilitator: the lesson flow player, wired to real `LessonProgress` — this is the critical path, build and test it thoroughly against the rules above.
8. Admin: facilitator management + assignment.
9. Polish: messaging, worksheet generator mock, notifications.

Don't skip ahead to polish before step 7 works correctly — the lesson flow state machine is the thing your supervisor will actually evaluate most closely.
