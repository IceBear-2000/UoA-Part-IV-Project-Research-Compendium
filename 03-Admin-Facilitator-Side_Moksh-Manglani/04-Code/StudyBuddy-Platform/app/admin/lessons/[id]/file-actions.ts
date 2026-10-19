"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { supabaseAdmin, BLOCK_RESOURCES_BUCKET, getSignedFileUrl } from "@/lib/supabase-admin";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
const MAX_SIZE_BYTES = 25 * 1024 * 1024;

export async function uploadBlockFile(lessonId: string, blockId: string, formData: FormData) {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file selected.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only PDF, Word, or PowerPoint files are supported.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("File is too large. 25MB max.");
  }

  const block = await prisma.block.findUnique({ where: { id: blockId } });
  if (!block) throw new Error("Block not found");

  const existingContent = (block.content as Record<string, unknown>) ?? {};

  // Replace, don't accumulate — remove any file this block already has
  // before uploading the new one.
  if (typeof existingContent.filePath === "string") {
    await supabaseAdmin.storage.from(BLOCK_RESOURCES_BUCKET).remove([existingContent.filePath]);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${blockId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BLOCK_RESOURCES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  const newContent = { ...existingContent, filePath: path, fileName: file.name };

  await prisma.block.update({
    where: { id: blockId },
    data: { content: newContent as Prisma.InputJsonValue },
  });

  revalidatePath(`/admin/lessons/${lessonId}`);
  return newContent;
}

export async function removeBlockFile(lessonId: string, blockId: string) {
  await requireAdmin();

  const block = await prisma.block.findUnique({ where: { id: blockId } });
  if (!block) throw new Error("Block not found");

  const existingContent = (block.content as Record<string, unknown>) ?? {};
  if (typeof existingContent.filePath === "string") {
    await supabaseAdmin.storage.from(BLOCK_RESOURCES_BUCKET).remove([existingContent.filePath]);
  }

  const newContent = { ...existingContent, filePath: null, fileName: null };

  await prisma.block.update({
    where: { id: blockId },
    data: { content: newContent as Prisma.InputJsonValue },
  });

  revalidatePath(`/admin/lessons/${lessonId}`);
  return newContent;
}

export async function getBlockFilePreviewUrl(filePath: string) {
  await requireAdmin();
  return getSignedFileUrl(filePath);
}
