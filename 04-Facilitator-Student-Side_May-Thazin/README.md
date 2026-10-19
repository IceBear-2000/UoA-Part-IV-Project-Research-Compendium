# Part 2 · Student Learning Insights (Facilitator and Student)

**May Thazin** · `mtha724` · Final report: *Part 2, Student Learning Insights*

> **Status:** code imported with full history. The rest of this folder is set up for May to complete; see the checklist at the bottom.

## The research question

> Can a software system convert learner interaction data into evidence-linked recommendations for facilitator decision-making?

## What was built

A proof-of-concept tool that helps non-teacher facilitators see which learners in Years 3 to 6 need support. Learners complete a short reading check; a rule engine (rules v2) assigns each learner a status, shown on a facilitator dashboard with the supporting evidence and a suggested next step. The approach was evaluated on simulated classrooms against an accuracy-only threshold.

| | |
|---|---|
| **App** | Next.js, TypeScript, rule engine, facilitator dashboard |
| **Evaluation** | Python 3.9+, simulated classrooms with fixed seeds |
| **Headline result** | Across 200 simulated classrooms of 30 learners, rules v2 flagged 64.0% of at-risk learners against 59.3% for an accuracy-only threshold, with fewer false alarms (8.8% against 10.8%) |
| **Original repository** | [github.com/mtha724/partIV-facilitator-decision-support](https://github.com/mtha724/partIV-facilitator-decision-support) |

## Folders

| Folder | Contents |
|---|---|
| [`01-Research/`](01-Research/) | Literature and research notes behind the learner-insight indicators and rules |
| [`02-Design/`](02-Design/) | System design, rule design, dashboard design |
| [`03-Code/partIV-facilitator-decision-support/`](03-Code/partIV-facilitator-decision-support/) | The tool and its evaluation, imported with full git history. Its own `README.md` explains how to run both |
| [`04-Evaluation/`](04-Evaluation/) | Guide to the simulated-classroom evaluation; the scripts and result tables live in the code folder under `evaluation/` |
| [`05-AI-Use/`](05-AI-Use/) | How AI was used in Part 2 |

## Running it

```bash
cd 03-Code/partIV-facilitator-decision-support/facilitator-decision-support
npm install
npm run dev
```

The evaluation (Python 3.9+, fixed seeds, about 6 to 7 minutes):

```bash
cd 03-Code/partIV-facilitator-decision-support/facilitator-decision-support/evaluation
pip install -r requirements.txt
python simulated_classroom_evaluation_v2.py
```

Rerunning reproduces the committed result tables in `results_v2/`. See the code folder's README for details.

## Report chapter to compendium map

*To be completed by May.*

| Report chapter | Where the supporting material is |
|---|---|
| | |

---

## Checklist for May

- [ ] Add your individual Canvas submissions to `01-Submissions/*/May-Thazin/` (scope, literature review, mid-year report, final report) as the exact submitted PDFs
- [ ] Fill in the report chapter to compendium map above
- [ ] Add research notes to `01-Research/` (for example, the reading-comprehension and learner-interaction literature, the five dimensions, the benchmark against Kami)
- [ ] Add design records to `02-Design/` (system design diagram, rule definitions, dashboard mock-ups)
- [ ] Write `04-Evaluation/README.md`: what was simulated, why, how to rerun, and which result file backs each figure or table in your report
- [ ] Write `05-AI-Use/README.md`: which tools you used and for what
- [ ] Check that the headline numbers above match your final report
- [ ] Check nothing in your folders identifies anyone who should not be identified
