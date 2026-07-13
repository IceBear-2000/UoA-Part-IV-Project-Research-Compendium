export type WorksheetInput = {
  topic: string;
  classGrade: string;
  subject: string;
  numQuestions: number;
  styleNotes?: string;
};

export type WorksheetResult = {
  title: string;
  subtitle: string;
  questions: string[];
};

const TEMPLATES: ((topic: string, n: number) => string)[] = [
  (topic, n) => `Fill in the blank for ${topic} (question ${n}).`,
  (topic) => `Circle the correct answer about ${topic}.`,
  (topic) => `Write one sentence explaining ${topic} in your own words.`,
  (topic, n) => `Match the term to its meaning — ${topic}, item ${n}.`,
  (topic) => `True or false: a statement about ${topic}.`,
];

// Mock generator — no real AI call. The input/output shape here is the real
// contract; swapping this body for an actual LLM call later shouldn't
// require touching any caller.
export async function generateWorksheet(input: WorksheetInput): Promise<WorksheetResult> {
  await new Promise((resolve) => setTimeout(resolve, 1100 + Math.random() * 500));

  const questions = Array.from({ length: input.numQuestions }, (_, i) =>
    TEMPLATES[i % TEMPLATES.length](input.topic, i + 1),
  );

  return {
    title: `${input.topic} — Practice`,
    subtitle: [input.classGrade, input.subject].filter(Boolean).join(" · "),
    questions,
  };
}
