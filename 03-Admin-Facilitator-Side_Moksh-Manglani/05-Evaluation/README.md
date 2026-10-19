# 05 · Evaluation

The evidence behind Chapter 6 of the final report. Every number in Report Tables 5, 6, 7, A2 and A3 comes from a script in [`scripts/`](scripts/) and a result file in [`raw/`](raw/). The full write-up of every test, with method, expected result, actual result and evidence file, is [`EVALUATION_RESULTS.md`](EVALUATION_RESULTS.md).

## What was evaluated

The evaluation asks whether the platform does what the design claims, not whether students learn more from it (that would need a classroom study; see [`05-Future-Work-and-Handover`](../../05-Future-Work-and-Handover/)).

| Method | Answers | Report | Evidence here |
|---|---|---|---|
| Benchmark on the six criteria | SQ3 | 6.2, Table 4 | [`01-Research`](../01-Research/) |
| Heuristic review (Nielsen's ten), two passes | SQ2 | 6.3, Tables 5 and A1 | `EVALUATION_RESULTS.md` section E; first pass in [`06-AI-Use/for-evaluation`](../06-AI-Use/for-evaluation/) |
| Informal design feedback | SQ2, SQ3 | 6.4 | [`02-Informal-Feedback`](../02-Informal-Feedback/) |
| Technical tests: access, lesson flow, speed | SQ2 | 6.5, Tables 6, 7, A2 | Sections A, B, C |
| Authoring effort and the worksheet generator | SQ1 | 6.6, Table A3 | Section D |

## Results at a glance

| Test | Result |
|---|---|
| Protected routes without signing in | 20 of 20 redirected to login (local build and live site) |
| Forged admin actions with a facilitator session | 19 of 19 rejected, no data changed |
| Lessons, classes or subjects not granted | 8 of 8 not found |
| Sign-in before approval or before using the invite | 0 of 7 worked |
| Lesson-flow rules | 13 of 14 pass; locked content never reaches the browser |
| Page and action speed (local production build) | Median 0.56 s to 1.15 s; a 25-step lesson loads as fast as a 5-step one |
| Public pages on the live site | Median 61 to 88 ms from Auckland |
| Worksheet generator | 14 of 15 lessons produced a worksheet (1 empty lesson correctly refused); 0 wrong numeric or science answers in 158 questions; median 15.6 s and $0.017 each |
| Heuristic review, second pass | 27 problems found (1 at severity 4, 7 at severity 3) |

## Test environment

| Item | Value |
|---|---|
| Dates | 18 to 19 October 2026 |
| Code tested | Commit `87fc4fa` of the platform (in [`04-Code`](../04-Code/)) |
| Authenticated tests | A local **production build** (`next build` then `next start`, port 3002) wired like production: transaction pooler, the real Supabase project (Sydney), email sending off |
| Live-site tests | Unauthenticated only: redirects and public pages |
| Machine | MacBook, Apple M1, 8 GB RAM, macOS 26, Node v25.8.2, Next.js 14.2.35 |
| Location | Auckland, New Zealand. Database in Sydney. Locally, the app server ran on the laptop, the reverse of production, so local timings are indicative |
| AI models and prices | Claude Haiku 4.5 ($1 / $5 per million input / output tokens) and Claude Sonnet 5 ($2 / $10) |
| Test data hygiene | Every test row was prefixed `ZZ-EVAL` and deleted afterwards (`scripts/cleanup.mjs`). Database counts matched before and after |

## Folder contents

| Path | Contents |
|---|---|
| [`EVALUATION_RESULTS.md`](EVALUATION_RESULTS.md) | Full results, environment, limitations |
| [`scripts/`](scripts/) | Node.js test harness (ES modules). `lib.mjs` (HTTP client, form sign-in, Server Action calls), `env.mjs` (loads the platform's `.env`), `db.mjs` (Prisma client) |
| [`raw/`](raw/) | JSON output of every test, plus `anthropic-usage.jsonl` (all 80 AI calls with tokens and timings) |
| [`fixtures/`](fixtures/) | The authored PDF, DOCX and text sources used to test the worksheet generator |

| Script | Test | Output |
|---|---|---|
| `setup-fixtures.mjs` | Creates test classes, lessons and accounts | `raw/fixtures.json` |
| `a1-access.mjs` | Section A: routes, forged admin actions, ungranted content, drafts, worksheet endpoints | `raw/a1-access.json` |
| `a2-auth.mjs` | Section A: sign-in before approval, invite links, password change, file privacy | `raw/a2-auth.json` |
| `b-flow.mjs` | Section B: lesson-flow rules and forged progress | `raw/b-flow.json` |
| `c-perf.mjs`, `c-perf-live-public.mjs` | Section C: response times | `raw/c-perf-local.json`, `raw/c-perf-live-public.json` |
| `d0-scan-videos.mjs`, `d-sources.mjs`, `d1-setup.mjs`, `d2-run.mjs`, `d3-view.mjs`, `d4-extra.mjs`, `d5-nokey.mjs`, `d6-perf.mjs` | Section D: worksheet generator test set, regenerate, finalise, no-key behaviour, timing | `raw/d-*.json`, `raw/d0-video-scan.json` |
| `e1-evidence.mjs` | Section E: evidence for heuristic findings | `raw/e1-evidence.json` |
| `cleanup.mjs` | Deletes every `ZZ-EVAL` row | |

## Re-running the tests

1. Set up the platform locally against **your own** Supabase project (see [`04-Code`](../04-Code/)), seed it, and make sure `.env` is in the platform folder.
2. Copy `scripts/` into the platform folder as `eval/` and `fixtures/` into `eval/fixtures/`.
3. Set the seeded accounts' password for the harness: `export SEED_PASSWORD=...`
4. From the platform folder:

```bash
npm run build
node eval/extract-action-ids.mjs     # finds the Server Action ids in the build
./eval/start-server.sh               # production server on port 3002
node eval/setup-fixtures.mjs
node eval/b-flow.mjs
node eval/a1-access.mjs
node eval/a2-auth.mjs
node eval/c-perf.mjs
node eval/d1-setup.mjs && node eval/d2-run.mjs && node eval/d4-extra.mjs && node eval/d6-perf.mjs
node eval/d5-nokey.mjs               # needs the server started with ./eval/start-server-nokey.sh
node eval/e1-evidence.mjs
node eval/cleanup.mjs
```

Results are written to `eval/raw/`. Expect different absolute timings on different hardware and networks, and different worksheet questions on each run (the AI is non-deterministic).

## Fixed after the evaluation

The second heuristic review and the informal feedback were acted on the day after testing. These fixes are in the code but **not** reflected in the results above, which describe the platform as tested.

| Finding | Fix | Commit |
|---|---|---|
| 1.1 Facilitator lesson list always said "Not started" | Shows Not started, In progress or Completed | `7bb4719` |
| 1.4 Every tab title was "StudyBuddy" | Each page has its own title | `1830d3c` |
| 4.2 Form labels not tied to inputs | Labels tied to inputs on login, sign-up and set-password | `dbab3da` |
| 8.2 Contrast below WCAG AA | Muted text and primary buttons meet AA in all three themes | `af4ec82` |
| 4.1 Emoji block icons | Lucide icons throughout | `a69528d` |
| 5.2 Most seeded video links could not play | Playlist links play; links that cannot play no longer show a blank player | `98cf4c2` |

## Limitations

- The platform was not tested in a classroom, so nothing here measures learning.
- Authenticated tests ran on a local production build of the same code and database as the live site, not on the live site itself.
- Timings come from one laptop in Auckland with the database in Sydney, with sequential runs and no concurrency.
- Worksheet quality was graded by the author's AI assistant on one generation per lesson, not by teachers, so five worksheets were flagged for a human check.
- The heuristic review had one evaluator per pass, with no screen reader, automated accessibility scan or mobile testing.
