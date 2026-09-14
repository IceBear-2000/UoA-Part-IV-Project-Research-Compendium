import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Same graceful-fallback convention as lib/email.ts's Resend client — every
// function here returns an { error } result instead of throwing when
// ANTHROPIC_API_KEY isn't set, so the rest of the wizard stays testable.
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const NOT_CONFIGURED_ERROR = "AI generation isn't configured yet — ask an admin to add ANTHROPIC_API_KEY.";

// Summarizing is cheap/simple compression — Haiku is plenty. Generating the
// actual worksheet (questions + answer key) gets Sonnet for better accuracy.
const SUMMARY_MODEL = "claude-haiku-4-5-20251001";
const GENERATION_MODEL = "claude-sonnet-5";

export type ContentSource = { label: string; text: string };

export type QuestionType = "mcq" | "short_answer" | "long_answer" | "coloring";

export type WorksheetQuestion =
  | { type: "mcq"; prompt: string; options: string[]; correctIndex: number }
  | { type: "short_answer"; prompt: string; answer: string }
  | { type: "long_answer"; prompt: string; answer: string }
  | { type: "coloring"; prompt: string };

export type WorksheetDraft = {
  title: string;
  studentInstructions: string;
  questions: WorksheetQuestion[];
};

export type SummarizeResult = { summary: string } | { error: string };
export type GenerateResult = { draft: WorksheetDraft } | { error: string };

export async function summarizeLessonContent(sources: ContentSource[]): Promise<SummarizeResult> {
  if (!anthropic) return { error: NOT_CONFIGURED_ERROR };

  const combined = sources.map((s) => `### ${s.label}\n${s.text}`).join("\n\n");
  if (!combined.trim()) {
    return { error: "This lesson has no readable content yet (no transcripts, documents, or instructions)." };
  }

  try {
    const message = await anthropic.messages.create({
      model: SUMMARY_MODEL,
      max_tokens: 600,
      system:
        "You summarize K-12 lesson content for a teacher who is about to write a worksheet. " +
        "Read the provided source material and write a short, clear paragraph describing what the lesson " +
        "actually teaches — the key concepts, vocabulary, and scope. Reply with only the summary paragraph, " +
        "no preamble, no headings.",
      messages: [{ role: "user", content: combined.slice(0, 60_000) }],
    });

    const block = message.content.find((b) => b.type === "text");
    const summary = block && block.type === "text" ? block.text.trim() : "";
    if (!summary) return { error: "Claude returned an empty summary." };
    return { summary };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Claude request failed." };
  }
}

const WORKSHEET_TOOL: Anthropic.Tool = {
  name: "submit_worksheet",
  description: "Submit the generated worksheet draft.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      studentInstructions: {
        type: "string",
        description: "Short instructions shown to students at the top of the worksheet.",
      },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["mcq", "short_answer", "long_answer", "coloring"] },
            prompt: { type: "string" },
            options: {
              type: "array",
              items: { type: "string" },
              description: "Required for type 'mcq' only — the answer choices.",
            },
            correctIndex: {
              type: "number",
              description: "Required for type 'mcq' only — index into options of the correct choice.",
            },
            answer: {
              type: "string",
              description: "Required for type 'short_answer' and 'long_answer' — the model answer.",
            },
          },
          required: ["type", "prompt"],
        },
      },
    },
    required: ["title", "studentInstructions", "questions"],
  },
};

export async function generateWorksheetDraft({
  summary,
  questionTypes,
  specialInstructions,
}: {
  summary: string;
  questionTypes: QuestionType[];
  specialInstructions: string;
}): Promise<GenerateResult> {
  if (!anthropic) return { error: NOT_CONFIGURED_ERROR };
  if (questionTypes.length === 0) return { error: "Pick at least one question type." };

  try {
    const message = await anthropic.messages.create({
      model: GENERATION_MODEL,
      max_tokens: 4000,
      system:
        "You write worksheets for K-12 students based on a lesson summary. " +
        "Only use the question types the teacher selected. For 'mcq' always include 4 plausible options " +
        "and a correct correctIndex. For 'short_answer'/'long_answer' always include a model answer. " +
        "For 'coloring', the prompt is a themed drawing/coloring suggestion tied to the lesson, not a real image. " +
        "Call submit_worksheet with the result — no other response.",
      tools: [WORKSHEET_TOOL],
      tool_choice: { type: "tool", name: "submit_worksheet" },
      messages: [
        {
          role: "user",
          content:
            `Lesson summary:\n${summary}\n\n` +
            `Question types to use: ${questionTypes.join(", ")}\n` +
            (specialInstructions.trim()
              ? `Special instructions from the teacher: ${specialInstructions.trim()}`
              : "No special instructions."),
        },
      ],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") return { error: "Claude didn't return a worksheet." };

    const draft = toolUse.input as WorksheetDraft;
    if (!draft.questions?.length) return { error: "Claude returned a worksheet with no questions." };
    return { draft };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Claude request failed." };
  }
}
