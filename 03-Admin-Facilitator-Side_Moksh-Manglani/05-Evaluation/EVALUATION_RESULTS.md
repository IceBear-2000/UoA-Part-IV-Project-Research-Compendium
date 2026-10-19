# StudyBuddy: evaluation test results

> Inputs to Chapter 6 (Evaluation) of the final report. This record was produced by Moksh's AI coding assistant (Claude Code) running the scripts in `scripts/`, which is why it is written in the first person. Moksh reviewed the results before they were used in the report.

Run on 18 to 19 October 2026 (NZ time). Every number below came from a script in `eval/` and a raw file in `eval/raw/`. Nothing is estimated. Where a test could not be run, the row says so and gives the reason.

## 0. Environment

| Item | Value |
|---|---|
| Date of run | 2026-10-18 10:32 UTC to 2026-10-19 (NZDT evening onwards) |
| Commit tested | `87fc4fa910012b9fd9014b16b62a17b5e620d2a8` (main). One uncommitted, unrelated change in the working tree: the card/list toggle in `app/admin/classes/_components/ClassesView.tsx` |
| Live site | https://study-buddy-uoa-project.vercel.app, served from Vercel `syd1` (response header `x-vercel-id: syd1::syd1::…`) |
| Where authenticated tests ran | A local **production build** (`next build` + `next start`, port 3002) of the same commit, wired like production: transaction pooler (port 6543, `pgbouncer=true`), real Supabase project `<supabase-project-ref>` (Sydney, `aws-1-ap-southeast-2` pooler), email sending switched off. Why not the live site: see Limitations 1 |
| What ran against the live site | Unauthenticated checks only (redirects and public pages) |
| Machine | MacBook, Apple M1, 8 GB RAM, macOS 26.3.1, Node v25.8.2, Next.js 14.2.35 |
| Network and tester location | Auckland, NZ (public IP lookup: Mercury NZ, AS55850). Connection type (Wi-Fi or wired) not determined. TCP connect to the live site 13 to 23 ms, TLS about 80 ms. Ping to the Supabase API host: avg 14.5 ms (min 8.3, max 19.7, 5 packets, 0% loss) |
| Position of tester vs server | Live site: tester in Auckland, server in Sydney. Local tests: the Node server ran **on the tester's laptop** (no network hop to the app), and the database was in Sydney. That is the reverse of production, where the app server sits next to the database and the user is far away. See Limitations 3 |
| AI model prices used | Claude Haiku 4.5 at $1 input / $5 output per million tokens; Claude Sonnet 5 at $2 / $10, from the `claude-api` reference cached 2026-10-06. The app calls `claude-haiku-4-5-20251001` and `claude-sonnet-5` |
| Database before and after | Same counts before and after (3 users, 113 lessons, 110 published, 3 draft, 322 blocks, 6 progress rows, 1 request, 1 message, 11 notifications, 8 classes). All test rows were prefixed `ZZ-EVAL` or `zz-eval` and deleted afterwards (`eval/cleanup.mjs`) |

## 1. Summary

| Section | What was tested | Result | Headline |
|---|---|---|---|
| A. Access control | 20 protected routes, 19 forged admin actions, 8 ungranted resources, drafts, sign-in before approval, invite links, password change in Settings, file privacy, personal data | **All reported checks pass** | Every protected route redirected to login, 19 of 19 forged admin actions were rejected and changed nothing, a facilitator could not open anything not granted, and no student data is stored. These are the results summarised in Table 6 of the final report |
| B. Lesson-flow rules | 4 stated rules plus 4 forging attempts | **13 of 14 pass** | All four rules hold and every forged progress call was rejected. One real bug: if an admin deletes a finished block while a facilitator is mid-lesson, the facilitator skips an unfinished step |
| C. Performance | 7 series, 25 runs each, plus 20 end-to-end worksheet runs | **Measured; live-site authenticated numbers NOT produced by me** | Local production build: median 0.56 s to 1.15 s for every page and action. Live public pages: median 61 to 88 ms. Worksheet generation: median 15.6 s end to end, median $0.017 |
| D. Worksheet generator | 15 lessons (14 produced a worksheet; 1 empty lesson correctly refused) | **Works, but quality is uneven** | 0 wrong numeric or science answers in 158 questions, regenerate works, nothing is ever overwritten. Problems: sources over 60,000 characters are silently cut (D14 produced an off-topic worksheet), the prompt gets no grade or curriculum, and some summaries add facts not in the source |
| E. Heuristic review v2 | 10 heuristics, whole app | **27 problems found, all open** | Worst: 88% of seeded video blocks cannot play in the app's player (severity 4); facilitator lesson list always says "Not started"; lessons with no blocks are listed but 404 |

Five worksheets to check by hand (reasons in D3): **D14, D07, D02, D03, D05**.

---

## A. Access control

Result key: PASS / FAIL / NOT RUN. "Evidence" is the raw output; the file is named in the last column of the evidence line.

### A1 to A11 as requested

| # | Check | Expected | Actual | Result | Evidence |
|---|---|---|---|---|---|
| A1 | Unauthenticated visit to every `/admin/*`, `/facilitator/*`, `/dashboard` route (20 routes) | Redirect to `/login` | 20 of 20 returned 307 to `/login`, on the local build **and** on the live site | PASS | `eval/raw/a1-access.json` |
| A1b | Unauthenticated forged Server Action (`createClass`, no cookie) | Blocked before it runs | HTTP 307 to `/login`; class count 8 before and after | PASS | same |
| A2b | Facilitator session sends 19 forged admin Server Actions (raw POST with the `Next-Action` header) | Each rejected, nothing changes | 19 of 19 rejected; server log shows `Error: Unauthorized` for each; classes, subjects, blocks, publish status, block title, Moksh's assignments, names, org name, fake sign-up requests and Moksh's password all unchanged | PASS | same |
| A2c | Same request format with an admin session (positive control) | Accepted | HTTP 200, block count 2 to 3 | PASS | same |
| A3 | Facilitator opens a lesson, class or subject they were not granted (8 cases: wrong class, wrong subject in a granted class, guessed URLs, completion page) | 404, nothing leaked | 8 of 8 returned 404 | PASS | `a1-access.json` |
| A3b | Forged `markBlockDone` on a lesson not granted (class not granted for Moksh, subject not granted for May) | Rejected, no progress row | Both: `Not assigned to this lesson`; 0 progress rows created | PASS | same |
| A4 | Draft lesson inside a granted subject: open by URL, see in list, mark a step done | 404, hidden, rejected | Open 404, completion 404, absent from list, `markBlockDone` gave `Lesson not found`, 0 progress rows. Positive control: after the admin publishes it, it opens (200) and lists; after unpublishing, 404 again | PASS | same |
| A5 | Person who requested access but is not approved tries to sign in (4 passwords) | No account, every attempt rejected | Request stored as PENDING; **no** Supabase auth user exists; 0 of 4 sign-ins worked | PASS | `a2-auth.json` |
| A5b | Approved person who has not opened the invite yet tries to sign in (3 guesses incl. the link token as the password) | Rejected | 0 of 3 worked | PASS | same |
| A5c | After using the invite and setting a password | Can sign in | Sign-in succeeded | PASS | same |
| A6a | Tampered invite link (last character of the token changed) | Rejected | HTTP 303, no tokens issued, message "Email link is invalid or has expired" | PASS | same |
| A6b | Genuine invite link, first use | Issues a session | Access and refresh token issued, redirect to `/auth/confirm` | PASS | same |
| A6c | Same link a second time | Rejected | No tokens issued, same message | PASS | same |
| A6d | Expired invite link | Rejected after expiry | **NOT RUN.** The link lifetime is a Supabase project setting that I could not read with the available keys, and waiting out an unknown lifetime was not practical. Code review: `/auth/confirm` and `/set-password` show "This link has expired or already been used" for invalid links | NOT RUN | n/a |
| A7 | Admin changes password without the correct current password (wrong, empty, 3-character new) | Each rejected, password unchanged | Server errors "Current password is incorrect.", "Enter your current password.", "New password must be at least 6 characters."; old password still signs in; attempted new password does not | PASS | `a2-auth.json` |
| A7c | `/set-password` with no session | No form | Shows "Link expired", no form | PASS | same |
| A8 | Stored file requested with no signed link: public URL, anon-key URL, anon bucket listing | None returns the file; bucket private | Public URL HTTP 400; anon-key URL HTTP 400; anon list HTTP 200 with `[]`; `bucket.public = false` | PASS | same |
| A8b | Signed link the app gives a facilitator | Works, expires | HTTP 200 `application/pdf`, 13,201 bytes; lifetime `exp - iat` = 3600 s (matches code) | PASS | same |
| A8d | Link after expiry (a 3-second link on the same file, to show the mechanism; the app's own links last 3600 s) | Works then rejected | t=0 s HTTP 200; t=6 s HTTP 400 `"exp" claim timestamp check failed` | PASS | same |
| A9 | Progress forging (also in section B): block 3 before block 2; last block first; block id from another lesson; block 3 while block 2 is active | Rejected on the server | 4 of 4 rejected (`This step is locked.` x3, `Block not found`); progress unchanged each time | PASS | `b-flow.json` |
| A10 | Worksheet endpoints (`analyzeLessonContent`, `generateWorksheetDraft`, `finalizeWorksheetBlock`) called by a non-admin, and with no session | Rejected, no AI call, no block | Non-admin: all 3 `Unauthorized`; no session: 307; Anthropic calls logged during the test: **0**; blocks 2 to 2 | PASS | `a1-access.json` |
| A11 | List every table and column holding personal data; is any student data stored? | See table below | **No student table or column exists** (no column name suggests student, child, pupil, learner, date of birth, phone, address, photo or parent). Personal data is staff data plus free text | PASS (with notes) | `a11-schema.json` |

#### A11: where personal data lives

| Table.column | Data | Personal data? | Rows at test time |
|---|---|---|---|
| `User.name`, `User.email` | Staff name and email (admins and facilitators) | Yes | 3 (4 during tests) |
| `User.authId` | Link to the Supabase account | Identifier | 3 |
| `SignupRequest.name`, `.email`, `.requestedClassNote`, `.rejectionReason` | Applicant name, email, free text | Yes | 1 |
| `Message.body` | Free-text chat between admin and facilitator | Could contain anything a user types, **including student details if someone types them** | 1 |
| `Notification.body`, `.link` | System text, sometimes a person's name ("New message from X") | Names only | 11 |
| `LessonProgress` (facilitator id, lesson id, block ids, timestamps) | Which facilitator did which lesson | Staff activity record | 6 |
| `FacilitatorAssignment` | Who teaches which class and subject | Staff record | 8 |
| `Organisation`, `Class`, `Subject`, `Lesson`, `Block` | Curriculum content | No | n/a |
| Supabase `auth.users` (outside the app schema) | Email, password hash, phone, last sign-in, IP and metadata columns, `name` in user metadata | Yes | 3 |
| Third parties that receive data | Resend (approval emails), Anthropic (lesson text and transcripts, **not** student data), YouTube (transcript fetch) | n/a | n/a |

### Additional checks

| # | Check | Expected | Actual | Result | Severity (my judgement) | Evidence |
|---|---|---|---|---|---|---|
| X4 | CSRF: admin cookie plus Server Action POST with `Origin: https://evil.example` | Rejected | Rejected by the framework ("`x-forwarded-host` header … does not match `origin` header … Aborting the action."); block count unchanged | PASS | n/a | `a1-access.json` |
| X7 | Facilitator messages another facilitator | Rejected | `Messaging is only between admins and facilitators.`; message count unchanged | PASS | n/a | `a1-access.json` |
| X9 | Server-only secrets in the built browser bundle (service-role key, DB URL, Anthropic key, Resend key) | None | None found in `.next/static` | PASS | n/a | same |

---

## B. Lesson-flow rules

Test lesson: 5 blocks, facilitator Moksh, local production build. Result: 13 of 14 pass.

| # | Rule or attempt | Expected | Actual | Result |
|---|---|---|---|---|
| B1 | First open: only block 1 is unlocked | states active, locked x4; locked content `null`; progress index 0 | `allll`; locked content null; index 0 | PASS |
| B1b | Locked blocks' content never reaches the browser | Steps 2 to 5 text absent from the whole page payload | 0 of 4 leaked; step 1 present | PASS |
| B2 | Finishing block 1 unlocks exactly block 2 | `dalll`; step 2 text appears, step 3 does not | As expected | PASS |
| B2b | Re-marking a finished block | No movement, no duplicate id | Index stays 1, 1 id stored | PASS |
| B3 | Progress survives a page refresh | Same states | `ddall` before and after | PASS |
| B3b | Progress survives sign-out and sign-in | Same states; logged-out request redirected | `ddall` after re-login; logged-out `/facilitator` gave 307 to `/login` | PASS |
| B4 | Completion page before the lesson is finished | Redirected back into the lesson | 307 to the lesson | PASS |
| B5 | Last block marked done | `completedAt` set, nothing locked, all 5 contents visible, completion page 200 | Exactly that | PASS |
| B5b | Revisiting a step after completion | No regression | Index 4 to 4, `completedAt` kept | PASS |
| A9a to A9d | Forged skip-ahead and cross-lesson calls | Rejected | 4 of 4 rejected | PASS |
| **B6** | Admin deletes an already-finished block while a facilitator is mid-lesson | Every step shown "done" was actually done | **Facilitator skips a step.** Progress is stored as a position (`currentBlockIndex`) plus a set of ids. After the delete the blocks renumber, the stored index now points one block further, and "Mid 3", which this facilitator never completed, is shown as done. Active step became "Mid 4" | **FAIL (Medium-High)** |

---

## C. Performance

Method: 1 warm-up request (reported separately), then 25 timed sequential runs per series. Median is the middle value; p95 is the nearest-rank 95th percentile (for 25 runs, the 24th value; for 20 runs, the 19th). Single user, no concurrency.

### C1. Local production build (authenticated), tester and server on the same laptop, database in Sydney

| Series | n | Median (ms) | p95 (ms) | Min | Max | Warm-up request (ms) |
|---|---|---|---|---|---|---|
| Admin dashboard, `GET /admin` | 25 | 756.6 | 965.6 | 708.1 | 985.4 | 1265.7 |
| Facilitator dashboard, `GET /facilitator` | 25 | 828.5 | 930.8 | 765.8 | 972.4 | 759.9 |
| Lessons index, `GET /admin/lessons` (125 lessons in the database at the time: 113 real plus 12 test rows) | 25 | 555.6 | 1214.4 | 509.0 | 1707.8 | 996.5 |
| Lesson player, 5-step lesson | 25 | 1149.2 | 1230.7 | 1085.1 | 1238.9 | 1345.5 |
| Lesson player, 25-step lesson | 25 | 1137.8 | 1566.8 | 1080.0 | 1606.3 | 1330.7 |
| Add block (`addBlock` Server Action round trip) | 25 | 1124.0 | 1238.6 | 1072.0 | 1242.9 | 1822.6 |
| Mark step done (`markBlockDone`, 25 steps walked once) | 25 | 1122.8 | 1184.6 | 1066.8 | 1196.4 | n/a (first sample 1139.2) |

Raw: `eval/raw/c-perf-local.json`.

**These are not production numbers.** In this setup every database and sign-in round trip crosses Auckland to Sydney (about 15 to 25 ms each, several per request), which production does not pay because the server sits next to the database. They also exclude Vercel cold starts. The consistent ~1.1 s for the lesson player, add block and mark step done suggests about the same fixed per-request cost (sign-in check plus database queries) in each. One earlier, single measurement on the live site on 20 September (add block, after the `syd1` fix) was 434 ms; that was one sample, not part of this run.

### C2. Live production (Vercel `syd1`), unauthenticated public pages, measured from Auckland

25 timed runs after 1 discarded warm-up; connections were kept alive, so TLS set-up is excluded after the first request.

| Page | TTFB median (ms) | TTFB p95 (ms) | Total median (ms) | Total p95 (ms) |
|---|---|---|---|---|
| `/login` | 88.1 | 114.7 | 89.7 | 116.4 |
| `/about` | 61.3 | 75.9 | 62.7 | 77.4 |
| `/admin` (unauthenticated, 307 from the middleware) | 39.3 | 66.1 | 46.8 | 67.5 |

Raw: `eval/raw/c-perf-live-public.json`.

### C3. Live production, authenticated pages and actions: NOT produced by me

Reason: entering the account passwords into the live site is outside what I am allowed to do (see Limitations 1). I wrote the script so you can run it yourself; it creates its own `ZZ-EVAL-PERF` lessons, measures, and deletes them:

```bash
BASE=https://study-buddy-uoa-project.vercel.app \
ADMIN_EMAIL=... ADMIN_PASSWORD=... FAC_EMAIL=... FAC_PASSWORD=... \
node eval/c-perf.mjs
```

It writes `eval/raw/c-perf-live.json`. It needs the repo's `.env` (to create and remove the test lessons) and the action IDs file `eval/action-ids.json` (made from a local build of the same commit; the script stops with a clear error if the live site rejects an ID). Placeholder for your Chapter 6 table: **[LIVE syd1 authenticated numbers: to be filled from your run]**.

### C4. End-to-end worksheet generation (local server calling the real Anthropic API from Auckland)

20 runs of the full two-step pipeline on one standard lesson (D04, a 5,963-character captioned transcript).

| Step | n | Median | p95 | Min | Max |
|---|---|---|---|---|---|
| Summary step (fetch transcript, read blocks, Claude Haiku) | 20 | 4,466 ms | 6,375 ms | 4,181 ms | 15,018 ms |
| Worksheet step (Claude Sonnet) | 20 | 11,023 ms | 13,117 ms | 9,129 ms | 15,748 ms |
| Both steps | 20 | 15,568 ms | 17,518 ms | 13,939 ms | 30,765 ms |

| Tokens per run | Median | p95 | Min | Max |
|---|---|---|---|---|
| Summary: input | 2,543 | 2,543 | 2,543 | 2,543 |
| Summary: output | 167.5 | 192 | 147 | 200 |
| Worksheet: input | 1,267 | 1,304 | 1,244 | 1,310 |
| Worksheet: output | 1,137.5 | 1,284 | 865 | 1,340 |

| Cost per worksheet (both steps) | Median | Mean | Min | Max |
|---|---|---|---|---|
| USD | $0.01718 | $0.01727 | $0.01448 | $0.01938 |

20 runs cost $0.3453 in total. Across the 14 worksheets of the test set (varying source sizes) the cost ranged from $0.0121 to $0.0432 per lesson (the high end is D05's 27,795-token summary input; D11, the empty lesson, cost $0); total $0.2705, mean $0.0193. Every worksheet call ended with `stop_reason = tool_use` (no truncation). All 80 Anthropic calls of this whole evaluation cost $0.736. Raw: `eval/raw/d6-perf.json`, `eval/raw/anthropic-usage.jsonl`.

---

## D. Worksheet generator test set

### D1. How the set was built

15 lessons across NCERT Grade 1 to 4 and NZC Year 1 to 4, maths and science (NCERT has no separate science in Grades 1 and 2, and uses EVS in Grades 3 and 4, so EVS stands in for science there). Each was created as a hidden draft by copying the blocks of a real lesson and, where the design needed it, adding an authored PDF or DOCX. YouTube captions are real. The generator was driven through the app's own Server Actions as an admin, exactly as the wizard does (summary step, then worksheet step with question types "MCQ" and "short answer" and no special instructions).

**Important background found while choosing sources:** of the 104 video blocks in published lessons, **92 (88%) cannot be used as a video**: they are YouTube playlist or channel pages, placeholders or empty. Those give no transcript and cannot play in the app's player (see E, item 5.2). Every NZC lesson (60 of 60) is affected. That is why no NZC lesson has a "YouTube with captions" source; all captioned cases are NCERT. These links came from the curriculum content seeded earlier in this project.

Scoring rubric (set before grading, applied by one AI grader, see Limitations 6):
- **Summary accuracy, 0 to 2:** 2 = every substantive claim is in the source; 1 = some substantive claim not in the source, or a main point missing; 0 = wrong or off-topic.
- **Curriculum fit, 0 to 2:** 2 = topic and level right for the stated grade throughout; 1 = on topic but some items clearly above or below the grade; 0 = wrong topic or level.
- **Answer key, 0 to 2:** I worked every answer. 2 = all correct and unambiguous; 1 = one error or an answer the source does not support; 0 = two or more.
- **Edits needed:** number of questions I would change before giving it to children (correct, reword, replace).

### D2. Results

| ID | Class, subject, lesson | Sources | Summary | Fit | Key | Edits | Message shown for an unreadable source |
|---|---|---|---|---|---|---|---|
| D01 | NCERT G1, Maths, Addition | YouTube with captions (1.1k chars) + worksheet block | 2 | 1 | 2 | 2 | none needed |
| D02 | NCERT G2, Maths, Shapes Around Us (3D) | YouTube with captions (Hindi, 14.9k chars) + reading + activity | 1 | 1 | 1 | 2 | none needed |
| D03 | NCERT G3, EVS, Family and Friends | YouTube with captions (Hindi, 9.2k) + reading + activity | 1 | 1 | 1 | 2 | none needed |
| D04 | NCERT G4, Maths, Multiplication | YouTube with captions (6.0k) + worksheet + break | 2 | 2 | 2 | 1 | none needed |
| D05 | NCERT G4, EVS, Our Sky | YouTube with captions (Hindi, 38.6k) + reading + activity | 2 | 2 | 2 | 1 | none needed |
| D06 | NCERT G3, Maths, Fun with Shapes | **YouTube with captions disabled** + reading + activity | 2 | 1 | 2 | 3 | "Couldn't get a transcript for "Maths Mela - Class 3 playlist" - [YoutubeTranscript] 🚨 Transcript is disabled on this video (https://www.youtube.com/watch?v=73O60ymw9D4)" |
| D07 | NCERT G1, Maths, Mango Treat | PDF (authored) + playlist link + reading + activity | 2 | 1 | 1 | 3 | "Couldn't get a transcript for "Joyful Mathematics - Class 1 playlist" - [YoutubeTranscript] 🚨 Impossible to retrieve Youtube video ID." |
| D08 | NZC Y1, Maths, Counting and Ordering to 20 | DOCX (authored) + channel link + reading + activity | 2 | 1 | 2 | 2 | same "Impossible to retrieve Youtube video ID" message |
| D09 | NZC Y1, Science, Living and Non-Living | PDF (authored) + channel link + reading + activity | 2 | 1 | 2 | 2 | same |
| D10 | NZC Y2, Maths, Telling Time to the Half Hour | channel link + two short text blocks only | 1 | 2 | 2 | 0 | same |
| D11 | NZC Y2, Science, States of Matter | **Empty lesson** (one blank note) | n/a | n/a | n/a | n/a | "This lesson has no readable content yet (no transcripts, documents, or instructions)." No AI call was made (0 tokens, $0) |
| D12 | NZC Y3, Maths, Fractions | DOCX (authored) + channel link + text | 2 | 1 | 2 | 2 | same |
| D13 | NZC Y3, Science, Life Cycles | PDF (authored) + channel link + text | 2 | 2 | 2 | 1 | same |
| D14 | NZC Y4, Maths, Angles and Shape Properties | **Very long DOCX** (308,232 characters; the topic is in the last part, at character 307,513) + channel link + text | **0** | **0** | 1 | **15** | video warning only. **No warning that the source was cut** |
| D15 | NZC Y4, Science, The Water Cycle | PDF + DOCX (authored, two documents) + channel link + text | 2 | 2 | 2 | 0 | same |

14 worksheets, 158 questions. Mean summary accuracy 1.64 of 2; mean curriculum fit 1.29 of 2; mean answer-key score 1.71 of 2; edits: median 2 per worksheet (total 36; 21 across the 13 worksheets other than D14).

**Answer keys.** I found 0 wrong arithmetic or science answers in the 158 questions. The 6 questionable keys were: D02 Q11 (muddled answer: star stickers named as a 3D shape example), D03 Q4 and Q11 (pakoras and "peekaboo" are not in the source for the person or game asked about), D07 Q11 (asks for the number before 1 and after 9 and answers "none"; 0 and 10 exist), D14 Q9 ("cents in a quarter" is a US coin, not an NZ one), D04 Q8 (overstates why you multiply from the ones place).

### D3. What went wrong, and the five worksheets to check by hand

| Problem | Evidence | Why it matters |
|---|---|---|
| **Long sources are silently cut** | D14: the summary step keeps only the first 60,000 characters (`combined.slice(0, 60_000)` in `lib/ai-worksheet.ts`). The summary described the first 12 of 60 topics ("counting, place value … time on a clock"), never mentioned angles or shapes, and the worksheet was entirely off-topic. The only warning shown was about the video link | An admin can ship a wrong worksheet without any sign that the source was truncated |
| **The prompt gets no grade, subject or curriculum** | `generateWorksheetDraft` sends only the summary, the question types and the special instructions. D06 (NCERT Grade 3, "Fun with Shapes") got Grade 1 questions ("How many sides does a triangle have?"); D14 used a US coin | Difficulty depends on what the summary happens to say, not on the class |
| **Summaries add facts not in the source** | D02: the summary teaches cones and spheres, which are not in the transcript (cube/cuboid, 12 ribbons for 12 edges, 8 corners and the prism are), and two questions (Q3, Q4) are built on them. D03: "peekaboo" not in the transcript. D10: a three-sentence source became a summary with clock-hand details | The summary review step is the only safeguard, and it works only if the admin reads it against the source |
| **Unreadable-source message uses internal wording** | "[YoutubeTranscript] 🚨 Impossible to retrieve Youtube video ID." | Not plain language for an admin |
| A source with a file **and** instructions ignores the instructions | In `analyzeLessonContent` the file branch runs first and `continue`s | Text typed into a block that also has a file is not summarised |
| Summary prompt says "no headings" | D05's summary starts with "# Chapter 10: Our Sky - Lesson Summary" | Minor |

**Five to check by hand, with reasons:**
1. **D14**: confirms the truncation failure.
2. **D07**: Q11 key is wrong or misleading, Q7 is ambiguously worded, and the worksheet is Grade 1.
3. **D02**: Hindi transcript, summary includes shapes not in the source, Q11 key muddled.
4. **D03**: Hindi transcript, several questions test plot details of the video; Q4 and Q11 are not supported by it.
5. **D05**: a 38,616-character Hindi transcript. I checked it by keyword (Chandrayaan, new and full moon, shadows, orange sky: all present; "sundial" not found) but did not read it in full.

(Optional sixth: D10, where the summary invented detail from a very thin source.)

### D4. Other generator behaviour

| Test | Result |
|---|---|
| Regenerate works | Yes, 2 of 2 (D04, D12). It makes **one** Sonnet call only (no Haiku call, no transcript or document fetch), about 10.5 s, and returns a different draft (D04: 8 questions vs 10 first time; D12: 10 vs 12) |
| Does the new block ever overwrite an existing one? | **No.** 14 of 14 finalisations added exactly one new `WORKSHEET` block at the end (order = old count); every existing block was byte-identical before and after. Finalising the same draft again added a second block. Two finalise calls at the same instant gave orders 5 and 6 (no duplicate order seen in this one trial; the count-then-create code is not atomic, so a race is possible in principle) |
| "Not configured" (no `ANTHROPIC_API_KEY`) | Summary step returns an empty summary plus the warning "AI generation isn't configured yet - ask an admin to add ANTHROPIC_API_KEY."; worksheet step returns the same as an error; the wizard shows it. No crash |
| **Live site state** | `vercel env ls production` today lists `DATABASE_URL`, `RESEND_API_KEY` (and the other Supabase keys); **`ANTHROPIC_API_KEY` is still not set**, so the live worksheet generator is currently in the "not configured" state |

---

## E. Heuristic review v2 (Nielsen's 10)

Method: one evaluator (me), reading the code for every page on both sides and testing the behaviours below against the running build and the real data. I did not run a screen reader or an automated accessibility tool. Severity is Nielsen's scale: 0 not a problem, 1 cosmetic, 2 minor, 3 major, 4 usability catastrophe. "Open" means I found it still present on 19 October.

### E0. The v1 review, checked

The v1 review (the artifact linked from Settings) lists only strengths. I tested its claims:

| v1 claim | Finding |
|---|---|
| Plain-language upload error: "Couldn't get a transcript for 'Warm-up song' - no captions available" | **Not accurate.** Real text: "[YoutubeTranscript] 🚨 Impossible to retrieve Youtube video ID." or "… Transcript is disabled on this video (URL)" |
| Two-click delete with a 3-second confirm | Verified in `BlockRow.tsx` |
| Step list shows done, active, locked plus "X of Y complete" | Verified in code and in B1 to B5 |
| Breadcrumbs on every nested page | Verified for the three facilitator pages read; admin pages not re-checked |
| Overview has five stat tiles and three quick links | **Out of date**: replaced by the actionable home page on 25 September |

### E1. Findings

| ID | Heuristic | Page | Problem and evidence | Sev | Status |
|---|---|---|---|---|---|
| 1.1 | 1 Visibility of system status | Facilitator lesson list | Every lesson says "Not started", always. The badge is fixed text. Test: a lesson the database records as completed still shows "Not started"; the page had 20 such badges | 3 | Open |
| 1.2 | 1 | All pages | There is no `loading.tsx` anywhere, so clicks give no feedback while the server renders (about 0.6 to 1.2 s here, more on a cold start) | 2 | Open |
| 1.3 | 1 | Facilitator dashboard | Shows classes only. No "continue where you left off" and no progress anywhere outside the lesson itself | 2 | Open |
| 1.4 | 1 and 4 | Every page | The browser tab title is "StudyBuddy" on all 9 pages checked (login, about, signup, admin overview, classes, lessons, settings, facilitator, messages). Tabs, history and screen readers cannot tell pages apart | 2 | Open |
| 2.1 | 2 Match with the real world | Worksheet wizard | Error text contains library names and an emoji (see D3) | 2 | Open |
| 2.2 | 2 | Admin and facilitator sidebars | The admin role is called "Admin", "Coordinator" and "Admin" in different places ("Admin overview", "Coordinator · Settings", "Chat with admin", "Coordinator · Admin") | 1 | Open |
| 3.1 | 3 User control and freedom | Lesson player | "Mark step done" has no undo and no confirm; on the last step one misclick completes the lesson permanently and shows the completion page | 2 | Open |
| 3.2 | 3 | Admin Requests | Approve has no confirm and no undo; it creates the account and sends the email at once (Reject takes a reason) | 2 | Open |
| 4.1 | 4 Consistency | Block types, logo | Block icons and the logo are emoji; every other icon is a Lucide line icon | 1 | Open |
| 4.2 | 4 | Login, sign-up | Labels are not tied to inputs (0 of 2 labels have `for`, 0 of 3 inputs have `id`) and there are no `autocomplete` attributes. Clicking a label does nothing, screen readers get no field names, password managers rely on guesswork | 3 | Open |
| 4.3 | 4 | Whole app | Admins get 3 themes and 2 layouts; facilitators are fixed to the default Warm theme (the lowest-contrast one, see 8.2) | 1 | Open |
| 5.1 | 5 Error prevention | Admin lesson publish, facilitator list | An admin can publish a lesson with no blocks. Facilitators then see it in their list and get a 404 when they open it. 2 exist now: NCERT Grade 1 English "Letter Sounds A-Z" and "Rhyming Words" (both listed, both 404) | 3 | Open |
| **5.2** | 5 and core function | Lesson player, admin editor | **92 of 104 video blocks (88%) in published lessons cannot play**. In the full scan of all 106 video blocks, 31 are playlist addresses, 40 are channel `@handle` pages, 20 are `/scishowkids` channel pages, 2 are `example.com` placeholders and 2 are empty. `resolveVideoEmbed` falls through to a plain `<video src>` for them, and the editor accepts any URL with no check or preview. 92 lessons start with this block, so a facilitator's first step is a broken video. All 60 NZC lessons are affected. (Verified from the stored URLs, the resolver code and the page payload; I did not watch the player render) | **4** | Open |
| 5.3 | 5 | Worksheet wizard | Sources over 60,000 characters are cut with no warning (D14) | 3 | Open |
| 5.4 | 5 | Lesson player | Progress is positional: deleting or reordering blocks mid-lesson makes a facilitator skip a step (B6) | 3 | Open |
| 5.6 | 5 | Facilitator lesson page | Opening a lesson (a GET) creates the progress row. My test did this accidentally on a real lesson | 1 | Open |
| 6.1 | 6 Recognition over recall | Facilitator sidebar | "Progress history" is greyed out with a tooltip only ("Coming in a later session"); keyboard and touch users see a dead item with no explanation | 1 | Open |
| 7.1 | 7 Flexibility and efficiency | Admin lessons list | 113 lessons, no bulk publish, unpublish or move | 2 | Open |
| 7.2 | 7 | Lesson player | No keyboard shortcut for next step; a facilitator driving a classroom screen clicks every time | 1 | Open |
| 8.1 | 8 Minimalist design | Admin Settings menu | "Project docs" shows three links to internal design documents (on claude.ai) to every admin; I did not check whether a stranger can open them | 1 | Open |
| 8.2 | 8 and accessibility | All pages, default theme | Contrast failures: muted text on the page background is **2.97:1** (Warm), 3.22:1 (Studio), 4.44:1 (Ledger); white text on the main button is **3.20:1** (Warm) and 3.05:1 (Studio). WCAG AA needs 4.5:1 for normal text. Warm is the default and the only theme facilitators see | 3 | Open |
| 8.3 | 8 and accessibility | Facilitator and admin shells | No responsive breakpoints at all in the shells or the player (fixed 244 px sidebar and 300 px step column), so tablet and phone layouts are not designed for | 2 | Open |
| 8.4 | 8 | Worksheet print | The Print button calls `window.print()` and the app has no print styles, so the printout includes the app chrome | 2 | Open |
| 9.1 | 9 Recognise and recover from errors | Every action that throws | In production, Next.js hides thrown error messages from the browser: the response contained only `E{"digest":"3683715349"}`. Messages such as "Current password is incorrect." (Settings) or "Could not add class" therefore do not reach the user as written. I saw the server response, not the final text on screen | 3 | Open |
| 9.2 | 9 | Whole app | No `not-found.tsx` and no `error.tsx` anywhere: a missing page shows Next.js's bare default 404 with no way back (combined with 5.1 this is what facilitators hit) | 2 | Open |
| 10.1 | 10 Help and documentation | Facilitator side | No in-app help or first-run guidance for running a lesson. The public About page explains the project, not the steps | 2 | Open |
| 10.2 | 10 | Admin worksheet wizard | Nothing says that sources over 60,000 characters or non-YouTube video links are skipped | 2 | Open |

27 problems: 1 at severity 4 (5.2), 7 at severity 3 (1.1, 4.2, 5.1, 5.3, 5.4, 8.2, 9.1), 12 at severity 2, 7 at severity 1. All 27 were open on 19 October 2026. The v1 review contained no problem list, so there was nothing from it to mark as fixed; problems already closed earlier in the project (the facilitator assignment display bug, the page-width bug, the slow-region fix) are not repeated here.

---

## Limitations of these tests

1. **Authenticated tests did not run against the live site.** I am not permitted to type account passwords into a live production site, so everything that needs a sign-in (sections A2 to A10, B, most of C, D) ran against a local production build of the same commit. That build uses the same code, the same Supabase database, auth and storage as the live site, with email sending off, so access-control and logic results should carry over; performance and Vercel-specific behaviour do not. Live-site coverage is limited to unauthenticated checks (A1, C2) and `vercel env ls`.
2. **Shared database.** The local build and the live site use one Supabase project, so tests wrote real rows. Every row was prefixed (`ZZ-EVAL`, `zz-eval`) and deleted, the counts match the start, and one stray progress row my own test created on a real lesson was removed. Between create and delete (roughly an hour or more), some test lessons existed as published rows in Moksh's and May's classes, so either of them could have seen them in their lesson lists.
3. **Performance numbers are not production numbers.** The tester and the server shared one 8 GB laptop in Auckland and the database was in Sydney, the reverse of production. No Vercel cold starts, no edge routing, no concurrency. Series are 20 to 25 sequential runs, so a p95 is effectively the second-highest sample. Worksheet timings include a real network call from Auckland to the AI provider and vary with the provider's load.
4. **The AI part is non-deterministic and thinly sampled.** One generation per test lesson (plus 20 repeats of one lesson for timing, which were not graded). The same lesson would give different questions on another run (regenerate showed this).
5. **Test sources.** The PDF and DOCX sources were written by me and are short (about 1,000 characters each) except the long document, which is generated filler with the topic placed last on purpose. YouTube transcripts are real, but all captioned cases are NCERT because no NZC lesson has a readable video. NCERT Grades 1 and 2 have no science, so science coverage is EVS in Grades 3 and 4 plus NZC Science.
6. **One AI grader.** The summary, fit and answer-key scores in D2, and the severity ratings in E, were all assigned by me (an AI assistant), not by a teacher or several raters, with no inter-rater check. Hindi captions were checked by keyword, not read in full. This is why five worksheets are flagged for a human check, and why the scores should be reported as "assessed by the author's AI assistant" rather than as an expert rating.
7. **Heuristic evaluation by one evaluator.** The method calls for several. It was partly code reading and partly live data checks, with no screen reader, no automated accessibility scan (no axe or Lighthouse run), no phone or tablet testing, and no users.
8. **Not tested.** File upload validation through the UI (the code trusts the browser-declared file type; not exercised), invite-link expiry (A6d), email delivery, multi-user concurrency, Supabase project settings, and denial-of-service or load.

## What to fix first (recommendation at the time of testing)

1. **5.2: fix the video links** (replace playlist and channel addresses with real video URLs or hide the block) and make the editor reject URLs it cannot play. This affected 88% of lessons. *(Since fixed: playlist links now play and links that cannot play no longer show a blank player.)*
2. **B6: store progress by block id**, not by position.
3. **5.1 and 1.1: block publishing a lesson with no blocks; show real progress on the facilitator list.**
4. **9.1: return `{ error }` values instead of throwing in Server Actions**, as the worksheet actions already do, so messages reach users in production.
5. **Worksheet generator: warn when a source is cut, pass the class and curriculum to the prompt, and tidy the error wording.**

## Files

Everything referenced above is in this folder. `raw/*.json` holds every result quoted; `raw/anthropic-usage.jsonl` holds the 80 AI calls with tokens and timings; `fixtures/` holds the authored PDF and DOCX sources; `scripts/` holds the test harness. See `README.md` in this folder for how to re-run each test.
