import { computeSessionMetrics } from "@/features/analytics/recommendationEngine";
import { allQuestions } from "@/features/student/activityContent";
import type {
  ActivityResult,
  QuestionResponse,
} from "@/shared/types/activity";

/**
 * CSV export of collected activity data.
 *
 * Session-level columns deliberately use the SAME names as the Python
 * simulation (simulated_classroom_evaluation_v2.py -> simulated_learners_*.csv),
 * so real data can be dropped into the same analysis and models later.
 * Student names are left out on purpose: rows carry the student ID only.
 */

const questionTypeById = new Map(
  allQuestions.map((question) => [question.id, question.type]),
);

type Cell = string | number | boolean | null | undefined;

function escapeCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(header: string[], rows: Cell[][]): string {
  return [header, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");
}

const round = (value: number | null, places = 3) =>
  value === null ? "" : Number(value.toFixed(places));

const mean = (values: number[]) =>
  values.length === 0
    ? 0
    : values.reduce((total, value) => total + value, 0) / values.length;

const severityRank = { low: 1, medium: 2, high: 3 } as const;

function questions(result: ActivityResult): QuestionResponse[] {
  return Array.isArray(result.response.questionResponses)
    ? result.response.questionResponses
    : [];
}

/** One row per completed session (one learner on one passage). */
export function buildSessionCsv(results: ActivityResult[]): string {
  const header = [
    "session_id", "student_id", "class_id", "activity_id", "submitted_at",
    "accuracy", "literal_acc", "inferential_acc", "gap", "bias", "oc_err_rate",
    "accurate_est", "pre_hints", "total_hints", "changes", "revisits",
    "avg_first", "avg_qtime", "repairs", "low_conf", "difficulty", "total_time",
    "top_severity", "indicator_ids",
  ];

  const rows = results.map((result) => {
    const qs = questions(result);
    const metrics = computeSessionMetrics(qs);
    const accuracy = qs.length === 0 ? 0 : qs.filter((q) => q.isCorrect).length / qs.length;
    const gap =
      metrics.literalAccuracy !== null && metrics.inferentialAccuracy !== null
        ? metrics.literalAccuracy - metrics.inferentialAccuracy
        : null;
    const indicators = result.recommendation?.indicators ?? [];
    const top = indicators.reduce<string>(
      (best, indicator) =>
        !best || severityRank[indicator.severity] > severityRank[best as keyof typeof severityRank]
          ? indicator.severity
          : best,
      "",
    );

    return [
      result.response.id,
      result.response.studentId ?? "",
      result.response.classId ?? "",
      result.response.activityId,
      result.response.submittedAt,
      round(accuracy),
      round(metrics.literalAccuracy),
      round(metrics.inferentialAccuracy),
      round(gap),
      round(metrics.biasScore),
      round(metrics.overconfidentErrorRate),
      metrics.accurateEstimationCount,
      metrics.preAttemptHintCount,
      qs.reduce((total, q) => total + q.hintCount, 0),
      qs.reduce((total, q) => total + q.answerChangeCount, 0),
      qs.reduce((total, q) => total + q.passageRevisitCount, 0),
      round(mean(qs.map((q) => q.firstInteractionSeconds).filter((v): v is number => v !== null)), 1),
      round(mean(qs.map((q) => q.questionTimeSeconds)), 1),
      metrics.repairAttemptCount,
      qs.filter((q) => q.confidence <= 2).length,
      result.response.perceivedDifficulty,
      result.response.timeOnTaskSeconds,
      top,
      indicators.map((indicator) => indicator.id).join(";"),
    ];
  });

  return toCsv(header, rows);
}

/** One row per question answered, for finer-grained analysis. */
export function buildQuestionCsv(results: ActivityResult[]): string {
  const header = [
    "session_id", "student_id", "class_id", "activity_id", "question_id",
    "question_type", "is_correct", "confidence", "judged_correct", "hint_count",
    "hint_before_attempt", "answer_changes", "first_interaction_seconds",
    "question_time_seconds", "passage_revisits", "repair_attempted",
  ];

  const rows = results.flatMap((result) =>
    questions(result).map((q) => [
      result.response.id,
      result.response.studentId ?? "",
      result.response.classId ?? "",
      result.response.activityId,
      q.questionId,
      questionTypeById.get(q.questionId) ?? "",
      q.isCorrect ? 1 : 0,
      q.confidence,
      q.judgedCorrect,
      q.hintCount,
      q.hintRequestedBeforeAttempt ? 1 : 0,
      q.answerChangeCount,
      q.firstInteractionSeconds,
      q.questionTimeSeconds,
      q.passageRevisitCount,
      q.repairAttempted ? 1 : 0,
    ]),
  );

  return toCsv(header, rows);
}

/** Triggers a browser download. A BOM is added so Excel reads UTF-8 correctly. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
