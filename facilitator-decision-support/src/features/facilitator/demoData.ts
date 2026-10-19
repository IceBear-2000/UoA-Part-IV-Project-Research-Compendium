import { generateRecommendation } from "@/features/analytics/recommendationEngine";
import { literacyActivities } from "@/features/student/activityContent";
import { replaceActivityResultsWithPrefix } from "@/shared/storage/activityResults";
import { addRosterEntries } from "@/shared/storage/roster";
import type {
  ActivityResult,
  ConfidenceLevel,
  DifficultyLevel,
  JudgedCorrectness,
  QuestionResponse,
  StudentResponse,
} from "@/shared/types/activity";

/**
 * Demo data for screenshots and walkthroughs. Seven anonymous learners whose
 * sessions follow the reader profiles used in the simulated evaluation. Every
 * recommendation is produced by the real engine, so the dashboard shows what
 * the rules actually output for these sessions.
 */

const DEMO_PREFIX = "demo-";
const DEMO_CLASS = { id: "demo-class", name: "Demo Reading Group", createdAt: "2026-10-01T00:00:00.000Z" };

type DemoAnswer = {
  correct: boolean;
  judged: JudgedCorrectness;
  confidence: ConfidenceLevel;
  firstSeconds?: number;
  questionSeconds?: number;
  hintBeforeAttempt?: boolean;
  hints?: number;
  changes?: number;
  revisits?: number;
  repaired?: boolean;
};

type DemoSession = {
  answers: [DemoAnswer, DemoAnswer, DemoAnswer, DemoAnswer]; // 2 literal, then 2 inferential
  difficulty: DifficultyLevel;
  readingSeconds: number;
};

const sure = (correct: boolean, judged: JudgedCorrectness = correct ? "correct" : "incorrect"): DemoAnswer => ({
  correct,
  judged,
  confidence: correct ? 4 : 3,
});

// Literal 100%, inferential 50%, and the wrong answer judged "correct" —
// the fluent-but-poor-comprehender pattern.
const inferenceGapSession: DemoSession = {
  answers: [
    { ...sure(true), firstSeconds: 6, questionSeconds: 18 },
    { ...sure(true), firstSeconds: 5, questionSeconds: 16 },
    { correct: false, judged: "correct", confidence: 4, firstSeconds: 6, questionSeconds: 19 },
    { ...sure(true), firstSeconds: 7, questionSeconds: 22 },
  ],
  difficulty: 1,
  readingSeconds: 48,
};

const typicalSession: DemoSession = {
  answers: [sure(true), sure(true), sure(true), { ...sure(false, "unsure"), confidence: 2 }],
  difficulty: 2,
  readingSeconds: 62,
};

const learners: Array<{ id: string; name: string; sessions: DemoSession[] }> = [
  { id: "demo-learner-a", name: "Learner A", sessions: [inferenceGapSession, inferenceGapSession, inferenceGapSession] },
  {
    id: "demo-learner-b",
    name: "Learner B",
    sessions: [
      { answers: [sure(true), sure(true), sure(true), sure(true)], difficulty: 1, readingSeconds: 58 },
      typicalSession,
    ],
  },
  {
    // Slow, effortful, aware of difficulty (decoding-limited profile).
    id: "demo-learner-c",
    name: "Learner C",
    sessions: [
      {
        answers: [
          { correct: true, judged: "unsure", confidence: 2, firstSeconds: 26, questionSeconds: 80, hintBeforeAttempt: true, hints: 1, revisits: 1 },
          { correct: false, judged: "incorrect", confidence: 1, firstSeconds: 31, questionSeconds: 88, hints: 1, revisits: 1, changes: 1 },
          { correct: false, judged: "incorrect", confidence: 1, firstSeconds: 28, questionSeconds: 76, hintBeforeAttempt: true, hints: 1, revisits: 1, repaired: true },
          { correct: true, judged: "unsure", confidence: 2, firstSeconds: 22, questionSeconds: 70, changes: 1 },
        ],
        difficulty: 3,
        readingSeconds: 125,
      },
    ],
  },
  {
    // Careful reviser: rereads and revises, ends up accurate.
    id: "demo-learner-d",
    name: "Learner D",
    sessions: [
      {
        answers: [
          { ...sure(true), firstSeconds: 12, questionSeconds: 40, changes: 1 },
          { ...sure(true), firstSeconds: 11, questionSeconds: 38, hints: 1, revisits: 1, repaired: true },
          { ...sure(true), firstSeconds: 14, questionSeconds: 45, changes: 1 },
          { ...sure(true), firstSeconds: 13, questionSeconds: 42 },
        ],
        difficulty: 2,
        readingSeconds: 72,
      },
    ],
  },
  {
    // Weaker on both types and sure of wrong answers: worth a check-in.
    id: "demo-learner-e",
    name: "Learner E",
    sessions: [
      {
        answers: [
          sure(true),
          { correct: false, judged: "correct", confidence: 4 },
          { correct: false, judged: "correct", confidence: 3 },
          sure(true),
        ],
        difficulty: 2,
        readingSeconds: 55,
      },
    ],
  },
  { id: "demo-learner-f", name: "Learner F", sessions: [typicalSession, { answers: [sure(true), sure(true), sure(true), sure(true)], difficulty: 1, readingSeconds: 60 }] },
  { id: "demo-learner-g", name: "Learner G", sessions: [typicalSession] },
];

function buildResponse(
  learner: { id: string; name: string },
  session: DemoSession,
  index: number,
  submittedAt: Date,
): StudentResponse {
  const activity = literacyActivities[index % literacyActivities.length];
  const questionResponses: QuestionResponse[] = activity.questions.map((question, q) => {
    const answer = session.answers[q];
    return {
      questionId: question.id,
      selectedAnswer: answer.correct
        ? question.correctAnswer
        : question.answers.find((option) => option !== question.correctAnswer) ?? "",
      isCorrect: answer.correct,
      confidence: answer.confidence,
      judgedCorrect: answer.judged,
      hintCount: answer.hints ?? (answer.hintBeforeAttempt ? 1 : 0),
      hintRequestedBeforeAttempt: answer.hintBeforeAttempt ?? false,
      answerChangeCount: answer.changes ?? 0,
      firstInteractionSeconds: answer.firstSeconds ?? 9,
      questionTimeSeconds: answer.questionSeconds ?? 30,
      passageRevisitCount: answer.revisits ?? 0,
      repairAttempted: answer.repaired ?? false,
    };
  });
  const questionSeconds = questionResponses.reduce((total, q) => total + q.questionTimeSeconds, 0);
  const meanConfidence = Math.round(
    questionResponses.reduce((total, q) => total + q.confidence, 0) / questionResponses.length,
  ) as ConfidenceLevel;

  return {
    id: `${DEMO_PREFIX}${learner.id}-${index + 1}`,
    studentId: learner.id,
    studentName: learner.name,
    classId: DEMO_CLASS.id,
    className: DEMO_CLASS.name,
    activityId: activity.id,
    readingTimeSeconds: session.readingSeconds,
    timeOnTaskSeconds: session.readingSeconds + questionSeconds + 20,
    questionResponses,
    perceivedDifficulty: session.difficulty,
    overallConfidence: meanConfidence,
    completed: true,
    submittedAt: submittedAt.toISOString(),
  };
}

/** Writes the demo class, learners and sessions to localStorage, replacing any
 * earlier demo sessions and leaving real ones alone. Returns the class id. */
export function loadDemoData(now = new Date()): string {
  const results: ActivityResult[] = [];

  learners.forEach((learner, learnerIndex) => {
    const prior: StudentResponse[] = []; // newest first, as the app passes them
    learner.sessions.forEach((session, index) => {
      // One session per school day, most recent yesterday.
      const daysAgo = learner.sessions.length - index;
      const submittedAt = new Date(now.getTime() - daysAgo * 86_400_000 - learnerIndex * 600_000);
      const response = buildResponse(learner, session, index, submittedAt);
      results.push({ response, recommendation: generateRecommendation(response, prior) });
      prior.unshift(response);
    });
  });

  results.sort((a, b) => b.response.submittedAt.localeCompare(a.response.submittedAt));
  addRosterEntries(
    [DEMO_CLASS],
    learners.map((learner) => ({
      id: learner.id,
      name: learner.name,
      classId: DEMO_CLASS.id,
      createdAt: DEMO_CLASS.createdAt,
    })),
  );
  replaceActivityResultsWithPrefix(DEMO_PREFIX, results);
  return DEMO_CLASS.id;
}
