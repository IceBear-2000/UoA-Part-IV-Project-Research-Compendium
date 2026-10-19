# Project Journal: Part 1 (The Platform)

A dated record of the decisions, problems and turning points in Part 1, condensed from the working status documents kept with the help of an AI assistant through the project. It complements the joint [meeting minutes](../../../02-General/Meeting-Minutes/) with the work done between meetings.

---

## March to April: defining the problem

- Wrote the shared project document with May: brief, scope, feature tiers and gap analysis. The first framing was commercial ("anyone can start a school"); it was later narrowed to an academic question.
- Literature review submitted. It compared formal schooling, homeschooling, online and self-paced learning, synchronous and blended learning, learning management systems and community-based models against six criteria, and found the gap: no model combines accessibility, structured guidance, engagement and decoupled delivery.
- Collected the evidence base for structured pedagogy and supported facilitators (Piper et al., 2018; Snilstveit et al., 2016; World Bank, 2018; Veine et al., 2022).

## May: pivot and split

- **11 May.** The comparison with homeschooling in New Zealand showed that existing provision already sends parents a curriculum; the missing piece is **delivery**. The project pivoted from analysing student behaviour to supporting less experienced facilitators.
- **12 May.** Work split: Moksh took system architecture, requirements elicitation and the platform; May took the learner-analysis side.
- **20 to 25 May.** Planned a formal interview study of about ten people (academic coordinators, teachers, facilitators, students) with a question bank across seven participant profiles and thematic analysis as the method. Started the human ethics application. Agreed to build a minimum viable product while waiting.

## June: specification before code

- First mock-ups of the admin and facilitator sides, shown on 17 June. Supervisor feedback: only admins create lessons, admins should be alerted when facilitators fall behind, and personas help explain the idea.
- Wrote the project brief, design tokens, the data schema and a session-by-session build sequence before writing any code (see [`../for-code`](../for-code/)). The brief went through a feasibility pass with the coding assistant.

## July: the platform goes live

- **Early July.** Built the platform session by session, testing each by hand before the next. Completed the database, authentication and the lesson flow.
- Problems found and fixed during the build, each found by using the system or by review rather than by the AI writing it:
  - **Invite links.** Admin-generated invite links fall back to the implicit sign-in flow, which returns tokens in the URL fragment that the server never sees. Diagnosed by inspecting a real generated link; fixed by reading the fragment in a client component.
  - **Videos.** Admins paste YouTube links, but the player used a plain video tag. Fixed with a resolver that detects and embeds YouTube links.
  - **Sessions dropping** in messaging, and a double-run of the mark-as-read effect in development.
  - **Double submission** creating duplicate lessons. Fixed with a shared submit button that disables itself while a form is pending.
  - **Admin pages protected only in the interface.** A server-side role check was added to every admin action.
- **14 July.** Platform deployed on Vercel.
- **25 July.** Conference presentation (Project #133). Assessors praised the importance of the problem, the demonstration and the comparison matrix, and the proof of concept was described as "very polished". Every assessor asked for the same two things: an **evaluation strategy**, and an argument for **why a non-teacher should run a lesson**.
- **28 July.** Supervisor debrief on the feedback: make the technical novelty clear, argue for the facilitator model from evidence, evaluate both software quality and teaching, and benchmark against existing systems.

## August: ethics

- **5 August.** Supervisor asked that the concept be described as **training** facilitators, not only supporting them. This became the framing of screening, induction (the walkthrough) and support.
- **27 August.** The ethics application received conditional approval with six conditions. No research could start until final approval. See [`../../07-Ethics`](../../07-Ethics/).

## September: building out and changing method

- **14 September.** Built the real AI worksheet generator to replace the mock: the AI summarises the lesson, the admin corrects the summary, the AI writes questions and an answer key, the admin edits, and the result is saved as a new block.
- **14 to 25 September.** Admin redesign after a review of the admin panel by a friend experienced in administering organisations: class drill-down, grouped lessons, a settings page, six styles built on real data and three kept as themes, Canvas-style class cards, icons instead of emoji, and an actionable home page.
- **15 September.** On the supervisor's advice, the formal interview study was replaced with informal feedback chats, to be written up as design input with each person's relevant experience. The ethics journey would be reflected on in the report.
- **20 September.** Pages were slow because the server functions ran in the United States and the database in Sydney. Moving the functions to Sydney cut adding a block from about 10.7 s to about 434 ms.
- **21 September.** Added New Zealand Curriculum Years 1 to 4 alongside NCERT Grades 1 to 4, with a curriculum filter, giving about 110 lessons across eight classes.
- First heuristic review against Nielsen's ten heuristics.

## October: feedback, poster, report, evaluation

- **6 October.** Feedback from an academic coordinator: strong support for the problem, and one strong challenge, that classroom management comes before teaching. See [`../../02-Informal-Feedback`](../../02-Informal-Feedback/).
- **7 October.** UI/UX review on the live platform by a medical student and tutor: six concrete changes.
- **9 October.** Poster submitted with May.
- **13 October.** Locked the report decisions: title, chapter structure, the word "walkthrough" for the locked first pass, and only two role words throughout, "admin" and "facilitator".
- **18 October.** Final report submitted.
- **18 to 19 October.** Ran the technical evaluation and a second, more critical heuristic review. Fixed the main findings and all six feedback changes the next day.
- **20 October.** Research compendium assembled.

---

## Decisions that held

| Decision | Made | Why |
|---|---|---|
| The platform teaches; the facilitator runs the room | July | Expertise lives in the lesson, so it survives a change of person |
| Two role words only: admin and facilitator | October | Consistency across the platform, report and poster |
| No student data | June | Privacy, and a smaller ethical footprint |
| Informal feedback, not a formal study | September | The ethics timeline did not fit the report deadline; supervisor's advice |
| Rate StudyBuddy on the same six criteria as the literature | July to October | Ties the evaluation to the literature and answers the conference feedback |
