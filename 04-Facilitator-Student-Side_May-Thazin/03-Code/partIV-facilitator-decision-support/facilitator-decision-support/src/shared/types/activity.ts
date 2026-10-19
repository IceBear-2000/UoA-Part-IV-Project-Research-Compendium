export type ConfidenceLevel = 1 | 2 | 3 | 4;
export type DifficultyLevel = 1 | 2 | 3;

// Literal and inferential comprehension are tracked separately rather than
// blended into one accuracy figure, so an inference gap stays visible.
export type QuestionType = "literal" | "inferential";

// Postdictive judgment: asked immediately after answering, "do you think
// you got that right?" This is a stronger metacognitive-calibration signal
// than a single upfront confidence rating, matching the design used in
// postdictive-judgment studies of primary-school comprehension monitoring.
export type JudgedCorrectness = "correct" | "incorrect" | "unsure";

export type QuestionResponse = {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  judgedCorrect: JudgedCorrectness;
  hintCount: number;
  // True if the learner requested a hint before making any answer attempt.
  // Research on unproductive hint use finds pre-attempt hints are a
  // stronger struggle signal than raw hint counts.
  hintRequestedBeforeAttempt: boolean;
  answerChangeCount: number;
  firstInteractionSeconds: number | null;
  questionTimeSeconds: number;
  passageRevisitCount: number;
  // True if, after a hint was requested, the learner went on to reread the
  // passage or revise their answer — an observable "repair" action
  // following a signal of difficulty, rather than raw counts in isolation.
  repairAttempted: boolean;
};

export type StudentResponse = {
  id: string;
  studentId?: string;
  studentName: string;
  classId?: string;
  className?: string;
  activityId: string;
  readingTimeSeconds: number;
  timeOnTaskSeconds: number;
  questionResponses: QuestionResponse[];
  perceivedDifficulty: DifficultyLevel;
  overallConfidence?: ConfidenceLevel;
  reflectionComment?: string;
  completed: boolean;
  submittedAt: string;
};

export type ActivitySession = {
  id: string;
  studentId?: string;
  studentName: string;
  classId?: string;
  className?: string;
  activityId: string;
  startedAt: number;
  readingStartedAt: number | null;
  questionStartedAt: number | null;
  readingTimeSeconds: number;
  currentQuestionIndex: number;
  questionResponses: Array<
    Omit<QuestionResponse, "isCorrect" | "confidence" | "judgedCorrect"> & {
      confidence: ConfidenceLevel | null;
      judgedCorrect: JudgedCorrectness | null;
    }
  >;
  perceivedDifficulty: DifficultyLevel | null;
  reflectionComment: string;
  completed: boolean;
};

export type SupportIndicator = {
  id: string;
  label: string;
  severity: "low" | "medium" | "high";
  // The raw, traceable data that caused this indicator to fire (the
  // "evidence-linked" property) — numbers and counts, not interpretation.
  evidence: string;
  // Plain-language explanation of what this pattern can mean for a
  // facilitator, grounded in research where available.
  interpretation: string;
};

export type FacilitatorRecommendation = {
  id: string;
  studentName: string;
  activityId: string;
  summary: string;
  action: string;
  indicators: SupportIndicator[];
  createdAt: string;
};

export type ActivityResult = {
  response: StudentResponse;
  recommendation: FacilitatorRecommendation;
};

// A pattern shared by several students on the same activity. These are shown
// apart from individual profiles because they more likely point to the
// passage or question than to any one learner.
export type ClassPatternAlert = {
  id: string;
  activityId: string;
  kind: "question-missed" | "inferential-gap";
  studentCount: number;
  totalStudents: number;
  message: string;
};

export type ClassRecord = {
  id: string;
  name: string;
  createdAt: string;
};

export type StudentRecord = {
  id: string;
  name: string;
  classId: string;
  createdAt: string;
};

export type Roster = {
  classes: ClassRecord[];
  students: StudentRecord[];
};
