# Facilitator Decision Support: Part IV Project #133

Code for the facilitator–student side of Part IV Project #133, *Making Education
More Accessible & Reliable: AI-Driven Facilitator-Based Teaching* (University of
Auckland, 2026).
 
  **Author**: May Thazin. 
  **Supervisor**: Prof Gill Dobbie.

The project explores decoupled delivery: experts design lessons once, and any
approved facilitator, who need not be a qualified teacher, delivers them. This
repository contains a proof-of-concept decision-support tool that helps those
facilitators see which learners need support, and why. Learners in Years 3–6
complete a short reading check before or after each session; evidence-linked
rules turn their answers and interaction signals into a status for the
facilitator, shown with the evidence behind it and a suggested next step.

The lesson creation and delivery platform (StudyBuddy) is the partner half of the
project by Moksh Manglani and is not part of this repository.

## Repository Layout

| Folder | Contents | Details |
|---|---|---|
| [`facilitator-decision-support/`](facilitator-decision-support/) | Next.js and TypeScript app: student reading check, rule engine (rules v2) and facilitator dashboard | [App README](facilitator-decision-support/README.md) |
| [`facilitator-decision-support/evaluation/`](facilitator-decision-support/evaluation/) | Python simulated classroom evaluation, result tables and report figures | [Evaluation README](facilitator-decision-support/evaluation/README.md) |

## Quick Start

Run the app (requires Node.js):

```bash
cd facilitator-decision-support
npm install
npm run dev
```

Then open http://localhost:3000. On the facilitator dashboard, "Load demo data"
adds seven demo learners.

Reproduce the evaluation (requires Python 3.9 or later):

```bash
cd facilitator-decision-support/evaluation
pip install -r requirements.txt
python3 simulated_classroom_evaluation_v2.py
python3 make_poster_figures.py
```

The evaluation uses fixed seeds, so rerunning it reproduces the committed tables
in `results_v2/` exactly. It takes about 6 to 7 minutes.

## Results in Brief

On 200 simulated classrooms of 30 learners (timing-neutral scenario, one passage),
rules v2 flagged 64.0% of at-risk learners against 59.3% for an accuracy-only
threshold, with fewer false alarms (8.8% vs 10.8%). All results come from
simulated learners built on stated assumptions; see the evaluation README and the
final report for details and limitations.
