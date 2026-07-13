"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getBlockState } from "@/lib/lesson-progress";
import { getSignedFileUrl } from "@/lib/supabase-admin";

export async function markBlockDone(lessonId: string, blockId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "FACILITATOR") {
    throw new Error("Unauthorized");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!lesson || lesson.status !== "PUBLISHED") {
    throw new Error("Lesson not found");
  }

  // A subject belongs to exactly one class, so checking by subjectId alone
  // is enough to confirm this facilitator is genuinely assigned here.
  const assignment = await prisma.facilitatorAssignment.findFirst({
    where: { facilitatorId: user.id, subjectId: lesson.subjectId },
  });
  if (!assignment) {
    throw new Error("Not assigned to this lesson");
  }

  const block = lesson.blocks.find((b) => b.id === blockId);
  if (!block) {
    throw new Error("Block not found");
  }

  const progress = await prisma.lessonProgress.findUnique({
    where: { facilitatorId_lessonId: { facilitatorId: user.id, lessonId } },
  });
  if (!progress) {
    throw new Error("Open the lesson before marking a step done");
  }

  // Server-side enforcement: never trust the client's idea of what's
  // unlocked — recompute from the real, current progress row.
  const state = getBlockState(block, progress);
  if (state === "locked") {
    throw new Error("This step is locked.");
  }

  const completedBlockIds = progress.completedBlockIds.includes(blockId)
    ? progress.completedBlockIds
    : [...progress.completedBlockIds, blockId];

  const isLastBlock = block.order === lesson.blocks.length - 1;

  const data: {
    completedBlockIds: string[];
    currentBlockIndex?: number;
    completedAt?: Date;
  } = { completedBlockIds };

  // Only advance the linear position when completing the actual current
  // step — revisiting an already-done step (allowed before completion) or
  // re-confirming after the lesson's finished shouldn't move anything.
  if (!progress.completedAt && state === "active") {
    if (isLastBlock) {
      data.completedAt = new Date();
    } else {
      data.currentBlockIndex = block.order + 1;
    }
  }

  const updated = await prisma.lessonProgress.update({
    where: { id: progress.id },
    data,
  });

  // If this advanced to a newly-active block, hand back its real content —
  // the client never received it while it was locked.
  let unlockedBlock: { id: string; content: unknown; facilitatorNote: string | null } | null =
    null;
  if (!updated.completedAt && data.currentBlockIndex !== undefined) {
    const next = lesson.blocks.find((b) => b.order === data.currentBlockIndex);
    if (next) {
      const rawContent = (next.content as Record<string, unknown>) ?? {};
      let content: Record<string, unknown> = rawContent;

      // Same signed-URL resolution as the initial page load — this block
      // was locked a moment ago, so the client has never seen its content.
      if (typeof rawContent.filePath === "string") {
        const signedFileUrl = await getSignedFileUrl(rawContent.filePath);
        content = { ...rawContent, signedFileUrl };
      }

      unlockedBlock = {
        id: next.id,
        content,
        facilitatorNote: next.facilitatorNote,
      };
    }
  }

  return {
    progress: {
      currentBlockIndex: updated.currentBlockIndex,
      completedBlockIds: updated.completedBlockIds,
      completedAt: updated.completedAt,
    },
    unlockedBlock,
  };
}
