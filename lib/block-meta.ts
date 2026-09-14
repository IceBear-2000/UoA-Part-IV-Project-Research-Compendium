import { BlockType } from "@prisma/client";

export const BLOCK_TYPES: BlockType[] = [
  BlockType.VIDEO,
  BlockType.WORKBOOK,
  BlockType.ACTIVITY,
  BlockType.WORKSHEET,
  BlockType.READING,
  BlockType.QUIZ,
  BlockType.DISCUSSION,
  BlockType.BREAK,
  BlockType.NOTE,
];

export const BLOCK_META: Record<
  BlockType,
  { icon: string; soft: string; text: string; label: string; description: string }
> = {
  VIDEO: {
    icon: "🎬",
    soft: "bg-clay-soft",
    text: "text-[#8c5538]",
    label: "Video",
    description: "A video to play for the class. Add a link and how long it runs.",
  },
  WORKBOOK: {
    icon: "📓",
    soft: "bg-blue-soft",
    text: "text-[#54707f]",
    label: "Workbook",
    description: "Points to pages in the printed workbook. We just note the page range.",
  },
  ACTIVITY: {
    icon: "🎲",
    soft: "bg-gold-soft",
    text: "text-[#8d7426]",
    label: "Activity",
    description: "A hands-on or group activity. Write clear step-by-step instructions.",
  },
  WORKSHEET: {
    icon: "📄",
    soft: "bg-sage-soft",
    text: "text-[#5f7355]",
    label: "Worksheet",
    description: "A printable handout. Facilitators view and print it for the class.",
  },
  READING: {
    icon: "📖",
    soft: "bg-rose-soft",
    text: "text-[#946b76]",
    label: "Reading",
    description: "A passage or text for students to read, together or independently.",
  },
  QUIZ: {
    icon: "✅",
    soft: "bg-blue-soft",
    text: "text-[#54707f]",
    label: "Quiz",
    description: "A quick set of questions to check understanding.",
  },
  DISCUSSION: {
    icon: "💬",
    soft: "bg-gold-soft",
    text: "text-[#8d7426]",
    label: "Discussion",
    description: "A guided class discussion. Add prompt questions or talking points.",
  },
  BREAK: {
    icon: "⏸️",
    soft: "bg-sage-soft",
    text: "text-[#5f7355]",
    label: "Break",
    description: "Schedule a break!",
  },
  NOTE: {
    icon: "📌",
    soft: "bg-bg-2",
    text: "text-ink",
    label: "Note",
    description: "Any notes / special instructions for the facilitator to follow",
  },
};

// Only these four get real type-specific fields — the rest share a generic
// "instructions" shape for now, per PROJECT_BRIEF.md. Reading and Worksheet
// additionally carry an optional uploaded file (filePath/fileName) — see
// lib/supabase-admin.ts for how that's stored and served.
export function defaultContentFor(type: BlockType): Record<string, unknown> {
  switch (type) {
    case BlockType.VIDEO:
      return { url: "", durationSeconds: null };
    case BlockType.WORKBOOK:
      return { pageStart: null, pageEnd: null };
    case BlockType.ACTIVITY:
      return { instructions: "" };
    case BlockType.WORKSHEET:
      return { fileUrl: "", filePath: null, fileName: null, generatedByAI: false };
    case BlockType.READING:
      return { instructions: "", filePath: null, fileName: null };
    default:
      return { instructions: "" };
  }
}

// Types where an admin can attach an uploaded resource (PDF/Word/PowerPoint).
// Deliberately excludes Video (has its own URL field) and the other generic
// types — scoped to where a document actually makes sense to hand out.
export const FILE_UPLOAD_TYPES: BlockType[] = [BlockType.READING, BlockType.WORKSHEET];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function summarizeContent(type: BlockType, content: any): string {
  switch (type) {
    case BlockType.VIDEO:
      return content?.url ? "Video link added" : "No video link yet";
    case BlockType.WORKBOOK:
      return content?.pageStart && content?.pageEnd
        ? `Pages ${content.pageStart}–${content.pageEnd}`
        : "No pages set yet";
    case BlockType.WORKSHEET:
      return Array.isArray(content?.questions)
        ? `AI-generated · ${content.questions.length} question${content.questions.length === 1 ? "" : "s"}`
        : content?.fileName
          ? `File: ${content.fileName}`
          : content?.fileUrl
            ? "Worksheet link added"
            : "No file yet";
    case BlockType.READING:
      return content?.fileName
        ? `File: ${content.fileName}`
        : content?.instructions
          ? "Instructions added"
          : "No content yet";
    default:
      return content?.instructions ? "Instructions added" : "No instructions yet";
  }
}
