# 04 · Evaluation

A guide to the simulated-classroom evaluation behind **Sections 3.5 to 3.7 and 4** of May's final report and its **Appendices A and B**. It explains what was simulated and why, how to rerun it, and which file backs each table and figure in the report.

The scripts and results live with the code, so they stay in step with the rules they test:

| | Location |
|---|---|
| Simulation script | [`simulated_classroom_evaluation_v2.py`](../03-Code/partIV-facilitator-decision-support/facilitator-decision-support/evaluation/simulated_classroom_evaluation_v2.py) |
| Figure script | [`make_poster_figures.py`](../03-Code/partIV-facilitator-decision-support/facilitator-decision-support/evaluation/make_poster_figures.py) |
| Pinned dependencies | [`requirements.txt`](../03-Code/partIV-facilitator-decision-support/facilitator-decision-support/evaluation/requirements.txt) |
| Result tables and per-learner data | [`results_v2/`](../03-Code/partIV-facilitator-decision-support/facilitator-decision-support/evaluation/results_v2/) |
| Report figures (PNG and PDF) | [`figures/`](../03-Code/partIV-facilitator-decision-support/facilitator-decision-support/evaluation/figures/) |
| Technical notes on the evaluation | [`evaluation/README.md`](../03-Code/partIV-facilitator-decision-support/facilitator-decision-support/evaluation/README.md) |

> **Every number here comes from simulated learners.** The results show how the rules behave under stated assumptions. They are not measurements from real classrooms, and no real learner data was collected.

---

## Why a simulation

No real classroom outcome data was available within the project's ethics approval and timeline (the ethics process is described in [`03-.../07-Ethics`](../../03-Admin-Facilitator-Side_Moksh-Manglani/07-Ethics/), and the joint interview and ethics planning in [`02-General/Interview-and-Ethics-Planning`](../../02-General/Interview-and-Ethics-Planning/)), so there was no ground truth against which to measure the rules. Simulated learners are an established evaluation method in AI in Education (Self's "wind tunnel", Sierra, Cascade, SimStudent, TutorGym; Greer and Mark list it among the standard methods for evaluating tutoring systems). Because each simulated learner's profile is known, recall, precision and false-alarm rates can be computed directly. The main weakness, that simulated learners have not been checked against real ones (Käser and Alexandron's "Turing-like test"), is the report's main limitation.

## What was simulated

**Five reader profiles (personas)**, Report Table 3.4 and Appendix A.1, defined in `PERSONAS` in the script:

| Persona | Share | P(correct) literal / inferential | Behaviour | At risk |
|---|---|---|---|---|
| Typical | 70% | 0.90 / 0.80 | Well calibrated, few hints | No |
| Careful reviser | 8% | 0.90 / 0.82 | Slower, more revisits and changes, frequent repair | No |
| Poor comprehender | 11% | 0.85 / 0.45 | Fluent and fast; judges 65% of wrong answers "correct" | Yes |
| Decoding-limited | 6% | 0.55 / 0.45 | Slow, many pre-attempt hints, aware of difficulty | Yes |
| Mixed | 5% | 0.50 / 0.35 | Slow, moderately overconfident | Yes |

Only the 11% poor-comprehender share comes from data (Kelso et al., 2022: 24 of 218 children). Every other share and distribution is an assumption shaped by the reader-profile literature.

**Sessions.** Each simulated session has four questions with the same fields the app records. Confidence, judgements, hints, timings, revisits and answer changes are drawn from the persona's distributions. Features are computed by `session_features()`, which uses the same definitions as the app's `computeSessionMetrics()`.

**Seven compared systems** (Report Section 3.6):

1. Score only: flag if accuracy is below 75% (what a facilitator could do without the tool)
2. Rules v1, "needs support" only
3. Rules v1, "needs support" or "check-in"
4. **Rules v2, "needs support" only** (the headline system)
5. Rules v2, "needs support" or "check-in"
6. Random Forest trained on rules v1 labels (the planned ML approach; with no real labels, the rules act as labellers)
7. Random Forest trained on the true simulated labels (the "answer-key model": a ceiling, not deployable)

The Random Forests use scikit-learn, 200 trees, maximum depth 6, on all 17 session metrics.

**Metrics.** Recall (share of at-risk learners flagged), precision, false-alarm rate (share of not-at-risk learners flagged) and the share of poor comprehenders flagged. Each has a 95% bootstrap interval.

**Robustness checks.** Timing-neutral personas (the headline scenario: poor comprehenders are given typical timing, hints, revisits, answer changes and repair, so only their comprehension and self-judgement differ), persona difference (α = 1, 0.75, 0.5), poor-comprehender share (5, 11, 15%), class size 20, and three passages pooled.

## Test conditions

| Setting | Value |
|---|---|
| Training set | 4,000 sessions, seed 101 |
| Test set | 200 independent classrooms of 30 learners (6,000 sessions), seed 202 |
| Seed replication | Four more train/test pairs: 10101/10202, 20101/20202, 30101/30202, 40101/40202 |
| Bootstrap | 1,000 resamples of the 200 test classrooms, seed 7 |
| Rule tuning | Rules v2 were adjusted once after a first run (overconfidence on errors was added), then tested on the held-out seed. Reported as a limitation |
| Software | Python 3.9 or later; NumPy 2.0.2, pandas 2.3.3, scikit-learn 1.6.1, Matplotlib 3.9.4, openpyxl 3.1.5 |
| Hardware | No special hardware. Runs on a laptop CPU in about six to seven minutes |

## How to rerun it

From the repository root:

```bash
cd 04-Facilitator-Student-Side_May-Thazin/03-Code/partIV-facilitator-decision-support/facilitator-decision-support/evaluation
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 simulated_classroom_evaluation_v2.py
python3 make_poster_figures.py
```

- The first script writes every table to `results_v2/`. Add `--quick` to skip the seed replication.
- The second writes the figures to `figures/` and `results_v2/Poster_Figure_Data.xlsx`.
- The seeds are fixed, so the tables should match the committed ones exactly. To check, run in a copy of the folder and compare, for example `diff results_v2/table_model_comparison.csv <copy>/results_v2/table_model_comparison.csv`.
- The dashboard screenshot used as Figure 3.2 (`figures/fig2_dashboard_card.png`) is not generated by the scripts. It is demo Learner A in the app (see [`02-Design`](../02-Design/)).

### Reproducibility check

The evaluation was rerun from a clean copy on 20 October 2026 (macOS, Python 3.9, the pinned versions above, about seven minutes) and each output was compared byte for byte with the committed file.

| Result | Files |
|---|---|
| **Identical** (14 of 15) | `poster_numbers.csv`, `table_model_comparison.csv`, `table_more_data.csv`, `table_robustness.csv`, `table_seed_replication.csv`, `table_sensitivity.csv`, `table_share_flagged_by_persona.csv`, `table_timing_neutral.csv`, both `*_feature_importance.csv` files and all three `simulated_learners_*.csv` files |
| **Not produced by the scripts** (1) | `table_flagged_by_reader_type_timing_neutral.csv` (Report Table 4.2 and the poor-comprehender column of Table 4.3). It was computed on 11 October 2026, while preparing the poster, by a one-off command that reran the score and rules v2 on the same timing-neutral test learners (seed 202) and counted flags per persona. The rules involve no training, so this gives the same flags as the main run. Its one-passage rows match `simulated_learners_1_passage_timing_neutral.csv` exactly, and its poor-comprehender rows for both one and three passages match `poster_numbers.csv` (keys `hidden_tn_score_*` and `hidden_tn_v2_*`). The other three-passage rows cannot be checked from the committed files, because there is no three-passage timing-neutral per-learner file |

For a future student: adding this table to `simulated_classroom_evaluation_v2.py` would make every committed result reproducible from the scripts.

## Which file backs each part of the report

All paths are inside [`evaluation/`](../03-Code/partIV-facilitator-decision-support/facilitator-decision-support/evaluation/). In the CSVs, `scenario = timing_neutral` is the headline scenario and `scenario = main` (setting "as defined") is the original personas.

| Report item | What it shows | Source |
|---|---|---|
| Abstract, Section 4.1, Table 4.1 | Detection of at-risk learners, timing-neutral, one passage | `results_v2/table_sensitivity.csv` (rows `timing_neutral`, passages 1); intervals and seed ranges in `results_v2/poster_numbers.csv` (keys `*_tn_*_1p`) |
| Section 4.1, "as defined" comparison | 60.9% vs 56.7% at equal false-alarm rate | `results_v2/table_model_comparison.csv` |
| Section 4.1, ten replication runs | Rules v2 ahead in every run | `results_v2/table_seed_replication.csv` |
| Table 4.2 | Share of each reader profile flagged | `results_v2/table_flagged_by_reader_type_timing_neutral.csv` (score and rules); answer-key model from `results_v2/simulated_learners_1_passage_timing_neutral.csv`; as defined in `results_v2/table_share_flagged_by_persona.csv` |
| Section 4.2, Figure 4.1 | Poor comprehenders flagged, one vs three passages | `figures/fig3_hidden_group.png` / `.pdf`; data in `results_v2/poster_numbers.csv` (keys `hidden_tn_*`) and `results_v2/table_timing_neutral.csv` |
| Section 4.3, Table 4.3, Figure 4.2 | One vs three passages | `results_v2/table_sensitivity.csv` (timing-neutral, passages 1 and 3), `results_v2/table_more_data.csv` (as defined); `figures/fig4_recall_1_vs_3.png` / `.pdf` |
| Section 4.3, post-hoc 0.33 threshold | 60.0% of poor comprehenders, 77.1% recall | `results_v2/table_sensitivity.csv` (rows `pooled_gap_threshold_posthoc`) |
| Section 4.4 | Random Forest comparison and feature importances | `results_v2/table_model_comparison.csv`, `results_v2/pseudo_feature_importance.csv`, `results_v2/oracle_feature_importance.csv` |
| Section 4.5, Table 4.4 | Recall under alternative assumptions | `results_v2/table_sensitivity.csv` (rows `persona_difference_alpha`, `poor_comprehender_share`, `class_size`); `results_v2/table_robustness.csv` |
| Section 4.6, Figure 4.3 | At-risk learners caught in a class of 30 | `figures/fig5_class_of_30.png` / `.pdf`; data in `results_v2/poster_numbers.csv` (keys `caught_of_class_*`) |
| Section 4.7 | End-to-end walkthrough of Learner A | The app's engine with demo data; see [`02-Design`](../02-Design/) |
| Appendix A.1, A.2 | Persona parameters and rule thresholds | `PERSONAS`, `rules_v1()` and `rules_v2()` in the script |
| Display Day poster | Headline numbers and figures | `results_v2/poster_numbers.csv`, `results_v2/Poster_Figure_Data.xlsx` |
| Any further analysis | One row per simulated learner, with every system's flag | `results_v2/simulated_learners_*.csv` (column names match the app's CSV export) |

## Headline results (timing-neutral, one passage)

| System | Recall (95% CI) | Precision | False alarms | Poor comprehenders flagged |
|---|---|---|---|---|
| Score only (< 75%) | 59.3% (56.2 to 62.2) | 60.0% | 10.8% | 46.4% |
| **Rules v2, needs support** | **64.0% (61.0 to 66.9)** | **66.9%** | **8.8%** | **53.7%** |
| Rules v2, needs support or check-in | 85.7% | 45.8% | 28.9% | 72.1% |
| Random Forest, v1 rule labels | 48.8% | 68.5% | 5.9% | 25.3% |
| Random Forest, answer key (ceiling) | 62.6% | 90.4% | 1.9% | 29.7% |

What they mean, in short (Report Section 5.1):

- **RQ1.** The rules are slightly better than a score (4.7 points more recall, fewer false alarms), consistently across all replications and sensitivity runs, and every flag comes with its evidence.
- **RQ2.** The comprehension-pattern rule catches more poor comprehenders on one passage (53.7% vs 46.4%), but nearly half are still missed, and with three passages the pre-specified threshold does worse than the score (38.8% vs 67.9%) because of the threshold-granularity issue.
- **RQ3.** A Random Forest trained on rule labels only copies the rules. A model trained on real labels could help (84.2% recall on three passages), but much of its advantage with the original personas came from the speed cue built into the simulation.

## Limitations to keep in mind

- **Assumed personas.** Absolute numbers depend heavily on how distinct the personas are (halving the difference roughly halves recall). Treat the results as relative comparisons.
- **Personas built from the same signals the rules read**, which favours the rules.
- **Rules tuned once** on simulated data before the held-out test.
- **Pooled threshold error** (0.34 acts like 0.5 over three passages). The pre-specified result is reported; 0.33 is reported separately as post hoc.
- **One task type**: three short narrative passages, multiple choice, four questions each.
- **No human evaluation.** No facilitator has used the dashboard.

What to do about these is in [`05-Future-Work-and-Handover`](../../05-Future-Work-and-Handover/).
