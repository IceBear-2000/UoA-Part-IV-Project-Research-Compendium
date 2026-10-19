"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { BlockType, Prisma } from "@prisma/client";
import { supabaseAdmin, BLOCK_RESOURCES_BUCKET } from "@/lib/supabase-admin";
import { fetchYoutubeTranscript } from "@/lib/youtube-transcript";
import { extractDocumentText } from "@/lib/document-text";
import {
  summarizeLessonContent,
  generateWorksheetDraft as generateDraft,
  type ContentSource,
  type QuestionType,
  type WorksheetDraft,
} from "@/lib/ai-worksheet";

export async function analyzeLessonContent(lessonId: string) {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!lesson) throw new Error("Lesson not found");

  const sources: ContentSource[] = [];
  const warnings: string[] = [];

  for (const block of lesson.blocks) {
    const content = (block.content as Record<string, unknown>) ?? {};

    if (block.type === BlockType.VIDEO && typeof content.url === "string" && content.url) {
      const result = await fetchYoutubeTranscript(content.url);
      if ("error" in result) {
        warnings.push(`Couldn't get a transcript for "${block.title}": ${result.error}`);
      } else {
        sources.push({ label: `Video: ${block.title}`, text: result.text });
      }
      continue;
    }

    if (typeof content.filePath === "string" && content.filePath) {
      const fileName = typeof content.fileName === "string" ? content.fileName : content.filePath;
      const { data, error } = await supabaseAdmin.storage
        .from(BLOCK_RESOURCES_BUCKET)
        .download(content.filePath);

      if (error || !data) {
        warnings.push(`Couldn't read the file for "${block.title}": ${error?.message ?? "download failed"}.`);
        continue;
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      const result = await extractDocumentText(buffer, fileName);
      if ("error" in result) {
        warnings.push(`Couldn't read the file for "${block.title}": ${result.error}`);
      } else {
        sources.push({ label: `Document: ${block.title} (${fileName})`, text: result.text });
      }
      continue;
    }

    if (typeof content.instructions === "string" && content.instructions.trim()) {
      sources.push({ label: `${block.title}`, text: content.instructions });
    }
  }

  const result = await summarizeLessonContent(sources);
  if ("error" in result) {
    return { summary: "", warnings: [...warnings, result.error] };
  }
  return { summary: result.summary, warnings };
}

export async function generateWorksheetDraft({
  summary,
  questionTypes,
  specialInstructions,
}: {
  summary: string;
  questionTypes: QuestionType[];
  specialInstructions: string;
}) {
  await requireAdmin();
  return generateDraft({ summary, questionTypes, specialInstructions });
}

export async function finalizeWorksheetBlock(lessonId: string, draft: WorksheetDraft) {
  await requireAdmin();

  const count = await prisma.block.count({ where: { lessonId } });

  const block = await prisma.block.create({
    data: {
      lessonId,
      type: BlockType.WORKSHEET,
      title: draft.title || "AI-generated worksheet",
      order: count,
      content: {
        generatedByAI: true,
        title: draft.title,
        studentInstructions: draft.studentInstructions,
        questions: draft.questions,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/admin/lessons/${lessonId}`);
  return block;
}
