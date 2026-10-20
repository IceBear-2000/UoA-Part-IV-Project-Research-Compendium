# Part 1 · The Platform (Admin and Facilitator)

**Moksh Manglani** · `mman402` · Final report: *Making Education More Accessible and Reliable: AI-Driven Facilitator-Based Teaching*

<p align="center">
  <img src="00-Report-Figures-and-Tables/figures/figure-04.png" alt="The five steps of using StudyBuddy: admins build and approve, facilitators request, walk through and deliver" width="90%">
</p>

## The research question

> How can a software platform be designed so that any approved facilitator, regardless of subject expertise, delivers an expert-designed lesson as it was intended?

| Sub-question | Answered by | Evidence in this folder |
|---|---|---|
| **SQ1 Authoring.** What does an admin need to capture a lesson's content, sequence and delivery instructions, so it can be run without them in the room? | The block-based authoring model; a check that it represents real curricula; tests of the worksheet generator | [`03-Design`](03-Design/), [`05-Evaluation`](05-Evaluation/) (section D) |
| **SQ2 Delivery.** How can the platform control who delivers a lesson and guide them through it, so delivery follows the admin's design? | Approval, roles and the walkthrough; technical tests of access and lesson-flow rules; heuristic review; informal feedback | [`03-Design`](03-Design/), [`05-Evaluation`](05-Evaluation/) (sections A, B, E), [`02-Informal-Feedback`](02-Informal-Feedback/) |
| **SQ3 Fit.** How well does the platform meet the needs found in the literature and by practitioners, and how does it differ from existing systems? | The six criteria; a benchmark against existing platforms; practitioner feedback | [`01-Research`](01-Research/), [`02-Informal-Feedback`](02-Informal-Feedback/) |

## What was built

StudyBuddy is a web platform with two roles. An **admin** builds a lesson as an ordered list of typed blocks (video, workbook, activity, worksheet, reading, quiz, discussion, break and note), reviews requests from people who want to deliver lessons, and approves them for particular classes and subjects. A **facilitator** opens an approved lesson and goes through a locked **walkthrough**, in which each block opens only when the one before it is finished, before delivering the lesson in class. An AI worksheet generator drafts a worksheet from a lesson's own content, with two human approval steps before anything is saved. The platform stores no student data.

**Live:** [study-buddy-uoa-project.vercel.app](https://study-buddy-uoa-project.vercel.app) · **Stack:** Next.js 14, TypeScript, Supabase (Postgres, Auth, Storage), Prisma, Tailwind CSS, Anthropic Claude API, Resend, Vercel

**Try it:** the platform is live. Sign in as the admin with `demoadmin@school.nz`, or as a facilitator with `demofacilitator@school.nz`; the password for both is `studybuddy`. See [Try the live platform](../README.md#try-the-live-platform) for what each account can do.

**In development: the Display Day demo.** A public, no-login page where visitors scan the poster QR code, make a two-minute mini lesson (media plus a quick quiz) and earn an author badge shown on a Hall of Fame wall. This feature is still in development and is not part of the code snapshot in this compendium. For the latest code, please check the development repository on GitHub: [`IceBear-2000/StudyBuddy-UoA-Project`](https://github.com/IceBear-2000/StudyBuddy-UoA-Project) (access on request from Moksh). The specification is in [`06-AI-Use/for-code/DISPLAY_DAY_DEMO_SPEC.md`](06-AI-Use/for-code/DISPLAY_DAY_DEMO_SPEC.md).

## Folders

| Folder | Contents |
|---|---|
| [`00-Report-Figures-and-Tables`](00-Report-Figures-and-Tables/) | Every figure (as an image) and every table (as CSV) from the final report, each linked to its source evidence |
| [`01-Research`](01-Research/) | The six criteria, the comparison of existing models of education, and the benchmark of existing platforms |
| [`02-Informal-Feedback`](02-Informal-Feedback/) | Notes from the feedback chats, anonymised, with the design changes each one led to |
| [`03-Design`](03-Design/) | Architecture, data model, the lesson flow, roles and access, the worksheet generator, and the interface decisions |
| [`04-Code`](04-Code/) | The full platform source with its git history, a setup guide and a technical specification sheet |
| [`05-Evaluation`](05-Evaluation/) | Test scripts, raw results, test environment, and the heuristic review |
| [`06-AI-Use`](06-AI-Use/) | The specifications, design explorations, evaluation instruments and writing aids made with AI, grouped by purpose |
| [`07-Ethics`](07-Ethics/) | The human ethics application, its conditional approval, and why it was replaced by informal feedback |

## Key results

| Claim | Result | Where |
|---|---|---|
| A facilitator cannot reach admin actions | 19 of 19 forged admin actions rejected; 20 of 20 protected routes redirect to login | [`05-Evaluation`](05-Evaluation/), Report Table 6 |
| The walkthrough enforces the admin's order | 13 of 14 lesson-flow checks pass; locked content never reaches the browser | [`05-Evaluation`](05-Evaluation/), Report Table 7 |
| The block model holds real curricula | 110+ lessons across NCERT Grades 1 to 4 and NZC Years 1 to 4 | [`03-Design`](03-Design/) |
| Authoring is quick once content exists | About 7 minutes to build a lesson; under 30 seconds from a spreadsheet import | Report Section 6.6 |
| The worksheet generator is usable with review | 14 of 15 lessons produced a worksheet; 0 wrong numeric or science answers in 158 questions; median 15.6 s and $0.017 | [`05-Evaluation`](05-Evaluation/), Report Table A3 |
| Pages respond quickly | Median under 1.2 s for every page and action on a local production build | [`05-Evaluation`](05-Evaluation/), Report Table A2 |
