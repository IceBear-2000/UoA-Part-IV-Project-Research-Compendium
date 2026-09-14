# AI Worksheet Generator — Spec

Replaces the existing mock `/admin/worksheet-generator` tool with a real, lesson-scoped, AI-powered worksheet generator. This document is the agreed plan before implementation — confirmed with the user across two rounds of questions on 2026-09-14.

## 1. Summary

Admin opens a lesson, clicks "Generate AI worksheet." The system reads every block in that lesson (video transcripts, uploaded documents, activity/discussion/note instructions), asks Claude to summarize the teaching scope, shows that summary to the admin for review/correction, lets the admin pick question types + add special instructions, generates a structured worksheet via Claude, and gives the admin a full editor (with answer key) before finalizing it into a real `Block` on the lesson.

## 2. Confirmed Decisions

| Decision | Choice |
|---|---|
| AI provider | **Anthropic Claude** (`@anthropic-ai/sdk`) |
| Video understanding | **Transcript only** — fetch YouTube captions as text, feed to Claude. No native video-watching. |
| Video scope | **YouTube only.** Vimeo videos are skipped for content-understanding (no reliable public transcript route) — still shown as "video block, no transcript available." |
| Document parsing | **PDF and DOCX** text extraction. Other file types (PPTX, images) referenced by filename only, not parsed. |
| Transcript/parse failures | **Surfaced to the admin** on the pre-generate review screen as an explicit note (e.g. "Couldn't get a transcript for 'Warm-up song' — no captions available"), not a silent skip and not a hard failure. |
| Answer key | **Always included**, always shown and editable in the final editor — admin must be able to check/correct it before finalizing. |
| Regenerate | Re-runs generation from the **saved/edited topic summary only** — never re-fetches video transcripts or re-parses documents. Fast, cheap, respects admin's corrections to the summary. |
| Question types (v1) | MCQ, Short answer, Long answer/essay, Coloring/drawing (prompt/theme only — Claude cannot produce real art, this generates a themed suggestion for the admin to act on, not a drawable asset). |
| Output destination | New **real `Block` of type `WORKSHEET`** on the lesson, created only when admin clicks the final "Add worksheet block" action. Never overwrites an existing block — always inserted as a new one. |
| Old mock tool | `/admin/worksheet-generator` (the standalone, not-lesson-scoped mock) is **retired** — nav item and route removed, replaced entirely by this feature. |

## 3. Confirmed Flow

1. Admin, on a lesson's edit page, clicks **"Generate AI worksheet."**
2. **Loading screen** — server gathers lesson content: reads every block, fetches YouTube transcripts for Video blocks, extracts text from PDF/DOCX attachments on Reading/Worksheet blocks, collects instructions/notes from Activity/Discussion/Note/Quiz/Break blocks. Sends it all to Claude to produce a scope/topic summary.
3. **Pre-generate review screen** — shows Claude's summary of what the lesson teaches. Admin can edit this text directly (correct anything wrong/missing). Any transcript/parse failures are listed here as plain warnings. Admin then:
   - Selects one or more question types (MCQ / short answer / long answer / coloring)
   - Optionally adds special instructions (free text — tone, difficulty, focus area, question count, etc.)
   - Clicks **Generate**
4. Claude generates a structured worksheet (title, student-facing instructions, ordered questions, answer key) from the (possibly edited) summary + selected types + special instructions.
5. **Editor screen** — full preview with a sidebar of editing tools:
   - Edit any question's text, options (MCQ), or answer
   - View and correct the answer key
   - Add/remove/reorder questions manually
   - **Regenerate** — discards current draft, re-runs step 4 from the same summary (does not repeat step 2)
6. When satisfied, admin clicks **"Add worksheet block"** (or similar finalize action) — creates a real `WORKSHEET` block on the lesson, appended at the end of the block order. Facilitators then see it in the normal lesson flow.

## 4. Architecture

### New dependencies
- `@anthropic-ai/sdk` — Claude API calls
- `youtube-transcript` (or equivalent) — unofficial public-caption scraping, no API key needed, works only for videos that have captions (auto or manual)
- `pdf-parse` — PDF text extraction
- `mammoth` — DOCX text extraction

### New env var
- `ANTHROPIC_API_KEY` — **user must obtain this themselves** (same constraint as Resend: an assistant cannot create third-party accounts). Until it's set, the feature follows the same graceful-fallback convention already used for Resend: the generation step returns a clear "AI generation isn't configured yet" state instead of crashing, so the rest of the UI (routes, editor, block creation) is buildable and testable now.

### New Worksheet block content shape (AI-generated variant)
The existing `WORKSHEET` block content shape (`{ fileUrl, generatedByAI }`, for admin-uploaded files) is unchanged and still supported. A second, AI-generated shape is added alongside it — the facilitator-side renderer will need to handle both:

```json
{
  "generatedByAI": true,
  "title": "string",
  "studentInstructions": "string",
  "questions": [
    { "type": "mcq", "prompt": "string", "options": ["string", "..."], "correctIndex": 0 },
    { "type": "short_answer", "prompt": "string", "answer": "string" },
    { "type": "long_answer", "prompt": "string", "answer": "string" },
    { "type": "coloring", "prompt": "string" }
  ]
}
```

No `schema.prisma` change needed — `Block.content` is already a flexible `Json` column; this is a documented shape convention, not a migration.

### New/changed surfaces
- **New page**: `/admin/lessons/[id]/worksheet-generator` — the multi-step wizard (loading → review → editor). Full page, not a modal, given the flow's depth.
- **New Server Actions** (`app/admin/lessons/[id]/worksheet-generator/actions.ts`):
  - `analyzeLessonContent(lessonId)` — gathers block content, fetches transcripts, extracts documents, calls Claude for the scope summary. Returns `{ summary, warnings[] }`.
  - `generateWorksheetDraft({ summary, questionTypes, specialInstructions })` — calls Claude, returns the structured draft (question 3's shape above, minus `generatedByAI`).
  - `finalizeWorksheetBlock(lessonId, draft)` — creates the real `Block` row.
- **New libs**:
  - `lib/youtube-transcript.ts` — wraps the transcript package, returns `{ text } | { error }`.
  - `lib/document-text.ts` — PDF/DOCX extraction, returns `{ text } | { error }`.
  - `lib/ai-worksheet.ts` — the two Claude calls (summarize, generate), isolated the same way `lib/worksheet-generator.ts`'s mock was — swappable, single-purpose functions.
- **Changed**: `LessonFlowPlayer.tsx`'s `WORKSHEET` case — extended to render the structured `questions[]` shape (student-facing view: prompt + MCQ options or answer-line, no answer key shown to facilitators-as-students-proxy... actually facilitators *do* need the answer key for marking, so: show questions to print/hand out, and a separate "Answer key" disclosure for the facilitator's own use) alongside the existing file-link rendering.
- **Removed**: `/admin/worksheet-generator` page, its `actions.ts`, its `_components/WorksheetGeneratorView.tsx`, and its nav item in `AdminSidebar.tsx`. `lib/worksheet-generator.ts` (the old mock) removed too, superseded by `lib/ai-worksheet.ts`.

### State management for the wizard
No new DB table for in-progress drafts. The whole flow (summary → edits → draft → edits) lives in client component state across the wizard's steps; nothing is persisted until "Add worksheet block" is clicked. Refreshing mid-wizard loses progress — acceptable for v1, not raised as a concern.

### Cost/rate limiting
None proposed — admin-only, low volume, no objection raised.

## 5. Open Items Not Yet Decided
None outstanding — all prior open questions were resolved in discussion. Flagging here only as a placeholder in case implementation surfaces something new (e.g., a specific Claude model tier choice — will default to a fast/cheap tier given the task doesn't need heavy reasoning, and mention the exact model picked when built).
