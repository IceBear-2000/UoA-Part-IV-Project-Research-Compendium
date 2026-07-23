export type ConfidenceLevel = 1 | 2 | 3 | 4;
export type DifficultyLevel = 1 | 2 | 3;

export type QuestionResponse = {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  hintCount: number;
  answerChangeCount: number;
  firstInteractionSeconds: number | null;
  questionTimeSeconds: number;
  passageRevisitCount: number;
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
    Omit<QuestionResponse, "isCorrect" | "confidence"> & {
      confidence: ConfidenceLevel | null;
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
  evidence: string;
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
