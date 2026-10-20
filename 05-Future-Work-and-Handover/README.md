# 05 · Future Work and Handover

For whoever picks this project up next. It covers where both systems stand, what is known to be broken, the research that should come next, and how to get started.

---

## Where things stand

| | Part 1: StudyBuddy platform | Part 2: Decision-support tool |
|---|---|---|
| **Status** | Working proof of concept, deployed and live | Working proof of concept with a simulated-classroom evaluation |
| **Tested** | Access control, lesson-flow rules, speed, worksheet generator, two heuristic reviews, informal feedback | Rules v2 against a score threshold and two Random Forests on 200 simulated classrooms of 30, with bootstrap intervals, five seed pairs and sensitivity runs |
| **Not tested** | Use in a real classroom; learning outcomes | Real learners; whether the personas resemble real readers; facilitators using the dashboard |
| **Code** | [`03-.../04-Code`](../03-Admin-Facilitator-Side_Moksh-Manglani/04-Code/) | [`04-.../03-Code`](../04-Facilitator-Student-Side_May-Thazin/03-Code/partIV-facilitator-decision-support/) |

The two systems are **separate applications**. They share a goal and a design argument but not a database or code.

---

## Research priorities

1. **A classroom pilot.** The central claim, that a non-expert facilitator can deliver an expert-designed lesson as intended, has not been tested with real facilitators and students. A pilot should measure implementation fidelity (how closely delivery follows the lesson design) and what students learn. This needs full human ethics approval first; see [`07-Ethics`](../03-Admin-Facilitator-Side_Moksh-Manglani/07-Ethics/).
2. **Integrate the two parts.** Connect StudyBuddy's lessons with May's learner insights, so what students understand can shape how a lesson is delivered, and so insights become an actionable plan for the facilitator (suggested next steps for the lesson in progress). This was the supervisor's recommended future direction.
3. **Classroom management.** The strongest practitioner challenge: the walkthrough prepares a facilitator for a lesson, not for a room of children. Test whether classroom-management guidance in the walkthrough closes that gap.
4. **Age range.** Practitioners would not put a stranger in front of nursery or kindergarten children. Establish the age range where the model works, and whether keeping one facilitator with one class helps.
5. **Validate the decision-support rules with real learners** (Part 2, May's Report Section 6.2). Collect consented, anonymised reading-check data from Year 3 to 6 classes alongside an independent reading assessment. Use it to test whether the simulated personas resemble real readers (Käser and Alexandron's "Turing-like test") and to recalibrate the thresholds.
6. **A facilitator study** (Part 2). Observe facilitators using the dashboard: is the evidence understood, trusted and acted on, does it reduce workload, and does it cause automation bias?
7. **Train the Random Forest on real labels** (Part 2) once outcome data exists, and compare it with the rules. Use timing features only if they prove predictive in real data.

## Feature ideas, from the feedback and the report

| Idea | Source |
|---|---|
| Classroom-management guidance in the walkthrough | Academic coordinator |
| Admin alerts when a facilitator falls behind or stops partway through a lesson | Supervisor, 17 June |
| A facilitator code of conduct, accepted at approval | Academic head |
| Reports that surface common problems across facilitators (for example, everyone stuck on the same question) | Supervisor, 17 June |
| Offline support for places without reliable internet | Benchmark (Report Section 6.2) |
| More subjects and age groups beyond maths and science, Years 1 to 4 | Report Section 9.3 |
| A facilitator progress history (the menu item is a placeholder) | Heuristic review 6.1 |
| Pass the class and curriculum to the worksheet generator's prompt | Evaluation, section D |

---

## Part 2: decision-support tool, next steps and known issues

From May's final report (Sections 4.3, 5.5 and 6.2) and the code.

| Priority | Issue or idea | Where | Suggested fix |
|---|---|---|---|
| High | **Pooled gap threshold.** Over three passages the inferential gap moves in steps of 1/6, so 0.34 excludes a gap of 2/6 and acts like 0.5. This is why rules v2 flag fewer poor comprehenders with three passages (38.8% against 53.7%) | `GAP_THRESHOLD_POOLED` in `src/features/analytics/recommendationEngine.ts`; `rules_v2()` in `evaluation/simulated_classroom_evaluation_v2.py` | Set it to 0.33 in both places and evaluate it as a new pre-specified rule on new data (post hoc it gave 60.0% of poor comprehenders and 77.1% recall at 7.3% false alarms) |
| High | **No automated parity test** between the TypeScript rules and the Python rules, which must stay identical | Both files above | Export a set of sessions from the simulation, run them through `generateRecommendation()` and compare statuses in a test |
| High | **Browser local storage** is not suitable for real learner data | `src/shared/storage/` | Server-side storage with authentication and privacy safeguards (NZ Privacy Act 2020); for example StudyBuddy's Supabase database |
| Medium | **Repeated checks over time** are designed but not built: before-and-after comparison, trend views, a per-learner baseline | Facilitator dashboard | Add them to the learner profile; later use them to personalise learning |
| Medium | **Integrate with StudyBuddy**: the reading check as a lesson block, results in StudyBuddy's database, the support view during delivery, class-pattern alerts sent to the admin | Both systems | Follow the six-step workflow in May's Report Table 1.2 |
| Medium | **One activity type**: three narrative passages, four multiple-choice questions each | `src/features/student/activityContent.ts` | More passages, genres, question formats and subjects; check passages for cultural and vocabulary assumptions that could look like an inference gap |
| Medium | `table_flagged_by_reader_type_timing_neutral.csv` (May's Report Table 4.2) is not written by the evaluation script, so it cannot be regenerated | `evaluation/` | Add it to `simulated_classroom_evaluation_v2.py`, with a three-passage timing-neutral per-learner file |
| Low | No automated tests or linting in CI for the app | `facilitator-decision-support/` | Add unit tests for the engine and run `npm run lint` and `npm run build` in CI |
| Low | Some learner-facing and facilitator-facing text uses em dashes, unlike the rest of the project | Indicator text in the engine, question screen | Tidy the wording to match the project's style |

**Good first change for Part 2:** the pooled-threshold fix plus a parity test. Both are small, well understood, and the evaluation already reports the expected effect.

---

## Known issues in the platform

From the second heuristic review and the technical tests (19 October 2026). Severity uses Nielsen's scale (4 worst). Items fixed after the evaluation are listed in [`05-Evaluation`](../03-Admin-Facilitator-Side_Moksh-Manglani/05-Evaluation/#fixed-after-the-evaluation) and are not repeated here.

| Severity | Issue | Where | Suggested fix |
|---|---|---|---|
| 3 | Progress is stored as a position, so deleting or reordering blocks mid-lesson can make a facilitator skip a step | `lib/lesson-progress.ts` | Store progress by block id |
| 3 | An admin can publish a lesson with no blocks; facilitators see it listed, then get a 404 | Admin lesson editor | Block publishing empty lessons |
| 3 | Sources over 60,000 characters are cut without warning in the worksheet generator | `lib/ai-worksheet.ts` | Warn the admin, or summarise in chunks |
| 3 | In production, error messages thrown by Server Actions are hidden from the user | Every action that throws | Return `{ error }` values instead of throwing |
| 3 | Some seeded video links point to channel pages that cannot play | Seed data | Replace with specific video links; validate links in the editor |
| 2 | No loading feedback while pages render | All pages | Add `loading.tsx` files |
| 2 | No custom 404 or error pages | Whole app | Add `not-found.tsx` and `error.tsx` |
| 2 | "Mark step done" and "Approve" have no undo or confirmation | Lesson player, Requests | Add undo or a confirmation |
| 2 | No layouts for tablets and phones | Shells and lesson player | Add responsive breakpoints |
| 2 | Worksheet printouts include the app chrome | Worksheet print | Add print styles |
| 2 | No in-app help for first-time facilitators | Facilitator side | First-run guidance |
| 2 | Some summaries from the worksheet generator add facts not in the source | Worksheet generator | Keep the admin's summary review; tighten the prompt |
| 1 | Facilitators always see the default theme | Facilitator side | Let facilitators choose a theme |
| 1 | No bulk publish or move for lessons; no keyboard shortcut for the next step | Admin lessons; lesson player | Add bulk actions and a shortcut |
| 1 | Opening a lesson creates its progress record | Facilitator lesson page | Create it on the first action instead |

## Operational notes

- **Supabase free tier pauses** a project after a period of inactivity. Un-pause it from the Supabase dashboard before a demonstration.
- **Email** needs a verified sending domain in Resend before invitations can go to anyone other than the account owner. Without email, the admin can copy the invite link from the Requests page.
- **AI costs** are small (about $0.017 per worksheet) but need an Anthropic API key with credit.
- **Region.** Keep the Vercel functions in the same region as the database; a mismatch made every action about 25 times slower.

---

## How to pick this up

1. Read the root [`README.md`](../README.md), then both final reports in [`01-Submissions/05-Final-Report`](../01-Submissions/05-Final-Report/).

For Part 1 (the platform):

2. Read [`03-Design`](../03-Admin-Facilitator-Side_Moksh-Manglani/03-Design/) for how the platform works and why.
3. Run the platform locally against your own Supabase project, following [`04-Code`](../03-Admin-Facilitator-Side_Moksh-Manglani/04-Code/).
4. Re-run the evaluation ([`05-Evaluation`](../03-Admin-Facilitator-Side_Moksh-Manglani/05-Evaluation/)) to confirm your setup matches ours.
5. Pick an item above. The progress-by-block-id fix is a good first change: it is small, well understood, and has a test (`B6`) that already fails and should pass afterwards.

For Part 2 (the decision-support tool):

1. Read [`02-Design`](../04-Facilitator-Student-Side_May-Thazin/02-Design/) for how the reading check and rules work.
2. Run the app locally and load the demo data ([instructions](../04-Facilitator-Student-Side_May-Thazin/#running-it)). No accounts or keys are needed.
3. Re-run the evaluation ([`04-Evaluation`](../04-Facilitator-Student-Side_May-Thazin/04-Evaluation/)) and check your tables match the committed ones.
4. Start with the pooled-threshold fix and a parity test between the TypeScript and Python rules.

Questions about the project can be sent to the authors through the University of Auckland.
