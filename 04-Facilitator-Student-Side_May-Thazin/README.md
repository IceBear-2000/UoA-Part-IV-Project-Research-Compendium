# Part 2 · Student Learning Insights (Facilitator and Student)

**May Thazin** · `mtha724` · Final report: *Part 2, Student Learning Insights*

> **Status:** code, submissions and two research documents are in. The remaining items are listed in [`TODO-for-May.md`](TODO-for-May.md).

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

The full commit history is also listed in [`COMMIT-HISTORY.md`](03-Code/COMMIT-HISTORY.md), for readers of the zip.

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

## What is left to add

The remaining items, with exact folders and file names, are in [`TODO-for-May.md`](TODO-for-May.md).
