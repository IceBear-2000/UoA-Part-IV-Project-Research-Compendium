"""
Report figures, built from results_v2/poster_numbers.csv.

Every number drawn here is read from that file (written by
simulated_classroom_evaluation_v2.py), so rerunning the evaluation and then
this script keeps the figures in step with the results. Nothing is hard-coded.

Figures are drawn at a fixed printed size with all text at least 36 pt, and
saved as a 300 dpi PNG and a vector PDF.

  fig2_dashboard_card.png      dashboard screenshot of demo Learner A (report Figure 3.2),
                               not drawn by this script
  fig3_hidden_group            poor comprehenders flagged, 1 vs 3 passages (report Figure 4.1)
  fig4_recall_1_vs_3           all at-risk learners caught, 1 vs 3 passages (report Figure 4.2)
  fig5_class_of_30             at-risk learners caught in a class of 30 (report Figure 4.3)

All results figures use the timing-neutral scenario, so no figure mixes
scenarios.

Usage: python3 make_poster_figures.py [--width-mm 270]
Also writes results_v2/Poster_Figure_Data.xlsx (the data behind each figure).
"""

import argparse
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.patches import Circle

RESULTS = "results_v2"
OUT = "figures"
MM = 1 / 25.4  # inches per mm
MIN_PT = 36    # smallest text size in the figures

# Teal and terracotta stay distinguishable for colour-blind readers
# (separation dE 12.0, contrast 3:1 on white); legends and labels back them up.
ONE_PASSAGE = "#2A8A84"     # deep teal
THREE_PASSAGES = "#B4532A"  # terracotta
INK, MUTED, GRID = "#2B2420", "#6B5E52", "#E5DCCD"  # walnut ink, warm grey, sand rule
NOT_AT_RISK = "#D9D0C3"
# The answer-key model is a reference, not a usable tool: drawn hatched and set
# slightly apart so it never reads as the recommended option.
ANSWER_KEY_KEY, ANSWER_KEY_GAP = "oracle", 0.3

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": MIN_PT,
    "axes.edgecolor": GRID,
    "axes.labelcolor": INK,
    "xtick.color": INK,
    "ytick.color": MUTED,
    "savefig.facecolor": "white",
    "hatch.linewidth": 3,
})

# (key in poster_numbers, axis label). Three groups per chart keeps 36 pt
# value labels inside their own bar's width at 270 mm.
# "Answer-key model" = Random Forest given the true simulated labels, which no
# real classroom has.
HIDDEN_MODELS = [("score", "Score\nonly"), ("v2", "Rules\nv2"), ("oracle", "Answer-key\nmodel*")]
RECALL_MODELS = [("score", "Score\nonly"), ("v1", "Rules\nv1"), ("v2", "Rules\nv2"),
                 ("oracle", "Answer-key\nmodel*")]


def load_numbers():
    df = pd.read_csv(f"{RESULTS}/poster_numbers.csv").set_index("key")
    return df


def save(fig, name):
    os.makedirs(OUT, exist_ok=True)
    for ext in ("png", "pdf"):
        fig.savefig(f"{OUT}/{name}.{ext}", dpi=300)
    plt.close(fig)
    print(f"Wrote {OUT}/{name}.png and .pdf")


def paired_bars(nums, prefix, models, ylabel, width_mm, height_mm):
    """Grouped columns, 1 passage vs 3 passages pooled, with 95% CI whiskers.
    `prefix` selects rows like f"{prefix}_{model}_{n}p" in poster_numbers."""
    fig, ax = plt.subplots(figsize=(width_mm * MM, height_mm * MM), layout="constrained")
    x = np.arange(len(models)) + np.array(
        [ANSWER_KEY_GAP if key == ANSWER_KEY_KEY else 0 for key, _ in models])
    # Narrow bars with a gap inside each pair, so a 36 pt label never runs into
    # a taller neighbouring bar.
    bar, offset_ = 0.36, 0.23
    rows = []
    for offset, n, colour, label in ((-offset_, 1, ONE_PASSAGE, "1 passage"),
                                     (offset_, 3, THREE_PASSAGES, "3 passages")):
        r = nums.loc[[f"{prefix}_{key}_{n}p" for key, _ in models]]
        values, lo, hi = r["value"] * 100, r["ci_lo"] * 100, r["ci_hi"] * 100
        # 2 px-equivalent white edge gives the surface gap between touching bars.
        bars = ax.bar(x + offset, values, bar, color=colour, label=label, edgecolor="white", linewidth=3)
        for patch, (key, _) in zip(bars, models):
            if key == ANSWER_KEY_KEY:
                patch.set(facecolor="white", edgecolor=colour, hatch="//")
        ax.errorbar(x + offset, values, yerr=[values - lo, hi - values], fmt="none",
                    ecolor=INK, elinewidth=2.5, capsize=10, capthick=2.5)
        for xi, v, h in zip(x + offset, values, hi):
            ax.text(xi, h + 2.5, f"{v:.0f}%", ha="center", va="bottom", fontsize=MIN_PT,
                    fontweight="bold", color=INK)
        rows.append(r.assign(passages=n))
    ax.set_xticks(x, [name for _, name in models])
    ax.set_ylim(0, 118)
    ax.set_yticks([0, 25, 50, 75, 100], ["0", "25", "50", "75", "100%"])
    ax.set_ylabel(ylabel)
    ax.yaxis.grid(True, color=GRID, linewidth=1.5)
    ax.set_axisbelow(True)
    ax.tick_params(length=0, pad=12)
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
    ax.legend(frameon=False, loc="upper left", ncols=2, handlelength=1.0,
              borderaxespad=0, bbox_to_anchor=(0, 1.02))
    return fig, pd.concat(rows)


def fig_class_of_30(nums, width_mm):
    at_risk = int(round(nums.loc["at_risk_per_30", "value"]))
    panels = [("Rules v1", "v1"), ("Rules v2", "v2"), ("Answer-key model*", "oracle")]
    fig, axs = plt.subplots(1, 3, figsize=(width_mm * MM, width_mm * 0.5 * MM), layout="constrained")
    rows = []
    for ax, (title, key) in zip(axs, panels):
        r = nums.loc[f"caught_of_class_tn_{key}_1p"]
        caught = int(round(r["value"]))
        ax.axis("off")
        ax.set_xlim(-0.6, 5.6)
        ax.set_ylim(-2.3, 6.2)
        ax.set_aspect("equal")
        for k in range(30):
            row, col = divmod(k, 6)
            xy = (col, 4 - row)
            if k < at_risk:
                filled = k < caught
                if key == ANSWER_KEY_KEY and filled:  # reference, not a tool: hatched
                    ax.add_patch(Circle(xy, 0.4, fc="white", ec=THREE_PASSAGES, lw=4, hatch="//"))
                else:
                    ax.add_patch(Circle(xy, 0.4, fc=THREE_PASSAGES if filled else "white",
                                        ec=THREE_PASSAGES, lw=4))
            else:
                ax.add_patch(Circle(xy, 0.4, fc=NOT_AT_RISK, ec="none"))
        ax.text(2.5, 5.6, title, ha="center", fontsize=MIN_PT + 4, fontweight="bold", color=INK)
        ax.text(2.5, -1.1, f"{caught} of {at_risk} caught", ha="center", fontsize=MIN_PT,
                fontweight="bold", color=INK)
        ax.text(2.5, -2.1, f"(95% CI {r['ci_lo']:.1f}–{r['ci_hi']:.1f})", ha="center",
                fontsize=MIN_PT, color=MUTED)
        rows.append(r)
    save(fig, "fig5_class_of_30")
    return pd.DataFrame(rows)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--width-mm", type=float, default=270,
                        help="printed width of each chart (A1 is 594 mm wide)")
    args = parser.parse_args()
    nums = load_numbers()

    fig, hidden = paired_bars(nums, "hidden_tn", HIDDEN_MODELS, "Poor comprehenders flagged",
                              args.width_mm, args.width_mm * 0.8)
    save(fig, "fig3_hidden_group")

    # Four groups need more width to keep 36 pt labels clear of neighbouring bars.
    fig, recall = paired_bars(nums, "recall_tn", RECALL_MODELS, "At-risk learners caught",
                              args.width_mm * 1.5, args.width_mm * 0.8)
    save(fig, "fig4_recall_1_vs_3")

    pictogram = fig_class_of_30(nums, args.width_mm * 2)

    with pd.ExcelWriter(f"{RESULTS}/Poster_Figure_Data.xlsx") as xl:
        nums.reset_index().to_excel(xl, sheet_name="all headline numbers", index=False)
        hidden.reset_index().to_excel(xl, sheet_name="fig3 hidden group", index=False)
        recall.reset_index().to_excel(xl, sheet_name="fig4 recall", index=False)
        pictogram.reset_index().to_excel(xl, sheet_name="fig5 class of 30", index=False)
    print(f"Wrote {RESULTS}/Poster_Figure_Data.xlsx")
