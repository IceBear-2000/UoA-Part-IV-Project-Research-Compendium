# 04 · Code

The complete source of the StudyBuddy platform is in [`StudyBuddy-Platform/`](StudyBuddy-Platform/), imported **with its full git history** from the development repository, so every original commit from the first (14 July 2026) to the last is part of this repository's history on GitHub. The same list is in [`COMMIT-HISTORY.md`](COMMIT-HISTORY.md) for readers of the zip.

This page is the setup guide and the technical specification sheet.

---

## Specification sheet

### Software

| Component | Version | Role |
|---|---|---|
| Next.js | 14.2.35 (App Router) | Web framework: Server Components, Server Actions, middleware |
| React | 18 | UI |
| TypeScript | 5 | Language |
| Prisma (`prisma`, `@prisma/client`) | 6.19.x (pinned below 7) | ORM and migrations |
| Supabase (`@supabase/supabase-js`, `@supabase/ssr`) | 2.x, 0.12.x | Auth, Postgres, private file storage |
| Tailwind CSS | 3.4 | Styling with design tokens |
| `@dnd-kit` | core 6, sortable 10 | Drag-and-drop block builder |
| `@anthropic-ai/sdk` | 0.125.x | Claude API for the worksheet generator |
| `resend` | 6.x | Invitation and decision emails |
| `pdf-parse`, `mammoth`, `jszip` | 2.x, 1.12.x, 3.10.x | Reading PDF and DOCX sources; spreadsheet import |
| `youtube-transcript` | 1.3.x | YouTube captions for the worksheet generator |
| `lucide-react` | 1.x | Icons |

### Services

| Service | Used for | Region and settings |
|---|---|---|
| Supabase | Postgres database, authentication, private storage bucket | Sydney (`ap-southeast-2`); the app connects through the transaction pooler in production |
| Vercel | Hosting and automatic deployment from `main` | Functions pinned to `syd1` (Sydney) in `vercel.json` |
| Anthropic | Worksheet generator | `claude-haiku-4-5-20251001` (summary) and `claude-sonnet-5` (worksheet) |
| Resend | Email | Optional in development |

### Hardware and environment used for development and testing

| Item | Value |
|---|---|
| Machine | MacBook, Apple M1, 8 GB RAM |
| Operating system | macOS 26 |
| Node.js | v25.8.2 (Node 20 or later recommended) |
| Browser for manual testing | Chromium-based, desktop |

---

## Running the platform locally

### 1. Prerequisites

- Node.js 20 or later and npm
- A free [Supabase](https://supabase.com) project
- Optional: an [Anthropic](https://console.anthropic.com) API key (worksheet generator) and a [Resend](https://resend.com) API key (email)

### 2. Install

```bash
cd 03-Admin-Facilitator-Side_Moksh-Manglani/04-Code/StudyBuddy-Platform
npm install            # also runs `prisma generate`
cp .env.example .env   # then fill in your own values
```

### 3. Environment variables

All are described in [`.env.example`](StudyBuddy-Platform/.env.example). No real values are included in this repository.

| Variable | Required | Where to find it |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase, Settings, Database (connection string) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase, Settings, API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase, Settings, API (public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase, Settings, API. **Server-side only; never expose it** |
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3001` locally; your domain when deployed |
| `RESEND_API_KEY` | No | Without it, the invite link is shown in the admin page instead of emailed |
| `ANTHROPIC_API_KEY` | No | Without it, the worksheet generator shows a "not configured" message |

### 4. Database, storage and demo accounts

```bash
npx prisma migrate deploy                 # create the tables from prisma/migrations
npx prisma db seed                        # seed an organisation, three users, Grades 1 and 2 and one sample lesson
npx tsx scripts/setup-storage-bucket.ts   # create the private storage bucket
npx tsx scripts/provision-seed-auth.ts    # create sign-in accounts for the seeded users
npx tsx scripts/assign-facilitators.ts    # grant the demo facilitators their classes
```

Run the seed once, on an empty database (it creates rows rather than updating them). It creates one admin (`gill@school.nz`), two facilitators (`aroha@school.nz`, `tama@school.nz`), the classes Grade 1 and Grade 2 with their subjects, and one five-block sample lesson, *Counting to 20*. The NCERT and NZC lessons on the live site are not produced by this seed.

`provision-seed-auth.ts` gives each seeded user a Supabase sign-in account with a demo password written in the script. **Change it** before running against any database other than your own local test project, and never use it on a site other people can reach.

### 5. Run

```bash
npm run dev        # http://localhost:3001
npm run build && npm run start   # production build, as used for the evaluation
```

Sign in as a seeded admin to build lessons and approve requests, or as a seeded facilitator to walk through a lesson. To see the request flow, sign up from `/signup` and approve the request as an admin.

### 6. Deploy

Import the folder into Vercel, add the same environment variables, and deploy. Keep the function region next to your database (see `vercel.json`).

---

## Where things are in the code

| Path | What it does |
|---|---|
| `middleware.ts` | Session refresh and route guard before any page runs |
| `app/admin/` | Admin side: overview, classes, lessons and the block builder, facilitators, requests, messages, settings |
| `app/facilitator/` | Facilitator side: classes, the lesson player and walkthrough, messages, notifications |
| `app/signup`, `app/login`, `app/set-password`, `app/auth/confirm` | Request access, sign in, accept an invite |
| `app/about` | Public page explaining the project |
| `lib/auth.ts` | Session helpers and the server-side role checks |
| `lib/lesson-progress.ts` | The walkthrough rules: how block state is derived on the server |
| `lib/ai-worksheet.ts` | The worksheet generator (summary, generation, saving as a block) |
| `lib/document-text.ts`, `lib/youtube-transcript.ts` | Reading PDF, DOCX and YouTube captions for the generator |
| `lib/lesson-plan-import.ts` | Importing a lesson plan from `.csv` or `.xlsx` |
| `lib/video-embed.ts` | Turning pasted YouTube links (videos and playlists) into embeds |
| `lib/messaging*.ts`, `lib/notifications*.ts` | Chat between facilitators and admins, and notifications |
| `lib/email.ts` | Resend emails |
| `prisma/schema.prisma`, `prisma/migrations/` | The data model (eleven models) and its five migrations |
| `prisma/seed.ts` | Seed data: one organisation, three users, Grades 1 and 2, and one sample lesson |
| `scripts/` | One-off setup scripts (storage bucket, seed accounts, assignments) |

## Development history

The commit history records the build in order. Highlights:

| Date | Commit | Change |
|---|---|---|
| 14 Jul | `9270afd` | Initial platform: authoring, walkthrough, request and approval, messaging, notifications |
| 14 Sep | `7f4fd87` | Real AI worksheet generator replaces the mock |
| 14 Sep | `022ff8a` | Admin navigation restructured: class drill-down, grouped lessons, settings |
| 15 Sep | `55c91fb` | Switchable themes, top-nav layout, Canvas-style class cards |
| 20 Sep | `7a7ae3c` | Functions moved next to the database (Sydney): the main speed fix |
| 21 Sep | `57b235f` | NZC Years 1 to 4 alongside NCERT, with a curriculum filter |
| 25 Sep | `9c301b6`, `87fc4fa` | Actionable admin home page; public About page |
| 19 Oct | `a56a29c` to `98cf4c2` | Fixes from the second heuristic review and the UI/UX feedback |
