import { allQuestions, getActivityById } from "@/features/student/activityContent";
import type {
  ActivityResult,
  ClassPatternAlert,
  FacilitatorRecommendation,
  QuestionResponse,
  StudentResponse,
  SupportIndicator,
} from "@/shared/types/activity";

const questionTypeById = new Map(
  allQuestions.map((question) => [question.id, question.type]),
);

// Maps a postdictive judgment to a numeric value on the same 0-1 scale as
// actual correctness, so the two can be compared directly.
function judgmentToValue(judgedCorrect: QuestionResponse["judgedCorrect"]) {
  if (judgedCorrect === "correct") return 1;
  if (judgedCorrect === "incorrect") return 0;
  return 0.5; // "unsure"
}

/**
 * Shared session-level metrics, exported so both the recommendation engine
 * and the facilitator dashboard compute these the same way rather than
 * duplicating the logic in two places.
 */
export function computeSessionMetrics(questionResponses: QuestionResponse[]) {
  const literalResponses = questionResponses.filter(
    (question) => questionTypeById.get(question.questionId) === "literal",
  );
  const inferentialResponses = questionResponses.filter(
    (question) => questionTypeById.get(question.questionId) === "inferential",
  );

  const accuracyOf = (responses: QuestionResponse[]) =>
    responses.length === 0
      ? null
      : responses.filter((question) => question.isCorrect).length /
        responses.length;

  // Bias score: mean(judged accuracy - actual accuracy). Positive means
  // overconfident, negative means underconfident, near zero is well
  // calibrated. Mirrors the postdictive-judgment methodology used in
  // metacognitive-monitoring research with this age group.
  const biasScore =
    questionResponses.length === 0
      ? 0
      : questionResponses.reduce(
          (total, question) =>
            total +
            (judgmentToValue(question.judgedCorrect) -
              (question.isCorrect ? 1 : 0)),
          0,
        ) / questionResponses.length;

  const accurateEstimationCount = questionResponses.filter(
    (question) =>
      (question.judgedCorrect === "correct" && question.isCorrect) ||
      (question.judgedCorrect === "incorrect" && !question.isCorrect),
  ).length;

  const preAttemptHintCount = questionResponses.filter(
    (question) => question.hintRequestedBeforeAttempt,
  ).length;

  const repairAttemptCount = questionResponses.filter(
    (question) => question.repairAttempted,
  ).length;

  // Overconfidence on errors: of the answers that were wrong, the share the
  // learner judged "correct". Unlike the bias score this is not diluted as
  // more correct answers are added, so it stays comparable across 4 and 12
  // questions. Same definition as oc_err_rate in the Python evaluation.
  const wrongResponses = questionResponses.filter((question) => !question.isCorrect);
  const overconfidentErrorRate =
    wrongResponses.length === 0
      ? 0
      : wrongResponses.filter((question) => question.judgedCorrect === "correct")
          .length / wrongResponses.length;

  return {
    literalAccuracy: accuracyOf(literalResponses),
    inferentialAccuracy: accuracyOf(inferentialResponses),
    biasScore,
    accurateEstimationCount,
    preAttemptHintCount,
    repairAttemptCount,
    overconfidentErrorRate,
  };
}

const secondsToLabel = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
};

function getQuestionResponses(response: StudentResponse): QuestionResponse[] {
  return Array.isArray(response.questionResponses) ? response.questionResponses : [];
}


// Rules v2. Each threshold below mirrors rules_v2() in
// evaluation/simulated_classroom_evaluation_v2.py, so the highest severity
// this function returns is what the simulated evaluation measured: "high" is
// "Needs support", "medium" is "Worth a check-in". Indicators that rules_v2()
// does not use (hint use, self-correction, extended time) are kept as "low"
// notes so they add context without changing a learner's status.
// The thresholds are starting defaults chosen for this prototype, not
// literature-validated cut-offs.
const GAP_THRESHOLD_ONE_PASSAGE = 0.5; // 2 literal + 2 inferential: steps of 0.5
const GAP_THRESHOLD_POOLED = 0.34; // 3 passages pooled: finer steps, less noise
const PASSAGES_TO_POOL = 3;

/**
 * @param priorResponses earlier sessions from the same student, newest
 * first. Up to two are pooled with the current session for the
 * comprehension-pattern check, which is the signal that benefits most from
 * more questions per learner.
 */
export function generateRecommendation(
  response: StudentResponse,
  priorResponses: StudentResponse[] = [],
): FacilitatorRecommendation {
  const indicators: SupportIndicator[] = [];
  const questionResponses = getQuestionResponses(response);
  const correctCount = questionResponses.filter((question) => question.isCorrect).length;
  const accuracy =
    questionResponses.length === 0 ? 0 : correctCount / questionResponses.length;
  const totalHints = questionResponses.reduce(
    (total, question) => total + question.hintCount,
    0,
  );
  const totalAnswerChanges = questionResponses.reduce(
    (total, question) => total + question.answerChangeCount,
    0,
  );
  const totalPassageRevisits = questionResponses.reduce(
    (total, question) => total + question.passageRevisitCount,
    0,
  );
  const averageFirstInteractionSeconds = average(
    questionResponses
      .map((question) => question.firstInteractionSeconds)
      .filter((value): value is number => value !== null),
  );
  const averageQuestionTimeSeconds = average(
    questionResponses.map((question) => question.questionTimeSeconds),
  );
  const lowConfidenceCount = questionResponses.filter(
    (question) => question.confidence <= 2,
  ).length;

  const { biasScore, accurateEstimationCount, preAttemptHintCount, repairAttemptCount } =
    computeSessionMetrics(questionResponses);

  // Processing difficulty needs TWO converging signals. Two pre-attempt hints
  // count as converging on their own, since pre-attempt hints are the
  // strongest single struggle signal in the hint-use research.
  const processingSignals =
    Number(averageFirstInteractionSeconds >= 20) +
    Number(totalPassageRevisits >= 2) +
    Number(averageQuestionTimeSeconds >= 75) +
    Number(totalAnswerChanges >= 3) +
    Number(preAttemptHintCount >= 1) +
    Number(preAttemptHintCount >= 2);
  const possibleTaskUnderstandingConcern = processingSignals >= 2;

  if (possibleTaskUnderstandingConcern) {
    const strongestSignal =
      preAttemptHintCount >= 1
        ? "Requesting a hint before attempting a question is one of the more reliable struggle signals in the research on hint use — it suggests the student didn't know how to start, rather than trying and getting stuck."
        : "Hesitating, rereading, or changing answers repeatedly often signals the student is unsure how to approach the question itself, separate from whether they know the content.";
    indicators.push({
      id: "task-processing",
      label: "Possible task-understanding concern",
      severity: accuracy >= 0.75 ? "medium" : "high",
      evidence: `${processingSignals} converging signals. First answer delay averaged ${secondsToLabel(
        Math.round(averageFirstInteractionSeconds),
      )}; passage revisits: ${totalPassageRevisits}; answer changes: ${totalAnswerChanges}; hints requested before an attempt: ${preAttemptHintCount}.`,
      interpretation: `${strongestSignal} Worth checking whether the student understood what the question was asking before assuming a content gap. (The delay/revisit thresholds are starting defaults, not literature-validated cut-offs — treat borderline cases with judgement.)`,
    });
  }

  if (accuracy < 1) {
    indicators.push({
      id: "accuracy",
      label: "Accuracy concern",
      severity: accuracy < 0.5 ? "high" : accuracy < 0.75 ? "medium" : "low",
      evidence: `${correctCount} of ${questionResponses.length} answers were correct.`,
      interpretation:
        "A raw accuracy score alone doesn't say what kind of difficulty this is. Check the literal vs. inferential breakdown to see whether the student struggles to locate stated details, to draw conclusions beyond them, or both. A single miss is shown as a low-level note only.",
    });
  }

  if (totalHints > 0) {
    indicators.push({
      id: "hint-use",
      label: "Hint used",
      severity: "low",
      evidence: `The student opened ${totalHints} hint${totalHints === 1 ? "" : "s"}.`,
      interpretation:
        "Hint use after a genuine attempt is a much weaker signal than requesting a hint before attempting — it can reflect appropriate help-seeking rather than struggle.",
    });
  }

  if (lowConfidenceCount >= 2) {
    indicators.push({
      id: "low-question-confidence",
      label: "Low answer confidence",
      severity: "medium",
      evidence: `${lowConfidenceCount} answers had confidence marked as not sure or guessing.`,
      interpretation:
        "Low confidence that matches low accuracy is often appropriate self-awareness, not a separate concern. It's more informative alongside the confidence indicators, which flag the opposite and more concerning pattern: high confidence paired with wrong answers.",
    });
  }

  if (response.perceivedDifficulty >= 3 && accuracy < 0.75) {
    indicators.push({
      id: "high-difficulty",
      label: "Learner found activity challenging",
      severity: "medium",
      evidence: `The learner marked the activity as challenging and answered ${correctCount} of ${questionResponses.length} correctly.`,
      interpretation:
        "This is the student's own self-report, backed here by lower accuracy. Worth weighing alongside the interaction-based indicators, since self-reported difficulty and measured performance don't always agree.",
    });
  }

  // Miscalibration alone stays medium: younger and poorer comprehenders are
  // overconfident, but so are some typical readers.
  if (biasScore >= 0.4) {
    indicators.push({
      id: "confidence-miscalibration",
      label: "Confidence may not match performance",
      severity: "medium",
      evidence: `The student judged ${accurateEstimationCount} of ${questionResponses.length} answers accurately after answering; overall they judged answers as correct more often than they were.`,
      interpretation:
        "Overconfidence specifically (judging wrong answers as correct) is the pattern research has linked to reading comprehension difficulties in this age group, more so than low confidence generally. It can mean the student isn't yet checking their understanding against the text.",
    });
  }

  // Comprehension pattern: literal clearly above inferential WITH at least
  // half of the wrong answers judged "correct". This is the profile of the
  // fluent-but-poor comprehender, the group teachers tend to miss (Nation et
  // al., 2004; Kelso et al., 2022). High only when both occur. Pooled over
  // the last three passages when available, since one passage gives only
  // two questions of each type.
  const pooledSessions = [response, ...priorResponses].slice(0, PASSAGES_TO_POOL);
  const isPooled = pooledSessions.length >= PASSAGES_TO_POOL;
  const patternQuestions = isPooled
    ? pooledSessions.flatMap(getQuestionResponses)
    : questionResponses;
  const pattern = computeSessionMetrics(patternQuestions);
  const gapThreshold = isPooled ? GAP_THRESHOLD_POOLED : GAP_THRESHOLD_ONE_PASSAGE;
  const comprehensionGap =
    pattern.literalAccuracy !== null && pattern.inferentialAccuracy !== null
      ? pattern.literalAccuracy - pattern.inferentialAccuracy
      : null;
  const hiddenComprehensionPattern =
    comprehensionGap !== null &&
    comprehensionGap >= gapThreshold &&
    pattern.overconfidentErrorRate >= 0.5;

  if (comprehensionGap !== null && comprehensionGap >= gapThreshold) {
    const wrongCount = patternQuestions.filter((question) => !question.isCorrect).length;
    const wrongJudgedCorrect = Math.round(pattern.overconfidentErrorRate * wrongCount);
    indicators.push({
      id: "inferential-gap",
      label: hiddenComprehensionPattern
        ? "Inference gap the learner may not notice"
        : "Inferential comprehension gap",
      severity: hiddenComprehensionPattern ? "high" : "low",
      evidence: `${isPooled ? `Across the last ${pooledSessions.length} passages, l` : "L"}iteral accuracy ${Math.round(
        (pattern.literalAccuracy ?? 0) * 100,
      )}% vs inferential ${Math.round(
        (pattern.inferentialAccuracy ?? 0) * 100,
      )}%. ${wrongJudgedCorrect} of ${wrongCount} wrong answer${wrongCount === 1 ? " was" : "s were"} judged "correct".`,
      interpretation:
        "Good detail-finding with weaker inference is documented as a distinct profile from general reading difficulty (a specific comprehension deficit). When the learner also believes their wrong answers are right, it is easy to miss in class. It usually needs explicit inference practice — discussing 'why' and 'how do you know' questions — rather than more basic reading practice.",
    });
  }

  if (repairAttemptCount > 0 && accuracy >= 0.75) {
    indicators.push({
      id: "self-correction",
      label: "Self-regulated recovery",
      severity: "low",
      evidence: `The student reread the passage or revised an answer after needing a hint on ${repairAttemptCount} question${
        repairAttemptCount === 1 ? "" : "s"
      }, and still finished with strong accuracy — a positive self-regulation sign, not a concern.`,
      interpretation:
        "Rereading or revising after a hint, rather than guessing and moving on, is an active comprehension-monitoring strategy. Most answer changes go from incorrect to correct, so revisions like these shouldn't be read as a red flag on their own.",
    });
  }

  if (response.timeOnTaskSeconds > 240) {
    indicators.push({
      id: "extended-time",
      label: "Extended time on task",
      severity: "low",
      evidence: `Total activity time was ${secondsToLabel(response.timeOnTaskSeconds)}.`,
      interpretation:
        "Taking notably longer can reflect careful, thorough work or difficulty — check alongside accuracy and the other indicators rather than on its own.",
    });
  }

  if (indicators.length === 0) {
    indicators.push({
      id: "secure-progress",
      label: "Secure progress",
      severity: "low",
      evidence: "The student completed the activity accurately with no major support signals.",
      interpretation:
        "No struggle, miscalibration, or comprehension-gap patterns were detected against the current rule set. This reflects the current rules' coverage, not a guarantee.",
    });
  }

  const possibleContentConcern = accuracy < 0.75;
  const possibleMiscalibrationConcern = biasScore >= 0.4;
  const possibleSelfEfficacyConcern =
    lowConfidenceCount >= 2 || (response.perceivedDifficulty >= 3 && accuracy < 0.75);

  return {
    id: crypto.randomUUID(),
    studentName: response.studentName,
    activityId: response.activityId,
    createdAt: response.submittedAt,
    indicators,
    summary: hiddenComprehensionPattern
      ? "Reads the details well but is finding inference harder, and may not notice when wrong."
      : possibleTaskUnderstandingConcern
        ? "Review how the student interpreted the task before reteaching content."
        : possibleContentConcern
          ? "Student may need content strategy support."
          : possibleMiscalibrationConcern
            ? "Student's confidence doesn't match their performance — worth a quick check-in."
            : possibleSelfEfficacyConcern
              ? "Student may benefit from confidence-building feedback."
              : "Student appears ready to continue.",
    action: hiddenComprehensionPattern
      ? 'Pick one inference question and ask "How do you know?" — have them point to the part of the passage that supports it.'
      : possibleTaskUnderstandingConcern
        ? "Ask the student to explain what the question was asking and how they decided where to look in the passage."
        : possibleContentConcern
          ? "Model using details from the passage to justify the main idea."
          : possibleMiscalibrationConcern
            ? "Ask the student to point to the part of the passage that supports their answer, to check whether their confidence is well founded."
            : possibleSelfEfficacyConcern
              ? "Give specific feedback on what the student did successfully, then offer a similar follow-up item."
              : "Offer the next reading activity.",
  };
}

const MIN_STUDENTS_FOR_CLASS_PATTERN = 3;
const CLASS_PATTERN_SHARE = 0.5;

/**
 * Patterns shared by several students on the same activity. Uses each
 * student's latest attempt at that activity. When half or more of the
 * students (and at least three) miss the same question, or show the same
 * inferential gap, the passage or question is a likelier cause than any one
 * learner.
 */
export function detectClassPatterns(results: ActivityResult[]): ClassPatternAlert[] {
  const latestByActivity = new Map<string, Map<string, ActivityResult>>();

  for (const result of results) {
    const studentKey = result.response.studentId ?? result.response.studentName;
    const byStudent =
      latestByActivity.get(result.response.activityId) ?? new Map<string, ActivityResult>();
    const existing = byStudent.get(studentKey);
    if (!existing || existing.response.submittedAt < result.response.submittedAt) {
      byStudent.set(studentKey, result);
    }
    latestByActivity.set(result.response.activityId, byStudent);
  }

  const alerts: ClassPatternAlert[] = [];

  for (const [activityId, byStudent] of latestByActivity) {
    const attempts = [...byStudent.values()];
    const totalStudents = attempts.length;
    if (totalStudents < MIN_STUDENTS_FOR_CLASS_PATTERN) continue;

    const isShared = (count: number) =>
      count >= MIN_STUDENTS_FOR_CLASS_PATTERN && count / totalStudents >= CLASS_PATTERN_SHARE;
    const activity = getActivityById(activityId);

    activity.questions.forEach((question, index) => {
      const missed = attempts.filter((attempt) =>
        getQuestionResponses(attempt.response).some(
          (answer) => answer.questionId === question.id && !answer.isCorrect,
        ),
      ).length;
      if (isShared(missed)) {
        alerts.push({
          id: `${activityId}:${question.id}`,
          activityId,
          kind: "question-missed",
          studentCount: missed,
          totalStudents,
          message: `${missed} of ${totalStudents} students missed question ${index + 1} (${question.type}) on "${activity.storyTitle}". Worth reviewing the question together before treating it as individual gaps.`,
        });
      }
    });

    const withGap = attempts.filter((attempt) => {
      const metrics = computeSessionMetrics(getQuestionResponses(attempt.response));
      return (
        metrics.literalAccuracy !== null &&
        metrics.inferentialAccuracy !== null &&
        metrics.literalAccuracy - metrics.inferentialAccuracy >= GAP_THRESHOLD_ONE_PASSAGE
      );
    }).length;
    if (isShared(withGap)) {
      alerts.push({
        id: `${activityId}:inferential-gap`,
        activityId,
        kind: "inferential-gap",
        studentCount: withGap,
        totalStudents,
        message: `${withGap} of ${totalStudents} students did clearly better on literal than inferential questions on "${activity.storyTitle}". A whole-class inference mini-lesson may help more than individual follow-up.`,
      });
    }
  }

  return alerts;
}
