<p align="center">
  <img src="assets/banner.svg" alt="StudyBuddy Research Compendium, Part IV Project 133. Part 1, the platform (admin and facilitator), by Moksh Manglani. Part 2, student learning insights (facilitator and students), by May Thazin" width="100%">
</p>

<p align="center">
  <img alt="Part IV Project" src="https://img.shields.io/badge/Part%20IV%20Project-%23133-1f2a44">
  <img alt="Course" src="https://img.shields.io/badge/SOFTENG-700A%2FB-2f4a6d">
  <img alt="University" src="https://img.shields.io/badge/University%20of%20Auckland-2026-4b6584">
  <img alt="Platform" src="https://img.shields.io/badge/Next.js-14-black">
  <img alt="Database" src="https://img.shields.io/badge/Supabase-Postgres-3ecf8e">
  <img alt="Evaluation" src="https://img.shields.io/badge/Python-3.9%2B-3776ab">
</p>

# StudyBuddy: Research Compendium

> **Reading this from the zip?** Most of the files in this folder are Markdown (`.md`) files, which are written to be read on GitHub. We recommend viewing our research compendium on GitHub instead, where every file opens in one click, the tables and diagrams display properly, and you can browse everything much faster:
>
> **https://github.com/IceBear-2000/UoA-Part-IV-Project-Research-Compendium**
>
> **A PDF copy of this README** is included as [`README.pdf`](README.pdf), in the root of the repository and of the zip. It is the easiest file to open first. **In the zip,** to keep it tidy, each codebase is packed as its own zip inside its folder: `03-Admin-Facilitator-Side_Moksh-Manglani/04-Code/StudyBuddy-Platform.zip` and `04-Facilitator-Student-Side_May-Thazin/03-Code/partIV-facilitator-decision-support.zip`. Unzip each one where it sits (it recreates its folder, and the links in the documents then work). Everything else opens straight away.

This repository is the research compendium for **Part IV Project #133**, *Making Education More Accessible and Reliable: AI-Driven Facilitator-Based Teaching*, completed in the Department of Electrical, Computer and Software Engineering at the University of Auckland in 2026.

This is a joint project in **two equal parts**, one by each student. The compendium holds everything that supports both final reports and the project portfolio: every Canvas submission, the meeting minutes, the code with its full commit history, the design records, the raw evaluation data behind every table in the reports, and a handover for whoever picks the work up next. It is written so that a future student or researcher can understand what was done, check it, rebuild it and take it further.

| | |
|---|---|
| **Students** | Moksh Manglani (`mman402`) and May Thazin (`mtha724`) |
| **Supervisor** | Professor Gill Dobbie, School of Computer Science |
| **Course** | SOFTENG 700A/B, Part IV Research Project, 2026 |
| **Canvas submission** | `133_mman402_mtha724-compendium.zip` (a zip of this repository, with the two code folders packed as their own zips and a PDF copy of this README) |
| **Part 1 code** | StudyBuddy platform, in [`03-.../04-Code`](03-Admin-Facilitator-Side_Moksh-Manglani/04-Code/) · live at [study-buddy-uoa-project.vercel.app](https://study-buddy-uoa-project.vercel.app) |
| **Part 2 code** | Facilitator decision-support tool, in [`04-.../03-Code`](04-Facilitator-Student-Side_May-Thazin/03-Code/) · original repository [mtha724/partIV-facilitator-decision-support](https://github.com/mtha724/partIV-facilitator-decision-support) |

---

## One project, two equal parts

Good teaching depends on the individual teacher, and good teachers are scarce, expensive and leave. StudyBuddy explores a **facilitator-based model of education**: a lesson is designed once by an **admin** with subject and teaching expertise, and delivered in the classroom by a **facilitator**, a person without that expertise who follows the lesson step by step. Making this work depends on two relationships, so the project was split into two equal parts, one per student, researched and built in parallel towards the same goal:

- **Part 1 (Moksh Manglani), admin and facilitator:** make sure the lesson reaches the classroom exactly as the admin designed it.
- **Part 2 (May Thazin), facilitator and students:** make sure the facilitator can see how the students in that classroom are responding, and what to do about it.

```mermaid
flowchart LR
    A["Admin<br/>designs the lesson"] -->|"Part 1 · StudyBuddy platform<br/>approval, walkthrough, guided delivery"| F["Facilitator<br/>runs the lesson"]
    F -->|"delivers"| S["Students"]
    S -->|"Part 2 · Decision-support tool<br/>reading check, rules, evidence"| F
```

| | Part 1: The Platform | Part 2: Student Learning Insights |
|---|---|---|
| **Student** | Moksh Manglani | May Thazin |
| **Relationship** | Admin and facilitator | Facilitator and students |
| **Research question** | How can a software platform be designed so that any approved facilitator, regardless of subject expertise, delivers an expert-designed lesson as it was intended? | Can a software system convert learner interaction data into evidence-linked recommendations for facilitator decision-making? |
| **What was built** | StudyBuddy, a web platform where admins build lessons from typed blocks and approve facilitators, and facilitators walk through and deliver those lessons | A facilitator decision-support tool for Years 3 to 6 that turns a short reading check into a status, evidence and a suggested next step for each learner |
| **Folder** | [`03-Admin-Facilitator-Side_Moksh-Manglani`](03-Admin-Facilitator-Side_Moksh-Manglani/) | [`04-Facilitator-Student-Side_May-Thazin`](04-Facilitator-Student-Side_May-Thazin/) |

---

## Part 1 (Moksh Manglani): try the live platform

**StudyBuddy, the platform built for Part 1 (Moksh Manglani's part of this project),** is live and open for testing at **[study-buddy-uoa-project.vercel.app](https://study-buddy-uoa-project.vercel.app)**. Sign in with either demo account below. No other set-up is needed.

| Role | Email | Password |
|---|---|---|
| Admin | `demoadmin@school.nz` | `studybuddy` |
| Facilitator | `demofacilitator@school.nz` | `studybuddy` |

- As the **admin** you can build and publish lessons, approve requests, assign facilitators and message them.
- As the **facilitator** you can open the lessons assigned to you (NCERT Grade 1) and walk through them step by step. The first walkthrough of a lesson is locked to the lesson's order.
- The site holds sample content only. There are no student accounts and no student data.
- These are shared demo accounts, so please do not delete the existing lessons.

### Try the Display Day demo here

<p align="center">
  <a href="https://www.canvaqr.com/RGU2gwvAbt"><img src="assets/display-day-qr.png" alt="QR code from the Display Day poster, labelled Try It Yourself" width="240"></a>
</p>

<p align="center"><strong>Scan the QR code with your phone</strong>, or open <a href="https://www.canvaqr.com/RGU2gwvAbt">https://www.canvaqr.com/RGU2gwvAbt</a>. This is the QR code on our Display Day poster.</p>

#### About the Display Day demo (in development)

A public, no-login demo for Display Day (22 October 2026) is being built. A visitor scans the QR code on the poster, makes a two-minute mini lesson on their phone (a photo, meme, clip or YouTube link, plus a quick quiz) and receives an author badge. Their lesson is saved as a draft in a "Display Day" class on the live platform, and the badges scroll on a "Hall of Fame" wall at the stand.

**This feature is still in development and is not part of the snapshot of the code in this compendium.** For the latest code, please check the development repository on GitHub: [`IceBear-2000/StudyBuddy-UoA-Project`](https://github.com/IceBear-2000/StudyBuddy-UoA-Project) (access on request from Moksh). The full specification is in [`DISPLAY_DAY_DEMO_SPEC.md`](03-Admin-Facilitator-Side_Moksh-Manglani/06-AI-Use/for-code/DISPLAY_DAY_DEMO_SPEC.md).

---

## Start here

**If you are marking this project:** each part has its own "report chapter to compendium" map, [Moksh's](#moksh-manglani-final-report-part-1-the-platform) and [May's](#may-thazin-final-report-part-2-student-learning-insights), both below. Every figure and table in Moksh's report has its source data in [`00-Report-Figures-and-Tables`](03-Admin-Facilitator-Side_Moksh-Manglani/00-Report-Figures-and-Tables/). Every table and figure in May's report is mapped to its result file in [`04-Evaluation`](04-Facilitator-Student-Side_May-Thazin/04-Evaluation/#which-file-backs-each-part-of-the-report), and rerunning her simulation with its fixed seeds reproduces the committed tables byte for byte (one hand-made table is the exception; see that page).

**If you want to run the systems:** see [Part 1: running the platform](03-Admin-Facilitator-Side_Moksh-Manglani/04-Code/) and [Part 2: running the decision-support tool and its simulation](04-Facilitator-Student-Side_May-Thazin/).

**If you are continuing the project:** read [`05-Future-Work-and-Handover`](05-Future-Work-and-Handover/) first. It lists what works, what is known, and where to start.

---

## Structure

The folders are numbered so they sort in reading order: what was handed in, then the project as a whole, then each part, then what comes next. Every folder has its own `README.md` describing what is inside and why it matters.

```text
UoA-Part-IV-Project-Research-Compendium/
│
├── README.md                                   You are here
├── LICENSE.md                                  All rights reserved
├── assets/                                     Images used by the READMEs
│
├── 01-Submissions/                             Everything submitted on Canvas, in order
│   ├── 01-Scope-and-Literature-Review/          Project scope and literature review
│   ├── 02-Mid-Year-Report/                      Moksh-Manglani/ and May-Thazin/
│   ├── 03-Conference-Presentation/              Joint slides
│   ├── 04-Display-Day-Poster/                   Joint poster
│   └── 05-Final-Report/                         Moksh-Manglani/ and May-Thazin/
│
├── 02-General/                                 Shared, project-wide records
│   ├── Meeting-Minutes/                         Every supervisor and team meeting, April to October
│   ├── Project-Document/                        The shared working document that set the scope
│   ├── System-Design-and-Planning/              Early joint system design
│   ├── Interview-and-Ethics-Planning/           Joint interview study and ethics plan (May)
│   ├── Course-Resources/                        Final report templates
│   └── Project-Timeline.md                      Milestones, deadlines and pivots
│
├── 03-Admin-Facilitator-Side_Moksh-Manglani/   Part 1: the StudyBuddy platform
│   ├── 00-Report-Figures-and-Tables/            Every figure and table in the final report, with sources
│   ├── 01-Research/                             Six criteria, model comparison, benchmark
│   ├── 02-Informal-Feedback/                    Notes from feedback chats, anonymised
│   ├── 03-Design/                               Architecture, data model, lesson flow, design decisions
│   ├── 04-Code/                                 The platform source with full git history, and setup guide
│   ├── 05-Evaluation/                           Test scripts, raw results, heuristic review
│   ├── 06-AI-Use/                               What was made with AI, grouped by what it was for
│   └── 07-Ethics/                               The human ethics application and the pivot
│
├── 04-Facilitator-Student-Side_May-Thazin/     Part 2: the decision-support tool
│   ├── 01-Research/                             Research and design notes (April to July); literature mapped to design
│   ├── 02-Design/                               Pipeline, reading check, rules v1 and v2, dashboard, screenshots
│   ├── 03-Code/                                 The tool and its evaluation with full git history
│   ├── 04-Evaluation/                           Simulated classrooms: method, rerun steps, report table sources
│   └── 05-AI-Use/                               How AI tools were used in Part 2
│
└── 05-Future-Work-and-Handover/                Known issues, open questions, next steps
```

---

## Report chapter to compendium map

### Moksh Manglani: *Final Report, Part 1 (The Platform)*

| Report chapter | Where the supporting material is |
|---|---|
| 1. Introduction, 2. Project Plan | [`02-General/Project-Timeline.md`](02-General/Project-Timeline.md), [`02-General/Project-Document`](02-General/Project-Document/), [`01-Submissions/01-Scope-and-Literature-Review`](01-Submissions/01-Scope-and-Literature-Review/) |
| 3. Literature Review | [`01-Research`](03-Admin-Facilitator-Side_Moksh-Manglani/01-Research/) (criteria and Table 2 data), [`01-Submissions/01-Scope-and-Literature-Review`](01-Submissions/01-Scope-and-Literature-Review/) (the full April review) |
| 4. Research Approach | [`02-Informal-Feedback`](03-Admin-Facilitator-Side_Moksh-Manglani/02-Informal-Feedback/), [`06-AI-Use/for-code`](03-Admin-Facilitator-Side_Moksh-Manglani/06-AI-Use/for-code/) (the specifications), [`07-Ethics`](03-Admin-Facilitator-Side_Moksh-Manglani/07-Ethics/) |
| 5. System Design | [`03-Design`](03-Admin-Facilitator-Side_Moksh-Manglani/03-Design/), [`04-Code`](03-Admin-Facilitator-Side_Moksh-Manglani/04-Code/), [`06-AI-Use/for-design`](03-Admin-Facilitator-Side_Moksh-Manglani/06-AI-Use/for-design/) |
| 6. Evaluation | [`05-Evaluation`](03-Admin-Facilitator-Side_Moksh-Manglani/05-Evaluation/) (every number in Tables 4 to 7 and A1 to A3), [`02-Informal-Feedback`](03-Admin-Facilitator-Side_Moksh-Manglani/02-Informal-Feedback/) |
| 7. AI-Assisted Development | [`06-AI-Use`](03-Admin-Facilitator-Side_Moksh-Manglani/06-AI-Use/) |
| 8. Discussion, 9. Conclusions and Future Work | [`05-Future-Work-and-Handover`](05-Future-Work-and-Handover/), [`02-Informal-Feedback`](03-Admin-Facilitator-Side_Moksh-Manglani/02-Informal-Feedback/) |

### May Thazin: *Final Report, Part 2 (Student Learning Insights)*

| Report chapter | Where the supporting material is |
|---|---|
| 1. Introduction | [`02-General/Project-Timeline.md`](02-General/Project-Timeline.md), [`02-General/Meeting-Minutes`](02-General/Meeting-Minutes/), [`04-.../01-Research`](04-Facilitator-Student-Side_May-Thazin/01-Research/) |
| 2. Literature Review | [`01-Submissions/01-Scope-and-Literature-Review`](01-Submissions/01-Scope-and-Literature-Review/May-Thazin/) (the April review), [`04-.../01-Research`](04-Facilitator-Student-Side_May-Thazin/01-Research/) |
| 3.1 to 3.4, 3.8 Design and implementation | [`04-.../02-Design`](04-Facilitator-Student-Side_May-Thazin/02-Design/), [`04-.../03-Code`](04-Facilitator-Student-Side_May-Thazin/03-Code/partIV-facilitator-decision-support/), [`04-.../03-Code/COMMIT-HISTORY.md`](04-Facilitator-Student-Side_May-Thazin/03-Code/COMMIT-HISTORY.md) |
| 3.5 to 3.7 Simulated classrooms and metrics | [`04-.../04-Evaluation`](04-Facilitator-Student-Side_May-Thazin/04-Evaluation/) |
| 4. Results (Tables 4.1 to 4.4, Figures 4.1 to 4.3, 4.7) | [`04-.../04-Evaluation`](04-Facilitator-Student-Side_May-Thazin/04-Evaluation/) ("Which file backs each part of the report") |
| 5. Discussion, 6. Conclusions and Future Work | [`04-.../04-Evaluation`](04-Facilitator-Student-Side_May-Thazin/04-Evaluation/) (limitations), [`02-General/Interview-and-Ethics-Planning`](02-General/Interview-and-Ethics-Planning/), [`05-Future-Work-and-Handover`](05-Future-Work-and-Handover/) |
| Appendices A and B (parameters, rerun steps) | [`04-.../04-Evaluation`](04-Facilitator-Student-Side_May-Thazin/04-Evaluation/) ("How to rerun it"), [`04-.../03-Code`](04-Facilitator-Student-Side_May-Thazin/03-Code/partIV-facilitator-decision-support/README.md) |

The full chapter-by-chapter map is in [`04-.../README.md`](04-Facilitator-Student-Side_May-Thazin/README.md#report-chapter-to-compendium-map).

---

## Individual and joint work

The compendium is a joint submission, and the brief asks for each student's individual submissions to be clearly identified. The convention throughout is:

- A folder named `Moksh-Manglani/` or `May-Thazin/` holds that student's individual work only.
- A folder named `Joint/` holds work submitted by both students together.
- Each side of the project lives in its own top-level folder, named after the student who did it.
- Files in `01-Submissions` are the exact files submitted on Canvas, unchanged. Google Docs were exported to PDF so they are frozen as submitted.

---

## Replicating the work

| To reproduce | Go to | Time and requirements |
|---|---|---|
| The StudyBuddy platform, locally | [`03-.../04-Code`](03-Admin-Facilitator-Side_Moksh-Manglani/04-Code/) | Node 20+, a free Supabase project; optional Anthropic and Resend keys |
| The platform test results (Report Tables 6, 7, A2, A3) | [`03-.../05-Evaluation`](03-Admin-Facilitator-Side_Moksh-Manglani/05-Evaluation/) | A local production build of the platform and a seeded database |
| The decision-support tool, locally | [`04-.../`](04-Facilitator-Student-Side_May-Thazin/#running-it) | Node 20+; no accounts or keys needed (data stays in the browser) |
| The simulated-classroom results (May's Report Tables 4.1 to 4.4, Figures 4.1 to 4.3) | [`04-.../04-Evaluation`](04-Facilitator-Student-Side_May-Thazin/04-Evaluation/) | Python 3.9+ with the pinned packages; fixed seeds, about 6 to 7 minutes on a laptop |

---

## What is deliberately not here

Some material was left out on purpose, and its absence is not an oversight.

- **Personal notes from the feedback chats.** These were not research data, and one person asked not to be named. Their content is summarised, without identifying anyone, in [`02-Informal-Feedback`](03-Admin-Facilitator-Side_Moksh-Manglani/02-Informal-Feedback/).
- **Secrets.** No `.env` file, API key, database password or account password is included. The setup guides explain which keys you need and where to get your own.
- **Ethics application forms.** The formal study was replaced by informal feedback before any participant was recruited. The story of that decision is in [`07-Ethics`](03-Admin-Facilitator-Side_Moksh-Manglani/07-Ethics/).
- **Real learner data.** Part 2 collected no data from real children. Every learner in its results is simulated, and the dashboard's demo learners are anonymous and generated by the code.
- **Third-party papers and course PDFs.** Published papers, example reports from other students and the course handbook and rubric were in the shared Drive as reading material. They are someone else's copyright, so they are cited in the reports rather than copied here; the handbook and rubric are on the SOFTENG 700 Canvas page.
- **Dependencies and build output** (`node_modules`, `.next`). They are rebuilt by the install step.

---

## Authors and acknowledgements

**Moksh Manglani** designed, built and evaluated the StudyBuddy platform (Part 1). **May Thazin** designed, built and evaluated the facilitator decision-support tool (Part 2). The project was supervised by **Professor Gill Dobbie**, whose weekly guidance shaped both parts. Thanks also to the practitioners and reviewers who gave their time and honest feedback.

## Licence

Copyright 2026 Moksh Manglani and May Thazin. All rights reserved. See [`LICENSE.md`](LICENSE.md). The repository is public so that it can be read, assessed and learned from; please ask before reusing any part of it.
