# Simulated classroom evaluation

Evaluates the facilitator decision-support rules on simulated Year 3–6 learners.
All results describe how the rules behave under the stated assumptions; none of
them are measurements from real classrooms.

## Layout

```
evaluation/
├── simulated_classroom_evaluation_v2.py   simulation, compared systems and all result tables
├── make_poster_figures.py                 report figures from results_v2/poster_numbers.csv
├── requirements.txt                       pinned Python dependencies
├── results_v2/                            result tables (CSV) and per-learner data
└── figures/                               report figures (PNG + PDF)
```

## Run

From this folder, with Python 3.9 or later:

```bash
pip install -r requirements.txt
python3 simulated_classroom_evaluation_v2.py   # about 6 minutes; --quick skips seed replication
python3 make_poster_figures.py                 # writes figures/ and results_v2/Poster_Figure_Data.xlsx
```

The dashboard screenshot (`figures/fig2_dashboard_card.png`) shows demo Learner A,
loaded with "Load demo data" on the facilitator dashboard.

Models train on seed 101 and are tested on seed 202 (200 classrooms of 30).
Seed replication repeats the main pair with four more: 10101/10202, 20101/20202,
30101/30202 and 40101/40202. Bootstrap intervals use seed 7 with 1,000 resamples.

## Figures

| File | Report figure |
|---|---|
| `fig2_dashboard_card.png` | Figure 3.2 |
| `fig3_hidden_group` | Figure 4.1 |
| `fig4_recall_1_vs_3` | Figure 4.2 |
| `fig5_class_of_30` | Figure 4.3 |

All results figures use the timing-neutral scenario.

## Data sources and assumptions

| Parameter | Source |
|---|---|
| Poor-comprehender share, 11% | Kelso et al. (2022): 24 of 218 children |
| Other persona shares (typical 70%, careful reviser 8%, decoding-limited 6%, mixed 5%) | Assumption |
| Per-persona accuracy, self-judgement, confidence, hint, timing and revisit distributions | Assumption, shaped by the reader-profile literature |
| Rule thresholds (delays, revisits, gap 0.5 / 0.34, overconfidence 0.5) | Assumption: prototype defaults, not validated cut-offs |

The sensitivity runs (`table_sensitivity.csv`) vary the poor-comprehender share
(5/11/15%), how distinct the personas are (alpha 1/0.75/0.5), class size (20/30)
and the timing cue.

## Notes on interpreting the results

- **Rules v2** were adjusted once after a first run (the overconfidence-on-errors
  measure was added), then tested on a held-out seed.
- **Timing-neutral scenario.** As first defined, poor comprehenders answer faster
  than typical readers, which gives every model a timing cue. The timing-neutral
  scenario gives them typical timing, hints, revisits, answer changes and repair.
  The answer-key model then flags 30% (1 passage) and 69% (3 passages) of them
  instead of 58% and 95%. `table_timing_neutral.csv` has both.
- **Pooled gap threshold.** Over 3 passages the inferential gap moves in steps of
  1/6, so the 0.34 threshold excludes a gap of 2/6 and acts like 0.5. This is why
  rules v2 flag fewer poor comprehenders with 3 passages. A post-hoc run with 0.33
  is reported separately in `table_sensitivity.csv`.
- **Answer-key model** is a Random Forest trained on the true simulated labels: a
  ceiling, not something that could be deployed.
- **Feature importance** (`*_feature_importance.csv`) reflects the persona
  assumptions and rule thresholds. It does not validate the features.

## Outputs (`results_v2/`)

| File | Contents |
|---|---|
| `poster_numbers.csv` | Headline numbers: value, 95% bootstrap CI, min/max over 5 seed pairs |
| `table_model_comparison.csv` | Main comparison (1 passage), with CIs |
| `table_more_data.csv` | 1 vs 3 passages pooled |
| `table_timing_neutral.csv` | Poor comprehenders flagged, as defined vs timing-neutral |
| `table_sensitivity.csv` | All sensitivity runs, every model |
| `table_seed_replication.csv` | Headline runs on 5 seed pairs |
| `table_share_flagged_by_persona.csv`, `table_flagged_by_reader_type_timing_neutral.csv` | Share of each persona flagged |
| `table_robustness.csv` | Recall by persona difference (alpha) |
| `oracle_feature_importance.csv`, `pseudo_feature_importance.csv` | Random Forest feature importances |
| `simulated_learners_*.csv` | One row per simulated learner; column names match the app's session CSV export |
| `Poster_Figure_Data.xlsx` | The data behind each report figure |
