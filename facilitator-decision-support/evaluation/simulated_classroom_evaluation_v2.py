"""
Simulated classroom evaluation of the facilitator decision-support rules.

Generates simulated Year 3-6 learners, runs every compared system on them and
writes the result tables to results_v2/.

* Sessions match the app: one session is one passage with 4 questions
  (2 literal + 2 inferential), and features are computed exactly as in
  recommendationEngine.ts (session_features()).
* rules_v1() ports the first version of the app's rules; rules_v2() is the
  refined version the app now runs.
* Five personas follow the reader-profile literature: typical, careful reviser,
  poor comprehender (fluent, weak inference, overconfident), decoding-limited
  and mixed.
* Compared systems: score only, rules v1 and v2 at two flag levels, a Random
  Forest trained on rules-v1 labels, and a Random Forest trained on the true
  labels (an "answer-key" ceiling that could not be deployed).
* Uncertainty: 95% bootstrap intervals over the 200 test classrooms, and the
  headline runs repeated on 5 independent train/test seed pairs.
* Checks: timing-neutral personas (poor comprehenders get typical timing, hint,
  revisit, answer-change and repair behaviour), persona difference
  (alpha 1/0.75/0.5), poor-comprehender share (5/11/15%), class size (20/30),
  1 vs 3 pooled passages, and the pooled gap threshold (post hoc, see rules_v2).

Assumptions: only the 11% poor-comprehender share comes from data (24 of 218
children, Kelso et al., 2022). All other persona parameters are assumptions
informed by the literature. rules_v2() was adjusted once after a first run
(the overconfidence-on-errors measure was added) and then tested on the
held-out seed.

Usage: python3 simulated_classroom_evaluation_v2.py           (about 6 minutes)
       python3 simulated_classroom_evaluation_v2.py --quick   (skips seed replication)
Outputs: results_v2/*.csv and printed tables.
"""

import copy
import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

OUT_DIR = "results_v2"
os.makedirs(OUT_DIR, exist_ok=True)

TRAIN_SEED, TEST_SEED = 101, 202   # rules are designed on neither; models train on TRAIN only
N_TRAIN_SESSIONS = 4000
N_TEST_CLASSROOMS = 200
CLASS_SIZE = 30
GAP_ONE, GAP_POOLED = 0.5, 0.34   # inferential-gap thresholds, see rules_v2()
N_BOOT, BOOT_SEED = 1000, 7       # bootstrap resamples of test classrooms
N_SEED_REPS = 5                   # independent train/test seed pairs

# ---------------------------------------------------------------------------
# 1. PERSONAS (assumed parameters; see module docstring)
# ---------------------------------------------------------------------------
# p_correct: P(correct) for literal / inferential questions.
# judge_if_correct / judge_if_wrong: probabilities of the learner judging their
#   own answer (correct, unsure, incorrect) AFTER answering (postdictive).
# conf_mu: mean pre-answer confidence on the app's 1-4 scale.
# p_pre / p_post: P(hint before attempt) / P(hint after attempt).
# fi, qt: first-interaction delay and question time (seconds), (mean, sd).
# ac, rv: answer changes / passage revisits per question (Poisson mean).
# p_repair: P(reread or revise after a hint).
# diff: P(perceived difficulty = 1, 2, 3).
# read: reading time (seconds), (mean, sd).
# Literature-based: ONLY the poor-comprehender share (0.11, Kelso et al., 2022).
# Everything else (other shares, accuracies, judgement and timing
# distributions) is an ASSUMPTION chosen to reflect the qualitative profiles
# in the literature. The sensitivity runs vary the most influential ones.
PERSONAS = {
    "typical": dict(
        share=0.70, at_risk=False,
        p_correct=(0.90, 0.80),
        judge_if_correct=(0.75, 0.20, 0.05), judge_if_wrong=(0.25, 0.35, 0.40),
        conf_mu=3.2, p_pre=0.05, p_post=0.15, fi=(9, 4), qt=(30, 10),
        ac=0.2, rv=0.2, p_repair=0.5, diff=(0.60, 0.35, 0.05), read=(60, 15),
    ),
    "careful_reviser": dict(
        share=0.08, at_risk=False,
        p_correct=(0.90, 0.82),
        judge_if_correct=(0.78, 0.18, 0.04), judge_if_wrong=(0.20, 0.30, 0.50),
        conf_mu=3.0, p_pre=0.05, p_post=0.25, fi=(12, 5), qt=(40, 12),
        ac=0.7, rv=0.5, p_repair=0.8, diff=(0.45, 0.45, 0.10), read=(70, 15),
    ),
    # Fluent, good at literal questions, weak at inference, overconfident.
    # The "hidden" group (Nation et al., 2004; Kelso et al., 2022).
    "poor_comprehender": dict(
        share=0.11, at_risk=True,
        p_correct=(0.85, 0.45),
        judge_if_correct=(0.90, 0.08, 0.02), judge_if_wrong=(0.65, 0.20, 0.15),
        conf_mu=3.4, p_pre=0.03, p_post=0.08, fi=(7, 3), qt=(22, 8),
        ac=0.15, rv=0.15, p_repair=0.3, diff=(0.65, 0.30, 0.05), read=(50, 12),
    ),
    # Slow, effortful, aware of difficulty; weak on both question types.
    "decoding_limited": dict(
        share=0.06, at_risk=True,
        p_correct=(0.55, 0.45),
        judge_if_correct=(0.50, 0.35, 0.15), judge_if_wrong=(0.15, 0.30, 0.55),
        conf_mu=2.2, p_pre=0.35, p_post=0.35, fi=(24, 9), qt=(70, 20),
        ac=1.0, rv=1.5, p_repair=0.6, diff=(0.10, 0.40, 0.50), read=(120, 30),
    ),
    "mixed": dict(
        share=0.05, at_risk=True,
        p_correct=(0.50, 0.35),
        judge_if_correct=(0.60, 0.30, 0.10), judge_if_wrong=(0.45, 0.30, 0.25),
        conf_mu=2.6, p_pre=0.25, p_post=0.30, fi=(17, 7), qt=(55, 18),
        ac=0.9, rv=1.2, p_repair=0.5, diff=(0.20, 0.40, 0.40), read=(100, 25),
    ),
}
PERSONA_NAMES = list(PERSONAS)
SHARES = np.array([PERSONAS[n]["share"] for n in PERSONA_NAMES])
assert abs(SHARES.sum() - 1) < 1e-9

# Behaviour that is not comprehension or self-judgement. The timing-neutral
# check sets these equal to "typical" for poor comprehenders.
BEHAVIOUR_KEYS = ("fi", "qt", "read", "p_pre", "p_post", "rv", "ac", "p_repair")


def timing_neutral_personas():
    personas = copy.deepcopy(PERSONAS)
    for key in BEHAVIOUR_KEYS:
        personas["poor_comprehender"][key] = PERSONAS["typical"][key]
    return personas


def with_poor_comprehender_share(share):
    """Change the poor-comprehender share; the difference comes out of (or
    goes into) the typical share so the other at-risk groups are unchanged."""
    personas = copy.deepcopy(PERSONAS)
    personas["typical"]["share"] -= share - personas["poor_comprehender"]["share"]
    personas["poor_comprehender"]["share"] = share
    return personas

QUESTION_TYPES = ["lit", "lit", "inf", "inf"]  # 2 literal + 2 inferential per passage


def blend(value, typical_value, alpha):
    """Linear blend toward the typical persona. alpha=1 keeps the persona as
    defined; alpha=0.5 halves every difference from typical. Linear blending
    keeps probability triples valid (they still sum to 1)."""
    if isinstance(value, tuple):
        return tuple(blend(v, t, alpha) for v, t in zip(value, typical_value))
    return typical_value + alpha * (value - typical_value)


def persona_params(name, alpha, personas=None):
    personas = personas or PERSONAS
    base = personas["typical"]
    p = personas[name]
    out = {}
    for k, v in p.items():
        out[k] = v if k in ("share", "at_risk") else blend(v, base[k], alpha)
    return out


# ---------------------------------------------------------------------------
# 2. SESSION GENERATION (4 questions per session, like one app passage)
# ---------------------------------------------------------------------------
def simulate_session(persona, rng, alpha=1.0, n_passages=1, personas=None):
    """One learner profile built from n_passages passages (4 questions each).
    n_passages=1 is what the app flags on today; n_passages=3 pools the three
    passages a learner completes, to test the value of more data per learner."""
    p = persona_params(persona, alpha, personas)
    qs = []
    for i, qt in enumerate(QUESTION_TYPES * n_passages):
        pc = p["p_correct"][0 if qt == "lit" else 1]
        correct = rng.random() < pc
        triple = p["judge_if_correct"] if correct else p["judge_if_wrong"]
        judged = rng.choice(["correct", "unsure", "incorrect"], p=np.array(triple) / sum(triple))
        conf = int(np.clip(round(rng.normal(p["conf_mu"] + (0.3 if correct else -0.3), 0.7)), 1, 4))
        pre = rng.random() < np.clip(p["p_pre"], 0, 1)
        post = rng.random() < np.clip(p["p_post"] * (1.0 if correct else 1.5), 0, 1)
        hints = int(pre) + int(post) + (rng.poisson(0.1) if (pre or post) else 0)
        qs.append(dict(
            type=qt, correct=int(correct), judged=judged, conf=conf,
            pre=int(pre), hints=hints,
            first=max(2.0, rng.normal(*p["fi"])),
            qtime=max(5.0, rng.normal(*p["qt"])),
            changes=int(rng.poisson(max(p["ac"], 0))),
            revisits=int(rng.poisson(max(p["rv"], 0))),
            repair=int((pre or post) and rng.random() < np.clip(p["p_repair"], 0, 1)),
        ))
    reading = sum(max(20.0, rng.normal(*p["read"])) for _ in range(n_passages))
    diffs = [int(rng.choice([1, 2, 3], p=np.array(p["diff"]) / sum(p["diff"])))
             for _ in range(n_passages)]
    return session_features(qs, reading, max(diffs), n_passages)


JUDGE_VALUE = {"correct": 1.0, "unsure": 0.5, "incorrect": 0.0}


def session_features(qs, reading, diff, n_passages=1):
    """Same metrics as computeSessionMetrics() and generateRecommendation()
    in recommendationEngine.ts. When n_passages > 1, counts and total time are
    divided by n_passages so they stay on the same per-passage scale and the
    same thresholds apply."""
    k = float(n_passages)
    n = len(qs)
    lit = [q for q in qs if q["type"] == "lit"]
    inf = [q for q in qs if q["type"] == "inf"]
    acc = sum(q["correct"] for q in qs) / n
    lit_acc = sum(q["correct"] for q in lit) / len(lit)
    inf_acc = sum(q["correct"] for q in inf) / len(inf)
    bias = sum(JUDGE_VALUE[q["judged"]] - q["correct"] for q in qs) / n
    # Overconfidence on errors: of the answers that were wrong, the share the
    # learner judged "correct". Unlike the overall bias score, this does not
    # get diluted as more correct answers are added, so it is stable across
    # 4 and 12 questions.
    wrong = [q for q in qs if q["correct"] == 0]
    oc_err = (sum(q["judged"] == "correct" for q in wrong) / len(wrong)) if wrong else 0.0
    return dict(
        oc_err_rate=oc_err,
        accuracy=acc, literal_acc=lit_acc, inferential_acc=inf_acc,
        gap=lit_acc - inf_acc, bias=bias,
        accurate_est=sum((q["judged"] == "correct" and q["correct"] == 1) or
                         (q["judged"] == "incorrect" and q["correct"] == 0) for q in qs) / k,
        pre_hints=sum(q["pre"] for q in qs) / k, total_hints=sum(q["hints"] for q in qs) / k,
        changes=sum(q["changes"] for q in qs) / k, revisits=sum(q["revisits"] for q in qs) / k,
        avg_first=float(np.mean([q["first"] for q in qs])),
        avg_qtime=float(np.mean([q["qtime"] for q in qs])),
        repairs=sum(q["repair"] for q in qs) / k,
        low_conf=sum(q["conf"] <= 2 for q in qs) / k,
        difficulty=diff,
        total_time=(reading + sum(q["qtime"] for q in qs) + 20.0 * k) / k,
    )


def generate_sessions(n, seed, alpha=1.0, n_passages=1, personas=None):
    personas = personas or PERSONAS
    shares = np.array([personas[name]["share"] for name in PERSONA_NAMES])
    rng = np.random.default_rng(seed)
    drawn = rng.choice(PERSONA_NAMES, size=n, p=shares)
    rows = []
    for name in drawn:
        row = simulate_session(name, rng, alpha, n_passages, personas)
        row["persona"] = name
        row["at_risk"] = int(personas[name]["at_risk"])
        rows.append(row)
    return pd.DataFrame(rows)


# ---------------------------------------------------------------------------
# 3. RULE ENGINES
# ---------------------------------------------------------------------------
SEV = {"none": 0, "low": 1, "medium": 2, "high": 3}


def rules_v1(s):
    """Port of generateRecommendation() as built before this revision.
    Returns the highest severity among the indicators it would raise."""
    sev = ["low"]  # every session shows at least one (secure-progress is low)
    acc = s.accuracy
    if (s.avg_first >= 20 or s.changes >= 2 or s.revisits >= 2
            or s.avg_qtime >= 75 or s.pre_hints >= 1):
        sev.append("medium" if acc >= 0.75 else "high")          # task-processing
    if acc < 1:
        sev.append("high" if acc < 0.5 else "medium")             # accuracy
    if s.total_hints > 0:
        sev.append("medium" if s.total_hints > 1 else "low")      # hint-use
    if s.low_conf > 0:
        sev.append("medium")                                      # low-question-confidence
    if s.difficulty >= 3:
        sev.append("medium")                                      # high-difficulty
    if s.bias >= 0.4:
        sev.append("high" if s.bias >= 0.7 else "medium")         # confidence-miscalibration
    if s.gap >= 0.34:
        sev.append("medium")                                      # inferential-gap
    if s.total_time > 240:
        sev.append("medium")                                      # extended-time
    return max(sev, key=lambda x: SEV[x])


def rules_v2(s, gap_threshold=GAP_ONE):
    """Refined rules. gap_threshold is 0.5 for a single 4-question passage
    (literal and inferential accuracy can only move in steps of 0.5) and 0.34
    when pooling three passages (finer steps, less noise).
    Changes from v1, each tied to the research:

    * Processing difficulty needs TWO converging signals (or two pre-attempt
      hints) instead of any single one. Pre-attempt hints are the strongest
      single signal (hint-use literature), so two of them count as converging.
    * Accuracy: only below 75% raises a concern; a single miss is "low".
    * New comprehension pattern: literal accuracy clearly above inferential
      accuracy WITH overconfidence on errors (at least half of the wrong
      answers judged "correct") is the profile of the
      fluent-but-poor comprehender, the group teachers miss (Kelso et al.,
      2022; Nation et al., 2004). Raised to high only when both occur.
    * Miscalibration alone stays medium (younger and poorer comprehenders are
      overconfident, but so are some typical readers).

    Pooled threshold: over 3 passages there are
    6 questions of each type, so the gap moves in steps of 1/6 and a gap of
    2/6 = 0.333 falls just below 0.34. The pooled threshold therefore acts
    like 0.5. It is left unchanged so the reported results stay pre-specified;
    the sensitivity runs report 0.33 separately, labelled post-hoc.
    """
    sev = ["low"]
    acc = s.accuracy
    signals = (int(s.avg_first >= 20) + int(s.revisits >= 2) + int(s.avg_qtime >= 75)
               + int(s.changes >= 3) + int(s.pre_hints >= 1) + int(s.pre_hints >= 2))
    if signals >= 2:
        sev.append("medium" if acc >= 0.75 else "high")
    if acc < 0.5:
        sev.append("high")
    elif acc < 0.75:
        sev.append("medium")
    elif acc < 1:
        sev.append("low")
    if s.bias >= 0.4:
        sev.append("medium")
    if s.gap >= gap_threshold:
        sev.append("high" if s.oc_err_rate >= 0.5 else "low")
    if s.low_conf >= 2:
        sev.append("medium")
    if s.difficulty >= 3 and acc < 0.75:
        sev.append("medium")
    return max(sev, key=lambda x: SEV[x])


def flag_from_severity(sev, level):
    return int(SEV[sev] >= SEV[level])


# ---------------------------------------------------------------------------
# 4. MODELS AND EVALUATION
# ---------------------------------------------------------------------------
FEATURES = ["accuracy", "literal_acc", "inferential_acc", "gap", "bias", "oc_err_rate", "accurate_est",
            "pre_hints", "total_hints", "changes", "revisits", "avg_first", "avg_qtime",
            "repairs", "low_conf", "difficulty", "total_time"]


def label_with(df, fn, level):
    return df.apply(lambda r: flag_from_severity(fn(r), level), axis=1)


def metrics(truth, pred):
    truth, pred = np.asarray(truth), np.asarray(pred)
    tp = ((pred == 1) & (truth == 1)).sum()
    fp = ((pred == 1) & (truth == 0)).sum()
    fn = ((pred == 0) & (truth == 1)).sum()
    tn = ((pred == 0) & (truth == 0)).sum()
    return dict(
        precision=tp / (tp + fp) if tp + fp else np.nan,
        recall=tp / (tp + fn) if tp + fn else np.nan,
        false_alarm_rate=fp / (fp + tn) if fp + tn else np.nan,
        accuracy=(tp + tn) / len(truth),
    )


def train_rf(train, labels):
    clf = RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42, n_jobs=-1)
    clf.fit(train[FEATURES], labels)
    return clf


def build_systems(train):
    """Everything that learns, learns from TRAIN only."""
    v1_high_labels = label_with(train, rules_v1, "high")
    return dict(
        rf_pseudo=train_rf(train, v1_high_labels),     # deployed-style: learns the v1 rules
        rf_oracle=train_rf(train, train["at_risk"]),   # ceiling: learns true labels
    )




SCORE = "Score only (accuracy < 75%)"
V1 = "Rules v1: 'needs support' only"
V2 = "Rules v2: 'needs support' only"
V2_CHECK = "Rules v2: 'needs support' or 'check-in'"
ORACLE = "Random Forest (oracle, true labels)"


def predictions(df, systems, gap_threshold=GAP_ONE):
    v2 = lambda r: rules_v2(r, gap_threshold)
    return {
        SCORE: (df["accuracy"] < 0.75).astype(int),
        V1: label_with(df, rules_v1, "high"),
        "Rules v1: 'needs support' or 'check-in'": label_with(df, rules_v1, "medium"),
        V2: label_with(df, v2, "high"),
        V2_CHECK: label_with(df, v2, "medium"),
        "Random Forest (trained on v1 rule labels)": systems["rf_pseudo"].predict(df[FEATURES]),
        ORACLE: systems["rf_oracle"].predict(df[FEATURES]),
    }


def classroom_counts(sessions, model):
    pred, truth = sessions[model].astype(bool), sessions["at_risk"].astype(bool)
    counts = pd.DataFrame(dict(
        tp=pred & truth, fp=pred & ~truth, fn=~pred & truth, tn=~pred & ~truth,
    )).astype(int)
    return counts.groupby(sessions["classroom"]).sum()


def metrics_from_counts(c):
    """Same definitions as metrics(), vectorised over classrooms. Undefined
    ratios (e.g. recall in a classroom with no at-risk learners) are NaN and
    are skipped when averaging, as before."""
    with np.errstate(invalid="ignore", divide="ignore"):
        return pd.DataFrame(dict(
            precision=c.tp / (c.tp + c.fp),
            recall=c.tp / (c.tp + c.fn),
            false_alarm_rate=c.fp / (c.fp + c.tn),
            accuracy=(c.tp + c.tn) / c.sum(axis=1),
        ))


def evaluate(alpha, systems, seed=TEST_SEED, n_passages=1, personas=None,
             class_size=CLASS_SIZE, gap_pooled=GAP_POOLED):
    """Per-classroom metrics, share of each persona flagged, and the
    learner-level frame with every model's flags (used for the bootstrap)."""
    rng_seed = seed + int(alpha * 1000)
    sessions = generate_sessions(N_TEST_CLASSROOMS * class_size, rng_seed, alpha, n_passages, personas)
    sessions["classroom"] = np.repeat(np.arange(N_TEST_CLASSROOMS), class_size)
    preds = predictions(sessions, systems, GAP_ONE if n_passages == 1 else gap_pooled)
    per_class, per_persona = [], []
    for model, pred in preds.items():
        sessions[model] = np.asarray(pred).astype(int)
        c = classroom_counts(sessions, model)
        m = metrics_from_counts(c)
        m["model"], m["classroom"], m["alpha"] = model, c.index, alpha
        m["flagged"], m["at_risk"] = c.tp + c.fp, c.tp + c.fn
        per_class.append(m.reset_index(drop=True))
        for persona, g in sessions.groupby("persona"):
            per_persona.append(dict(model=model, persona=persona, alpha=alpha,
                                    flagged_share=g[model].mean()))
    return pd.concat(per_class, ignore_index=True), pd.DataFrame(per_persona), sessions


def summarise(per_class):
    g = per_class.groupby("model", sort=False)
    out = g[["precision", "recall", "false_alarm_rate", "accuracy", "flagged", "at_risk"]].mean()
    sem = g[["recall", "precision", "at_risk"]].sem()
    out["recall_se"] = sem["recall"]
    out["precision_se"] = sem["precision"]
    out["at_risk_se"] = sem["at_risk"]
    return out


def bootstrap_ci(sessions, models, persona="poor_comprehender"):
    """95% percentile intervals from resampling the test classrooms with
    replacement. Covers precision, recall, false alarms (classroom means, as
    in the tables) and the share of one persona flagged (pooled)."""
    rng = np.random.default_rng(BOOT_SEED)
    classrooms = np.sort(sessions["classroom"].unique())
    idx = rng.integers(0, len(classrooms), size=(N_BOOT, len(classrooms)))
    is_p = sessions["persona"].eq(persona)
    p_n = is_p.groupby(sessions["classroom"]).sum().reindex(classrooms).to_numpy()
    rows = []
    for model in models:
        m = metrics_from_counts(classroom_counts(sessions, model).reindex(classrooms))
        p_f = (sessions[model].astype(bool) & is_p).groupby(sessions["classroom"]).sum()
        p_f = p_f.reindex(classrooms).to_numpy()
        boot = dict(
            precision=np.nanmean(m["precision"].to_numpy()[idx], axis=1),
            recall=np.nanmean(m["recall"].to_numpy()[idx], axis=1),
            false_alarm_rate=np.nanmean(m["false_alarm_rate"].to_numpy()[idx], axis=1),
            hidden_group_flagged=p_f[idx].sum(axis=1) / p_n[idx].sum(axis=1),
        )
        row = dict(model=model)
        for name, values in boot.items():
            row[f"{name}_ci_lo"], row[f"{name}_ci_hi"] = np.percentile(values, [2.5, 97.5])
        rows.append(row)
    return pd.DataFrame(rows).set_index("model")


def run(scenario, setting, n_passages=1, personas=None, alpha=1.0, class_size=CLASS_SIZE,
        train_seed=TRAIN_SEED, test_seed=TEST_SEED, gap_pooled=GAP_POOLED, systems=None):
    """Train (unless systems are given) and evaluate one scenario. Returns one
    row per model with point estimates and 95% CIs, plus the raw pieces."""
    if systems is None:
        systems = build_systems(generate_sessions(N_TRAIN_SESSIONS, train_seed, 1.0, n_passages, personas))
    per_class, per_persona, sessions = evaluate(alpha, systems, test_seed, n_passages,
                                                personas, class_size, gap_pooled)
    s = summarise(per_class)
    pc = per_persona[per_persona["persona"] == "poor_comprehender"].set_index("model")["flagged_share"]
    s["hidden_group_flagged"] = pc
    s = s.join(bootstrap_ci(sessions, list(s.index)))
    s.insert(0, "passages", n_passages)
    s.insert(0, "setting", setting)
    s.insert(0, "scenario", scenario)
    return s.reset_index(), dict(per_class=per_class, per_persona=per_persona, systems=systems)


def export_learner_level(systems, n_passages=1, path=None, personas=None):
    """Write one row per simulated learner (the test classrooms) so the data
    behind every figure can be inspected or re-analysed. Columns: classroom,
    learner, persona, at_risk, the session features (same names as the app's
    CSV export), and each model's 0/1 flag."""
    df = generate_sessions(N_TEST_CLASSROOMS * CLASS_SIZE, TEST_SEED + 1000, 1.0, n_passages, personas)
    df.insert(0, "learner", np.tile(np.arange(1, CLASS_SIZE + 1), N_TEST_CLASSROOMS))
    df.insert(0, "classroom", np.repeat(np.arange(1, N_TEST_CLASSROOMS + 1), CLASS_SIZE))
    preds = predictions(df, systems, GAP_ONE if n_passages == 1 else GAP_POOLED)
    for model, pred in preds.items():
        df["flag: " + model] = np.asarray(pred).astype(int)
    path = path or f"{OUT_DIR}/simulated_learners_{n_passages}_passage.csv"
    df.round(3).to_csv(path, index=False)
    print(f"Wrote {len(df)} learner rows to {path}")
    return df


def poster_numbers(main, timing_neutral, seeds):
    """Every headline number with its 95% bootstrap CI and the range across
    independent seed pairs. The figure scripts read only this file."""
    rows = []

    def add(key, label, frame, model, passages, column, scale=1.0):
        r = frame[(frame["model"] == model) & (frame["passages"] == passages)].iloc[0]
        lo_col = f"{column}_ci_lo" if f"{column}_ci_lo" in r else None
        sd = seeds[(seeds["model"] == model) & (seeds["passages"] == passages)
                   & (seeds["scenario"] == r["scenario"])][column]
        rows.append(dict(
            key=key, label=label, scenario=r["scenario"], model=model, passages=passages,
            value=r[column] * scale,
            ci_lo=r[lo_col] * scale if lo_col else np.nan,
            ci_hi=r[f"{column}_ci_hi"] * scale if lo_col else np.nan,
            seed_min=sd.min() * scale if len(sd) else np.nan,
            seed_max=sd.max() * scale if len(sd) else np.nan,
        ))

    r = main[(main["model"] == V2) & (main["passages"] == 1)].iloc[0]
    rows.append(dict(key="at_risk_per_30", label="At-risk learners per class of 30",
                     scenario="main", model="", passages=1, value=r["at_risk"],
                     ci_lo=r["at_risk"] - 1.96 * r["at_risk_se"],
                     ci_hi=r["at_risk"] + 1.96 * r["at_risk_se"], seed_min=np.nan, seed_max=np.nan))
    for tag, model in (("score", SCORE), ("v1", V1), ("v2", V2), ("v2_checkin", V2_CHECK), ("oracle", ORACLE)):
        for n in (1, 3):
            add(f"recall_{tag}_{n}p", f"Recall, {model}, {n} passage(s)", main, model, n, "recall")
            add(f"hidden_{tag}_{n}p", f"Poor comprehenders flagged, {model}, {n} passage(s)",
                main, model, n, "hidden_group_flagged")
            add(f"hidden_tn_{tag}_{n}p", f"Poor comprehenders flagged, timing-neutral, {model}, {n} passage(s)",
                timing_neutral, model, n, "hidden_group_flagged")
            add(f"false_alarm_{tag}_{n}p", f"False-alarm rate, {model}, {n} passage(s)",
                main, model, n, "false_alarm_rate")
    # "Catches about X of 7": recall times the at-risk learners per class.
    at_risk = r["at_risk"]
    for tag, model in (("v1", V1), ("v2", V2), ("oracle", ORACLE)):
        add(f"caught_of_class_{tag}_1p", f"At-risk learners caught per class of 30, {model}",
            main, model, 1, "recall", scale=at_risk)
    # Timing-neutral versions of the overall numbers, so every headline number
    # can come from the same (conservative) scenario.
    tn_at_risk = timing_neutral[(timing_neutral["model"] == V2) & (timing_neutral["passages"] == 1)].iloc[0]["at_risk"]
    for tag, model in (("score", SCORE), ("v1", V1), ("v2", V2), ("v2_checkin", V2_CHECK), ("oracle", ORACLE)):
        for n in (1, 3):
            add(f"recall_tn_{tag}_{n}p", f"Recall, timing-neutral, {model}, {n} passage(s)",
                timing_neutral, model, n, "recall")
            add(f"false_alarm_tn_{tag}_{n}p", f"False-alarm rate, timing-neutral, {model}, {n} passage(s)",
                timing_neutral, model, n, "false_alarm_rate")
            add(f"precision_tn_{tag}_{n}p", f"Precision, timing-neutral, {model}, {n} passage(s)",
                timing_neutral, model, n, "precision")
        add(f"caught_of_class_tn_{tag}_1p", f"At-risk caught per class of 30, timing-neutral, {model}",
            timing_neutral, model, 1, "recall", scale=tn_at_risk)
    return pd.DataFrame(rows)


if __name__ == "__main__":
    pd.set_option("display.width", 200)
    pd.set_option("display.max_columns", 30)
    quick = "--quick" in sys.argv
    TN = timing_neutral_personas()

    # --- Main result and timing-neutral check, 1 vs 3 passages -------------
    main_rows, tn_rows, systems_by = [], [], {}
    for n_pass in (1, 3):
        rows, extra = run("main", "as defined", n_pass)
        main_rows.append(rows)
        systems_by[("main", n_pass)] = extra["systems"]
        if n_pass == 1:
            per_class, per_persona = extra["per_class"], extra["per_persona"]
        rows, extra = run("timing_neutral", "poor-comprehender timing/hints/revisits = typical", n_pass, TN)
        tn_rows.append(rows)
        systems_by[("timing_neutral", n_pass)] = extra["systems"]
    main_all, tn_all = pd.concat(main_rows), pd.concat(tn_rows)

    export_learner_level(systems_by[("main", 1)], 1)
    export_learner_level(systems_by[("main", 3)], 3)
    export_learner_level(systems_by[("timing_neutral", 1)], 1,
                         f"{OUT_DIR}/simulated_learners_1_passage_timing_neutral.csv", TN)

    main = main_all[main_all["passages"] == 1].set_index("model")
    main.round(3).to_csv(f"{OUT_DIR}/table_model_comparison.csv")
    print("\n=== Main comparison: 200 simulated classrooms x 30 learners, held-out seed ===")
    print(main[["precision", "recall", "recall_ci_lo", "recall_ci_hi", "false_alarm_rate",
                "flagged", "at_risk"]].round(3))

    pp = per_persona.pivot(index="model", columns="persona", values="flagged_share")
    pp = pp[PERSONA_NAMES].loc[main.index]
    pp.round(3).to_csv(f"{OUT_DIR}/table_share_flagged_by_persona.csv")
    print("\n=== Share of each learner type flagged ===")
    print("(at-risk types: poor_comprehender, decoding_limited, mixed; the rest are false alarms)")
    print(pp.round(3))

    more = main_all[["model", "passages", "precision", "recall", "false_alarm_rate",
                     "recall_ci_lo", "recall_ci_hi"]]
    more.round(3).to_csv(f"{OUT_DIR}/table_more_data.csv", index=False)
    print("\n=== More data per learner: recall, 1 passage vs 3 pooled ===")
    print(more.pivot(index="model", columns="passages", values=["recall", "false_alarm_rate"])
          .loc[main.index].round(3))

    hidden = pd.concat([main_all, tn_all])[[
        "scenario", "model", "passages", "hidden_group_flagged",
        "hidden_group_flagged_ci_lo", "hidden_group_flagged_ci_hi", "recall", "false_alarm_rate"]]
    hidden.round(3).to_csv(f"{OUT_DIR}/table_timing_neutral.csv", index=False)
    print("\n=== Hidden group (poor comprehenders) flagged: as defined vs timing-neutral ===")
    print(hidden.pivot(index="model", columns=["scenario", "passages"], values="hidden_group_flagged")
          .loc[main.index].round(3))

    # --- Sensitivity runs ---------------------------------------------------
    sens = [main_all, tn_all]
    for share in (0.05, 0.15):
        for n_pass in (1, 3):
            sens.append(run("poor_comprehender_share", f"{share:.2f}", n_pass,
                            with_poor_comprehender_share(share))[0])
    for alpha in (0.75, 0.5):
        for n_pass in (1, 3):
            sens.append(run("persona_difference_alpha", f"{alpha}", n_pass, alpha=alpha,
                            systems=systems_by[("main", n_pass)])[0])
    sens.append(run("class_size", "20", 1, class_size=20, systems=systems_by[("main", 1)])[0])
    for scen, personas in (("main", None), ("timing_neutral", TN)):
        sens.append(run("pooled_gap_threshold_posthoc", f"0.33 ({scen})", 3, personas,
                        gap_pooled=0.33, systems=systems_by[(scen, 3)])[0])
    sensitivity = pd.concat(sens, ignore_index=True)
    sensitivity.round(3).to_csv(f"{OUT_DIR}/table_sensitivity.csv", index=False)
    print("\n=== Sensitivity: recall and hidden-group share flagged (key models) ===")
    key = sensitivity[sensitivity["model"].isin([SCORE, V2, ORACLE])]
    print(key.pivot_table(index=["scenario", "setting", "passages"], columns="model",
                          values=["recall", "hidden_group_flagged"]).round(3))

    rob = sensitivity[sensitivity["passages"].eq(1) & (
        sensitivity["scenario"].eq("persona_difference_alpha") | sensitivity["scenario"].eq("main"))].copy()
    rob["alpha"] = rob["setting"].replace({"as defined": "1.0"}).astype(float)
    rob[["model", "precision", "recall", "false_alarm_rate", "alpha"]].round(3).to_csv(
        f"{OUT_DIR}/table_robustness.csv", index=False)

    # --- Seed replication -----------------------------------------------------
    seed_rows = [main_all.assign(seed_pair=0), tn_all.assign(seed_pair=0)]
    if not quick:
        print(f"\nReplicating headline runs on {N_SEED_REPS - 1} more seed pairs...")
        for k in range(1, N_SEED_REPS):
            for scen, personas in (("main", None), ("timing_neutral", TN)):
                for n_pass in (1, 3):
                    rows, _ = run(scen, "seed replication", n_pass, personas,
                                  train_seed=TRAIN_SEED + 10_000 * k, test_seed=TEST_SEED + 10_000 * k)
                    seed_rows.append(rows.assign(seed_pair=k))
    seeds = pd.concat(seed_rows, ignore_index=True)
    seeds[["seed_pair", "scenario", "passages", "model", "precision", "recall", "false_alarm_rate",
           "hidden_group_flagged"]].round(3).to_csv(f"{OUT_DIR}/table_seed_replication.csv", index=False)
    print("\n=== Seed replication: min-max across seed pairs ===")
    print(seeds[seeds["model"].isin([V1, V2, ORACLE, SCORE])].groupby(["scenario", "passages", "model"])
          [["recall", "hidden_group_flagged"]].agg(["min", "max"]).round(3))

    # --- Headline numbers ----------------------------------------------------
    poster = poster_numbers(main_all, tn_all, seeds)
    poster.round(4).to_csv(f"{OUT_DIR}/poster_numbers.csv", index=False)
    print(f"\nWrote {len(poster)} headline numbers (value, 95% CI, seed range) to {OUT_DIR}/poster_numbers.csv")

    # --- Feature importance --------------------------------------------------
    # Feature importance reflects the persona assumptions and rule thresholds;
    # it does not validate the features.
    for name, key_ in (("oracle", "rf_oracle"), ("pseudo", "rf_pseudo")):
        imp = pd.Series(systems_by[("main", 1)][key_].feature_importances_, index=FEATURES)
        imp.sort_values(ascending=False).to_csv(f"{OUT_DIR}/{name}_feature_importance.csv", header=["importance"])

    wide = per_class.pivot(index="classroom", columns="model", values="recall")
    print(f"\nOracle recall > Rules v2 recall in {(wide[ORACLE] > wide[V2]).sum()} of {len(wide)} classrooms")
    print(f"Rules v2 recall > Rules v1 recall in {(wide[V2] > wide[V1]).sum()} of {len(wide)} classrooms "
          f"(ties: {(wide[V2] == wide[V1]).sum()})")
    print(f"\nAll tables written to ./{OUT_DIR}/")
