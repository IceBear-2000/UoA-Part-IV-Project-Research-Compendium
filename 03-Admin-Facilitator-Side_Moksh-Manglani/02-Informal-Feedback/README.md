# 02 · Informal Feedback

Notes from the informal feedback chats held during the project, and the design changes each one led to.

## Why "informal feedback" and not "interviews"

The project first planned a formal interview study under the University's human participants ethics process (see [`07-Ethics`](../07-Ethics/)). On the supervisor's advice in September 2026, it was replaced with informal feedback chats. What follows is therefore **design input, not research data**: it informed, checked and sometimes challenged design decisions, and it is not used to make general claims. The report treats it the same way (Sections 4.6, 6.4 and 8.3).

## Method

1. **Choose people for a specific perspective.** Each person was chosen for relevant experience: running a school's teaching staff, using and teaching on online platforms, or administering organisations.
2. **Keep the chat open, with a prepared question sheet.** Problem-focused chats used a question sheet built around the claims the report needed to test. Interface reviews were done on the live platform.
3. **Write notes, then link each point to a decision.** Notes were written up after each chat. Each point was then tagged as supporting, changing or challenging a specific design decision, so the path from what was said to what changed stays traceable.
4. **Look for themes across sources.** An informal thematic analysis (after Braun and Clarke) grouped points across the chats; see the table below.
5. **Separate their words from ours.** Where a point was the interviewer's summary and the person only agreed, it is marked as such and not quoted as theirs.

**Anonymity.** People are identified by role only. One reviewer asked not to be named. Personal notes from the chats are not included.

## The sources

| Notes | Who (by role) | When and how | Focus |
|---|---|---|---|
| [`01-Academic-Coordinator.md`](01-Academic-Coordinator.md) | Academic coordinator at a K-12 school in India; about 25 years in education; looks after 35 teachers | 6 October 2026, video call, about 60 minutes | The problem: teacher quality, teachers leaving, cover, what a good lesson needs; reaction to the idea (described, not demonstrated) |
| [`02-Academic-Head.md`](02-Academic-Head.md) | Academic head of a group of schools in India, responsible for academics and discipline | Mid-September 2026, written answers | The cost of a teacher leaving, training time, conditions for unqualified delivery |
| [`03-UI-UX-Reviewer.md`](03-UI-UX-Reviewer.md) | Medical student and tutor who has used several online learning platforms (asked not to be named) | October 2026, in person, about 20 minutes, on the live platform | The interface, on both the facilitator and admin sides |
| [Admin Redesign Log](../06-AI-Use/for-design/admin-redesign-log.html) | Saroj, a friend who has served as an admin in many organisations | Mid-September 2026, admin panel review | The admin panel; led to the redesign in Report Section 5.7 |

## Themes across the sources

| Theme | What was said | Design response | Bearing on the research question |
|---|---|---|---|
| **Delivery quality varies with the teacher** | Of 35 teachers, "five, six" go beyond the basics (coordinator). A good teacher "teaches from the heart"; a weak one "just passes time" (academic head) | The admin designs the lesson once, so every class gets the same design | Supports the problem statement and SQ1 |
| **A teacher leaving breaks continuity** | The cover teacher keeps the written work and drops the explanation (coordinator). Departures affect reputation and students compare teachers (academic head) | The lesson, not the person, carries the teaching, so it survives a change of facilitator | Supports the problem statement |
| **Nobody goes into a class unprepared** | Even an existing teacher gets a briefing and a day to prepare (coordinator). Training is three days now, moving to a week (academic head) | The locked **walkthrough** before delivery | Supports SQ2 |
| **Screening matters** | "Just like that you cannot send everyone." The right person is a patient listener (coordinator). Training, a buddy system and a code of conduct would be needed (academic head) | Request-then-approve access; code of conduct listed as future work | Supports SQ2; code of conduct is a gap |
| **A lesson is an ordered, timed plan** | Objective, material, method, delivery, check, outcome, inside a 40-minute period (coordinator) | Lessons are ordered blocks with durations | Supports SQ1 |
| **Videos must not be one-way** | Pausing a video and asking questions "impacts more" (coordinator) | Video blocks are broken up with activity, quiz and discussion blocks; the admin must build this in | Partly met; depends on the admin |
| **Classroom management comes first** | "Before teaching comes classroom management" (coordinator) | Not addressed by the platform | **Challenges** the model; listed as a limitation and future work |
| **The locked flow is understood without help** | "You have to do one step to get to the next step, which is good" (UI/UX reviewer) | Kept | Supports SQ2 |
| **Small labelling problems cost users time** | Step counts, "Assign", "Confirm", the way back from a lesson (UI/UX reviewer) | Six changes; see the reviewer's notes | Usability, SQ2 |

## Changes made because of this feedback

| Feedback | Change | Commit |
|---|---|---|
| "Assign" suggests adding only; removing access was hidden | Renamed to **Manage access**, with a clear remove action | `a56a29c` |
| "Confirm" on removing a block | The button now says **Delete** (still two clicks) | `71d4415` |
| No clear way back from a lesson | **Back to lessons** button in the lesson player and editor | `8f9ab6c` |
| Cards blend into the background | More contrast between cards and page, with a card-contrast setting | `4410211` |
| How soon will the admin reply? | Chat shows an expected reply time and whether the last message was seen | `fea3376` |
| Questions are expected during the walkthrough | After each step, the facilitator can **Continue** or **Ask the admin a question** | `9f4de08` |
| Classes and lessons did not do different jobs; no account controls; emoji | Admin redesign: class drill-down, grouped lessons, settings page, three themes, icons in place of emoji | `022ff8a`, `55c91fb`, `a69528d` |
