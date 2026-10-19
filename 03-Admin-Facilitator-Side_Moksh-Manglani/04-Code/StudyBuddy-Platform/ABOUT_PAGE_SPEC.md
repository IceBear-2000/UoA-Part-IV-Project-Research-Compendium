# About Page — Spec

A public, no-login page that explains StudyBuddy to someone with zero context, fast — built for handing to a friend cold before an informal usability chat. This document is the agreed plan before implementation, drafted 2026-09-25 from a live Q&A with the user, cross-checked against `StudyBuddy Information/StudyBuddy-Messaging.md` (locked pitch text, owned by the other Claude working this project) and `StudyBuddy Information/StudyBuddy-Master-Context.md` (the six-criteria literature review framework). **Two open items need the user's confirmation before build — see §5.**

## 1. Summary

A single scrolling page at `/about`. Opens on the shortest possible hook (an 11-word thesis line + a locked 2-3 sentence pitch), lets the reader expand to the full 55-second pitch if they want more, then walks Problem → How it works (with a link out to deeper technical diagrams) → How StudyBuddy compares to existing systems. No login required, no ethics/research framing — pure product explainer. Linked from the login screen (logged-out) and from both the Admin and Facilitator sidebars (logged-in).

## 2. Confirmed Decisions

| Decision | Choice |
|---|---|
| Route | Public `/about` — no auth. Middleware already only protects `/admin`, `/facilitator`, `/dashboard`, so no changes needed there. |
| Structure | One scrolling page, progressive disclosure: Hero (short pitch, expandable) → Problem → How it works → System architecture (link-out) → How StudyBuddy compares. |
| Entry points | (1) "About this project" link on the login page's left panel. (2) "About the project" link in the Admin sidebar. (3) Same in the Facilitator sidebar. Logged-in links open in a new tab, so the admin/facilitator session and place in the app stay put. |
| Tone | Warm & plain. No jargon. Short sentences. |
| Research/ethics framing | **None.** No UAHPEC mention, no "University of Auckland Honours project" framing — pure product, per direct instruction. |
| Hero copy | The locked 2-3 sentence pitch (`Messaging.md` §1b), verbatim. Headline is the locked thesis line: **"The facilitator facilitates learning. The platform does the teaching."** |
| Expand behaviour | Clicking "Read the full pitch" reveals the locked **55-second** pitch (`Messaging.md` §1) — see §5, this replaces the "30-second pitch" the user asked for, which doesn't exist (dropped 25 Sept, only the 55-second and 2-3 sentence versions are locked). |
| Problem section | Pulled from the 55-second pitch's own figures: 44M-teacher shortfall (UNESCO 2024), reading poverty (World Bank 2025), teachers leaving low-income schools for better pay. Small, unobtrusive source line — no academic citation formatting. |
| How it works | Plain-English functional flow only on the page itself (Admin builds → Facilitator runs it → Platform delivers, facilitator supports) — matches the corrected framing in `Messaging.md` §2 ("the platform teaches, the facilitator runs the room"), not the older "facilitator delivers the lesson" phrasing. |
| Architecture diagrams | A "View the technical architecture →" button linking out to the existing claude.ai **System Architecture** artifact (data model, class diagram, lesson-flow state machine) instead of building new diagrams. See §5 — that artifact is from July and predates several schema changes. |
| Comparison section | A table, not a chart. Rows = StudyBuddy + 6 named systems (Moodle, Google Classroom, Khan Academy, Kolibri, LEAD School, Bridge International — the exact 6 named in `Master-Context.md` §4.1). Columns = the user's own six-criteria literature review framework (Personalisation, Decoupled Delivery, Structured Guidance, Accessibility, Adaptability, Engagement). See §5 — the original filled-in version of this table was never saved anywhere (confirmed via `ARTIFACTS-AND-DOCS-INDEX.md` §4), so §4 below is freshly authored against the same framework/systems, not a recovery of lost content. |
| Visual language | Reuses the existing app design system exactly — same color tokens, `rounded-card`/`shadow-paper`, lucide icons, `ClassBanner`-style gradient art for visual interest instead of stock imagery. Coherent with the admin/facilitator redesign, not a new one-off style. |

## 3. Page Content

### 3.1 Hero

- Eyebrow: none (no institutional framing per decision above)
- Headline: **"The facilitator facilitates learning. The platform does the teaching."**
- Body (locked, verbatim, `Messaging.md` §1b):
  > The world is 44 million teachers short, and the good ones keep leaving the schools that need them most. StudyBuddy separates the teaching from the person in the room: an expert builds the lesson once, and any facilitator runs it in class, step by step, on a big screen. The facilitator facilitates learning. The platform does the teaching.
- "Read the full pitch ↓" — expands the 55-second pitch (`Messaging.md` §1) inline, collapsible.
- CTA: "See it in action →" → `/login`

### 3.2 Problem

Three short stat lines, each with a one-line source underneath in small type:
1. **44 million** more teachers needed worldwide by 2030 — *UNESCO, 2024*
2. **Over half** of children in poorer countries can't read a simple sentence by age 10 — *World Bank, 2025*
3. The teachers who are good enough to fix this keep getting hired away by better-paying schools, leaving the students who need them most behind.

### 3.3 How it works

Three-step plain-English flow, no tech jargon:
1. **An expert builds the lesson, once** — videos, activities, worksheets, assembled into an ordered sequence.
2. **A facilitator runs it live** — no teaching qualification needed. They log in, and the platform guides them through the lesson step by step on a screen in the classroom.
3. **The platform teaches. The facilitator supports** — plays the video, runs the activity, keeps the room on track, and helps whoever's stuck. The instruction itself comes from the platform, not from their own subject knowledge.

Below that: a quieter "View the technical architecture →" link/button, opens the claude.ai System Architecture artifact in a new tab.

### 3.4 How StudyBuddy compares

Intro line: "Built against the same six criteria used to evaluate every model of education delivery — from traditional classrooms to online courses to community tutoring."

Table — see §4 for full content and reasoning.

## 4. Comparison Table (draft — please review before I build this)

Rating per cell: **Strong** / **Partial** / **Weak**, plus a short reason. This is new content authored for this page against the framework named in `Master-Context.md` §4.1 — not a recovered version of any prior table.

| | Personalisation | Decoupled Delivery | Structured Guidance | Accessibility | Adaptability | Engagement |
|---|---|---|---|---|---|---|
| **StudyBuddy** | Partial — curriculum-matched, not per-student | **Strong** — any screened facilitator can run it | **Strong** — locked, step-by-step lesson flow | Partial — needs a device + internet, no offline mode yet | Partial — new curricula addable, no adaptive difficulty yet | Strong — live human in the room + interactive blocks |
| Moodle | Partial (some adaptive plugins) | Weak — still needs a qualified teacher to run the course | Strong, for the teacher who built it | Partial — depends on the institution | Strong — highly configurable | Weak — depends entirely on the teacher |
| Google Classroom | Weak | Weak — a workflow layer, still needs a qualified teacher | Weak — empty shell, no built-in pedagogy | Strong — free, widely available | Weak — not built for content adaptivity | Weak — depends entirely on the teacher |
| Khan Academy | Strong — mastery-based, per-student | Strong — no facilitator needed at all | Weak — self-paced only, no in-room guidance | Strong — free, huge library | Strong — adapts to performance | Weak for K-12 — low completion without supervision |
| Kolibri | Partial | Strong — offline content, minimal supervision needed | Partial — curated, not live-guided | **Strong** — offline-first, built for low connectivity | Partial | Weak — same self-paced limitation |
| LEAD School | Partial | Weak — still relies on a trained, employed teacher | Strong — full curriculum + teacher training | Partial — cost tied to teacher availability | Partial | Strong |
| Bridge International | Weak | Partial — script replaces the teacher's expertise, but a human still reads it live | Strong — heavily scripted | Partial — needs a tablet + trained reader | Weak — rigid scripts, criticized for inflexibility | Partial |

Note built into the page, small print under the table: "Assessed against publicly known product behaviour, not a formal audit."

## 5. Open items — need your call before I build

1. **"30-second pitch" doesn't exist.** `Messaging.md` confirms only the 55-second and 2-3 sentence pitches are locked; the 30-second version was dropped 25 Sept. I've used the 55-second one for the expand action (§3.1). Confirm that's right, or give me different short-form text.
2. **System Architecture artifact is from July.** It predates the `Block`/`Notification`/curriculum/banner schema additions and the worksheet generator. I'll still link it (real diagrams beat none), but it may show an outdated data model if someone actually opens it. Fine to link as-is, or hold off on that button until it's refreshed?
3. **Comparison table (§4) is newly written**, not recovered — the original was never saved anywhere (only the framework + system names survived). Please sanity-check the ratings before I put them on a page you're about to show people, especially the StudyBuddy row.

## 6. Architecture (build plan, once §5 is resolved)

- `app/about/page.tsx` — new public route, server component (all content is static, no DB queries).
- Small local components for Hero/Problem/HowItWorks/Comparison sections if the file gets unwieldy, otherwise one file — same style as other admin pages, no new patterns.
- `app/login/page.tsx` — add an "About this project" text link on the left marketing panel.
- `app/admin/_components/AdminSidebar.tsx` — add "About the project" link (Info icon), `target="_blank"`, near the bottom.
- `app/facilitator/_components/FacilitatorSidebar.tsx` — same addition, same placement, for consistency.
- No new dependencies, no schema changes, no env vars.
