# 01 · Research

The research behind Part 2: May's research and design notes, and a map from the literature to the design decisions it shaped. This supports **Section 2** (Literature Review) and **Sections 3.1 to 3.2** of May's final report. The full literature review submitted in April is in [`01-Submissions/01-Scope-and-Literature-Review/May-Thazin`](../../01-Submissions/01-Scope-and-Literature-Review/May-Thazin/).

## Research and design notes

[`Research-and-Design-Notes.md`](Research-and-Design-Notes.md) combines May's three working documents from the shared Drive into one, in date order:

| Section | From | What it covers |
|---|---|---|
| 1. April to May | *System Design and Planning*, Tab 2 | The first idea: analysing how students learn before classes start, the engagement measures considered, existing tools, and the reframed purpose of supporting non-expert facilitators |
| 2. June | *Educational Design and AI-Supported Facilitator Systems* | The problem, the role of AI, a proposed learner-readiness assessment, machine-learning options, research areas, a dashboard sketch, and questions for the supervisor |
| 3. June to July | *Student Facilitator Tool* | The decision-support direction and system diagram, notes from a conversation with Anthony Feng on simulated students, the decision to focus on literacy, success criteria, how the research question was refined, the five learner dimensions and staged ML plan, and a webcam idea that was not built |
| 4. Added | | Which ideas reached the final tool, and which changed or were dropped |

How the direction developed is recorded in the meeting minutes ([`02-General/Meeting-Minutes`](../../02-General/Meeting-Minutes/)): the 11 May pivot to supporting facilitators, May's research question on 20 May, the machine-learning plan with five dimensions on 14 July, and the benchmark against Kami (a classroom PDF and annotation tool) on 5 August.

## From the literature to the design

The final design narrowed from AI in K–12 education in general to one skill, reading comprehension in Years 3 to 6, because its difficulties are well described in research and it underpins every other subject. These are the findings that most directly shaped the tool. Full references are in the final report.

| Finding | Source (report reference) | What it changed in the tool |
|---|---|---|
| Comprehension is the product of decoding and language comprehension; poor language comprehension can hide behind fluent reading | Gough and Tunmer, 1986 [23] | Two at-risk profiles kept separate: decoding-limited and poor comprehender |
| Around Year 4, reading shifts from "learning to read" to "reading to learn" (the fourth-grade slump) | Chall, Jacobs and Baldwin, 1990 [4] | Year 3 to 6 target |
| Literal and inferential comprehension do not develop in step | Valentini and Serratrice, 2023 [24] | Two literal and two inferential questions per passage, scored separately |
| Poor comprehenders are a "hidden group"; about 11% of children (24 of 218) | Nation et al., 2004 [25]; Kelso et al., 2022 [26] | Comprehension-pattern rule; the 11% share used in the simulation (the only persona parameter taken from data) |
| Teachers' judgements of reading difficulty follow spelling more than comprehension | Schmitterer and Brod, 2021 [27] | The motivation: non-specialist facilitators are likely to miss these learners |
| Comprehension monitoring is detection followed by repair | Zargar, Adams and Connor, 2020 [28] | "Repair" signal: a reread or revision after a hint |
| Children with comprehension difficulties judge their own answers less accurately, measured just after answering | Mirandola et al., 2018 [29] | Postdictive judgement after every answer; bias score and overconfidence on errors |
| Hints requested before any attempt predict struggle better than hint counts | An et al., 2026 [30] | Pre-attempt hints recorded separately and weighted more |
| Most answer changes go from wrong to right | Waddell and Blankenship, 1994 [31] | Answer changes not treated as struggle on their own |
| Teachers use dashboards when they understand what a number means and what to do | Pozdniakov et al., 2023 [33] | Evidence-linked flags with plain-language interpretation and a next step |
| Simulated learners are an established way to evaluate tutoring systems; their weakness is validity | Self, 1995 [34]; Greer and Mark, 2016 [37]; Käser and Alexandron, 2024 [40] | Simulated-classroom evaluation, with persona validity as the main limitation |
| Decision aids can lead to automation bias | Kücking et al., 2024 [41] | Every flag shows its evidence, so the facilitator is invited to check |

## Research that was explored but not used in the end

- **"Learning styles" classification.** Considered in the June notes and dropped in favour of observable behavioural signals.
- **A machine-learning model as the main mechanism.** Planned in July (decision tree, Random Forest or XGBoost over five dimensions). Kept as a comparison instead, because without real outcome labels a model trained on rule-generated labels can only copy the rules (Report Section 4.4).
- **Interviews with teachers and facilitators.** Planned jointly in May ([`02-General/Interview-and-Ethics-Planning`](../../02-General/Interview-and-Ethics-Planning/)) but not run; the evaluation used simulated learners instead.
