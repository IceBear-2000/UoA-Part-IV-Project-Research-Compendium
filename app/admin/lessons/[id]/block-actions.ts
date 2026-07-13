"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { BlockType, Prisma } from "@prisma/client";
import { BLOCK_META, defaultContentFor } from "@/lib/block-meta";

export async function addBlock(lessonId: string, type: BlockType) {
  await requireAdmin();
  const count = await prisma.block.count({ where: { lessonId } });

  const block = await prisma.block.create({
    data: {
      lessonId,
      type,
      title: BLOCK_META[type].label,
      order: count,
      content: defaultContentFor(type) as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/admin/lessons/${lessonId}`);
  return block;
}

export async function updateBlock(
  blockId: string,
  lessonId: string,
  data: { title: string; facilitatorNote: string | null; content: Record<string, unknown> },
) {
  await requireAdmin();
  await prisma.block.update({
    where: { id: blockId },
    data: {
      title: data.title,
      facilitatorNote: data.facilitatorNote,
      content: data.content as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function deleteBlock(blockId: string, lessonId: string) {
  await requireAdmin();
  await prisma.block.delete({ where: { id: blockId } });

  // Keep `order` a clean 0..n-1 sequence after a delete — the lesson flow
  // player (Session 7) compares currentBlockIndex directly against
  // Block.order, so gaps would break its locked/active/done logic.
  const remaining = await prisma.block.findMany({
    where: { lessonId },
    orderBy: { order: "asc" },
  });

  await prisma.$transaction(
    remaining.map((block, index) =>
      prisma.block.update({ where: { id: block.id }, data: { order: index } }),
    ),
  );

  revalidatePath(`/admin/lessons/${lessonId}`);
}

export async function reorderBlocks(lessonId: string, orderedBlockIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedBlockIds.map((id, index) =>
      prisma.block.update({ where: { id }, data: { order: index } }),
    ),
  );

  revalidatePath(`/admin/lessons/${lessonId}`);
}
