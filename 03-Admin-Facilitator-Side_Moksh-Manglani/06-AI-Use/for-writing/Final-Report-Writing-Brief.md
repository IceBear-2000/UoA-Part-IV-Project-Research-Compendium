# StudyBuddy: Final Report Writing Brief

**Compiled:** 24 September 2026, from Gill's supervision feedback as relayed by Moksh. Updated same day with the multi-agent architecture note, the rubric cross-reference, and Moksh's own clarification on tool history.
**Purpose:** the standing rules for how the Final Research Report gets written. Every future drafting session should check this first. Sits alongside StudyBuddy-Master-Context.md (facts), StudyBuddy-Messaging.md (pitch/positioning), and 2026-P4P-Final-Report-Rubric.md (the actual grading criteria, D + E together are 55% of the grade: evaluation and proportionate claims, see that doc). Mirrored from the claude.ai Project docs (claude/StudyBuddy-Final-Report-Writing-Brief.md).

---

## 1. The report is about the platform

Center of gravity: the platform, the design, what happened, and why it was designed that way. Not the general topic of education access, not a literature essay that happens to mention StudyBuddy at the end. Every section should be answerable from "what did Moksh build, and why."

## 2. Every claim needs a source, or it gets cut or softened

Gill's flagged example: a draft somewhere states "learning is dependent on the teacher" with nothing behind it. That's the failure mode to avoid throughout. Rule going forward: if a sentence asserts a fact about how people learn, how education systems work, or why a design choice is good, it needs a citation or it needs to be rewritten as an observation/design rationale rather than a claim. This isn't just good practice, it's graded: rubric criterion E's A-range bar is literally "claims are proportionate to findings, contributions, and impact," and its D-range failure is "significantly overstates findings, contributions, or impact." Action item: audit StudyBuddy-Messaging.md and the existing literature review for sentences like this before they go in the report.

## 3. Make Moksh's individual contribution explicit and unmissable

This is the single biggest piece of feedback, and it's a formal requirement, not a style preference: the report has to make clear what Moksh personally did, separate from what Claude/AI produced. An industry reader or examiner needs to walk away knowing exactly what was built, written, and decided by him.

His actual process, in his own words:
- System architecture and requirements decisions come from him first.
- He writes project-specific spec documents before anything gets built (PROJECT_BRIEF.md, DESIGN_TOKENS.md, schema.prisma, feature specs like AI_WORKSHEET_GENERATOR_SPEC.md).
- Each feature goes through in-depth discussion and iteration with Claude before a spec is locked, then Claude Code implements against that locked spec.
- His working method with Claude generally: he talks through everything he's thinking, Claude restructures it into something organised, and then **he rewrites it in his own words** so the output reflects his actual thinking, not Claude's phrasing.
- Gill's framing: "you can't just say Claude built that, you need to say what you did."

**A concrete, already-existing example worth using directly in the report:** `AI_WORKSHEET_GENERATOR_SPEC.md` in the repo is a real artefact of this process. It documents a spec that was "confirmed with the user across two rounds of questions," has a full decisions table (Moksh's calls, one by one: AI provider, video transcript scope, failure handling, regenerate behaviour, etc.), a confirmed step-by-step flow, and an architecture section written before a line of code existed. `CLAUDE_CODE_SEQUENCE.md` is the companion piece: session-by-session prompts Moksh wrote for Claude Code, plus three standing rules he gave it at the start of every session ("don't deviate from the schema without asking," "match the design tokens exactly," "if something's ambiguous, ask me rather than guessing"). That's a genuinely strong, literal answer to "what makes this different from someone just typing a prompt": a spec-first, decision-table-driven, confirm-before-build pipeline, with explicit guardrails against the AI drifting from his decisions.

**Open item:** worth checking whether there are other spec docs like it (e.g. for the admin redesign, the theme system) that make equally good evidence.

## 4. The multi-agent architecture is itself part of the AI-usage story

From Moksh directly (24 Sept): the AI-assisted development process isn't just one chat doing everything, it's a deliberate multi-agent architecture with role specialisation, and it's worth describing in the report as part of the methodology/process section.

- **Two primary agents, different IDEs, different specialties.** One agent (Claude in Cowork, this thread) works on documents, research, ethics, evaluation strategy, and the report itself. A separate agent (Claude Code, running directly in the project's repo) does system architecture implementation and development. This is a deliberate division of labour across specialised tools, not one undifferentiated chat window used for everything.
- **An explicit shared-context protocol between the two agents**, because neither one has automatic access to the other's memory. The repo holds a shared handover document (`StudyBuddy_Handover.md`) that each agent reads at the start of a session and updates its own half of, so neither works from stale information about what the other has done. As of 24 Sept this pattern has been extended: the writing brief (this document) and the report rubric are mirrored between the claude.ai project and the repo the same way, specifically so both agents can find them. **This session's own setup is the live illustration** and can be described directly and honestly in the report rather than hypothetically, it's the actual system in use, not an idealised description of one.
- **Tool history, clarified by Moksh:** in the early phases (research/literature review stage), he trialled several AI tools, including ChatGPT, alongside Claude, to see what worked best. He settled on Claude and stayed with it from there on for the spec-driven development work and the report writing. This is the accurate account to use in the report: an evaluated tool choice, not just "used ChatGPT for some things, Claude for others" running in parallel throughout.
- **Correction (13 Oct 2026, Moksh):** for most of the build the mid-year report's account is the true one: ChatGPT (voice mode) stays step 1, talking ideas through to a first spec; then Claude refines it; then Claude Code checks feasibility and builds, with code reviews by a second model every 3 to 4 sessions. Use that account, not "Claude only". Which model built (Opus 4.8 or Sonnet 5) is still to confirm. The single source for the report is now the Claude Doc "StudyBuddy Final Report Hub": https://claude.ai/code/artifact/377a8cec-d0a4-49b5-a2e7-c0e29495f416
- **Framing for the report:** this is evidence of system-design thinking applied to the development process itself, not only to the platform. It also doubles as a partial answer to the conference reviewers' ask for a "crisp technical novelty claim for an industry audience": most Honours projects that mention AI assistance describe a single chatbot; this describes a coordinated multi-agent workflow with a defined, working protocol for keeping the agents in sync, arrived at after evaluating alternatives.
- **Caution, per the rubric's "claims proportionate to findings" bar:** write this up as a development-process detail worth a paragraph or two in the methodology section, not as a second research contribution alongside the platform. Describe what was actually done, don't inflate it into a claimed novel research method.
- **Resolved:** the earlier flag about the ethics documents noting Claude/ChatGPT weren't UoA-approved for sensitive data during pre-screening (Gemini/Copilot via institutional login was the approved route for that) isn't a live conflict, the early-phase tool trials Moksh describes were general research, not sensitive participant data handled under the ethics protocol. No inconsistency to resolve here.

## 5. Make it personal: the motivation has to come through

Gill and Moksh both want the report to read as personal, not just academic. The throughline Moksh gave:

- Time in India, seeing teachers leave for better-paying jobs and leaving students behind.
- Seeing how education access is a real, visible problem there.
- A conviction that education is a basic human right and should be accessible to everyone.
- That conviction is the reason this project exists, not an abstract research interest.

**Still needed from Moksh:** the general shape is here, but the specific story (what he actually saw, when, where, any particular moment or person) isn't yet. Same process as this feedback session: give it in his own words, unfiltered, and it gets rewritten to sound like him rather than generic.

Structurally this probably belongs in the Introduction as the "why this, why me" opening, before the report moves into the formal literature-grounded argument.

## 6. Document every design decision, and back each one with literature

The model to repeat throughout: Canvas-style lesson cards were chosen because of the similarity/familiarity heuristic (Nielsen's heuristics: match real-world conventions, reduce cognitive load), so the interface reads as intuitive to someone who already knows an LMS. That's the shape every design decision section should take: what was chosen, what the alternative was, what feedback or reasoning drove it, and what literature or established heuristic backs it up.

The repo already has real material for this: the redesign work (3-theme system, Canvas-style cards, nav restructure) had a documented Nielsen's Heuristics review linked from the Settings menu, and Saroj's usability feedback drove five specific, named design changes. Both are ready-made worked examples, not things that need to be invented, they need to be pulled together and written up properly with citations attached.

## 7. Usability and evaluation: the questions the report needs to answer

Gill and every conference reviewer asked for an evaluation strategy. Moksh's own framing of it, in plain terms:

- How long does it take to create a lesson?
- How reliable is the platform?
- How intuitive is it to use?

Evidence source: informal chats with friends (not the formal 10-person ethics study, which has been dropped per the pivot Gill recommended, see the ethics area notes). Moksh is going to run these conversations himself and bring back feedback and opinions, which feed both design decisions and the report's evaluation section.

This is also where the biggest single chunk of the grade sits: rubric criterion D (Study Execution, Findings & Evaluation) is 30% on its own, and needs diagrams/tables and explicit evaluation of validity, not just description, to score well. See 2026-P4P-Final-Report-Rubric.md.

**Possible next step, not yet confirmed with Moksh:** a short set of prompts/questions for those informal chats, built around the three questions above, so the conversations produce usable, comparable material rather than freeform chat. Ask before building this.

---

## Open questions for Moksh

1. The personal story in section 5, in his own words, whenever he's ready to give it.
2. Whether the AI-pipeline description in section 3 is accurate as written, or needs correcting before it's relied on.
3. Whether a short question set for the informal usability chats (section 7) would help, or whether he'd rather keep those conversations unstructured.
4. Whether there are other spec docs like AI_WORKSHEET_GENERATOR_SPEC.md worth pulling in as more evidence of the process in section 3.

---

## Status

As of 24 Sept 2026, this feedback session is complete per Moksh ("these are the core things I wanted to talk about"). Next: agree what to actually start building first. Candidates on the table: the evaluation strategy (biggest single rubric category at 30%, oldest open item since July), the Final Report skeleton itself, or the personal-story/contribution sections that need Moksh's own raw material before they can be drafted.
