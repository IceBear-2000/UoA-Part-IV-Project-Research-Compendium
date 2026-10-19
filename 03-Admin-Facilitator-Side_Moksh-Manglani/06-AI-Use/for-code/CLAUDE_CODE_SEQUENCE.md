# Running this in Claude Code — prompt sequence

This is the order to actually work through with Claude Code on your machine. Don't paste all of this in at once — work through it as separate prompts/sessions, confirming each phase works before moving to the next. The brief explicitly tells Claude Code not to skip ahead to polish, but it's on you to actually stop and check before moving on.

## Before you start

1. Create the GitHub repo (empty, just a README).
2. Create a Supabase project. Grab:
   - The Postgres connection string (`DATABASE_URL`)
   - The project URL and anon/public key (for Supabase Auth + Storage on the client)
   - The service role key (server-side only, never exposed to the browser)
3. Put `PROJECT_BRIEF.md`, `DESIGN_TOKENS.md`, and `schema.prisma` (rename to `schema.prisma` and place under `prisma/`) into the repo root before opening Claude Code, along with your `studybuddy-mockup.html` file. Commit them. This is what makes the first session effective — Claude Code reads these before writing anything.
4. Open the repo folder in Claude Code.

## Session 1 — Scaffold

> Read PROJECT_BRIEF.md, DESIGN_TOKENS.md, and studybuddy-mockup.html in this repo fully before doing anything.
>
> Scaffold a new Next.js 14 project (App Router, TypeScript, Tailwind CSS) in this repo. Set up Prisma using the schema at `prisma/schema.prisma` (already provided — don't rewrite it, just wire up the Prisma client and confirm the schema is valid). Connect to Supabase using environment variables (create a `.env.example` showing what's needed: DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).
>
> Set up the Tailwind config and a global CSS file using the exact values in DESIGN_TOKENS.md as CSS variables / Tailwind theme extensions.
>
> Don't build any actual pages yet beyond a default home page that confirms the app runs and Tailwind is working. Run the dev server and confirm it starts without errors before stopping.

**Check before continuing:** `npm run dev` works, Tailwind classes render correctly, `npx prisma validate` passes.

## Session 2 — Database

> Run the Prisma migration to create the schema in Supabase (`npx prisma migrate dev --name init`). Confirm the tables appear correctly in Supabase by describing what you see.
>
> Write a seed script (`prisma/seed.ts`) that creates: one Organisation, one admin User, two facilitator Users, two Classes ("Grade 1", "Grade 2"), a few Subjects per class, and one fully-built Lesson with 5 blocks (Video, Workbook, Video, Activity, Worksheet) matching the "Counting to 20" example from the mockup. Run the seed and confirm the data is in the database.

**Check before continuing:** open Supabase's table editor and confirm the seeded data looks right.

## Session 3 — Auth & roles

> Implement authentication using Supabase Auth (email/password). On sign-up, also create a corresponding row in our `User` table (with the matching `authId`) so we have role information available app-side.
>
> Build:
> - A login page
> - Middleware/route protection so admin routes are unreachable by facilitators and vice versa, enforced server-side (not just hidden in the UI)
> - A way to read the current user's role in server components/route handlers
>
> Use the login screen design from studybuddy-mockup.html as the visual reference (the role toggle, the layout, the colours) but wire it to real Supabase Auth instead of the mock role switch.

**Check before continuing:** log in as your seeded admin and as a seeded facilitator in two different browser sessions, confirm each is blocked from the other's routes.

## Session 4 — Admin: lesson CRUD (no blocks yet)

> Build the admin "Lessons" list and lesson creation form — name, class, subject (required), duration/description/learning objectives (optional, shown with a "Recommended" tag per PROJECT_BRIEF.md). Draft/Published status toggle. No block editing yet — just get a Lesson row created, editable, and publishable.
>
> Match the visual design of the Lesson Builder screen's "Lesson details" panel from the mockup for the form itself.

## Session 5 — Admin: block builder

> Now build the block builder inside the lesson editor — matching the mockup's Lesson Builder screen. Implement: add block (type picker matching the 9 types), edit block content inline (per type, per the content shapes documented in schema.prisma's Block model comments), reorder via drag-and-drop, delete.
>
> For VIDEO/WORKBOOK/ACTIVITY/WORKSHEET give them real type-specific content fields. For READING/QUIZ/DISCUSSION/BREAK/NOTE a generic instructions field is fine for now per PROJECT_BRIEF.md.

## Session 6 — Facilitator: browse

> Build the facilitator's read-only browsing flow: dashboard → their assigned classes → subjects within a class → lessons within a subject. Only show classes/subjects the facilitator is actually assigned to (query via FacilitatorAssignment) and only show Published lessons. Match the mockup's corresponding screens.

## Session 7 — The lesson flow player (critical path — take this slowly)

> This is the most important part of the app. Re-read the "lesson flow behaviour" section of PROJECT_BRIEF.md carefully before building.
>
> Build the lesson flow player against real LessonProgress records:
> - On opening a lesson, fetch or create a LessonProgress row for this facilitator+lesson
> - Render blocks with done/active/locked state computed from currentBlockIndex, completedBlockIds, and completedAt — exactly as described in the schema comments
> - "Mark done" advances currentBlockIndex, appends to completedBlockIds, and on the last block sets completedAt
> - Server-side: reject any attempt to mark a block done or fetch its content if it's currently locked (don't trust the client)
> - After completedAt is set, every block becomes freely clickable regardless of order
> - Add a completion screen showing the real completedAt timestamp
>
> Match the visual design and the exact interaction feel from the mockup's flow player (which has working mock logic in plain JS you can use as a direct behavioural reference — same rules, now backed by the database).

**Check before continuing:** manually test resuming a lesson — start it, complete 2 of 5 blocks, refresh the page / log out and back in, confirm you resume at block 3 with blocks 1–2 still shown as done. Then complete the lesson and confirm you can freely click back to block 1.

## Session 8 — Admin: facilitator management & assignment

> Build the admin facilitator list (table + card view toggle, matching the mockup) and the assignment modal. Assignment writes to FacilitatorAssignment. Make the "Assign" action reachable from both the facilitator list and (if you have time) from within a class/subject view, writing to the same table either way.

## Session 9 — Messaging, worksheet generator mock, notifications

> Build simple messaging (Message table, a conversation view per the mockup, role-aware as discussed — admin sees a facilitator list, facilitator sees a single thread with admin).
>
> Build the worksheet generator screen as a mock: a form that, on submit, shows a fake "generated" preview after a short delay (no real AI call). Make it easy to swap in a real LLM call later — isolate that logic in one function.
>
> Build a simple in-app notifications list (new table if needed) — no email/push required.

## Ongoing: deployment

> Once Session 3 (auth) is working, it's worth deploying to Vercel early rather than waiting — connect the GitHub repo to Vercel, set the same environment variables there, and confirm it deploys. Catching deployment issues early (env vars, build errors) is much easier than discovering them in week 11.

---

## A few standing instructions worth giving Claude Code at the start of *every* session

- "Don't deviate from the schema in `prisma/schema.prisma` without telling me why and asking first."
- "Match `DESIGN_TOKENS.md` exactly — don't substitute your own colour/spacing choices."
- "If something in PROJECT_BRIEF.md is ambiguous, ask me rather than guessing."

These three lines do a lot of work to keep Claude Code from drifting from your decided design and architecture over a long, multi-session build.
