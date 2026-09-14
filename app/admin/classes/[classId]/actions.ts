"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin, BLOCK_RESOURCES_BUCKET } from "@/lib/supabase-admin";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export async function uploadClassBanner(classId: string, formData: FormData) {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file selected.");
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("Only JPEG, PNG, or WebP images are supported.");
  if (file.size > MAX_SIZE_BYTES) throw new Error("Image is too large — 8MB max.");

  const classRow = await prisma.class.findUnique({ where: { id: classId } });
  if (!classRow) throw new Error("Class not found");

  if (classRow.bannerImagePath) {
    await supabaseAdmin.storage.from(BLOCK_RESOURCES_BUCKET).remove([classRow.bannerImagePath]);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `class-banners/${classId}/${Date.now()}-${safeName}`;

  const { error } = await supabaseAdmin.storage
    .from(BLOCK_RESOURCES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);

  await prisma.class.update({ where: { id: classId }, data: { bannerImagePath: path } });

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${classId}`);
  return path;
}

export async function removeClassBanner(classId: string) {
  await requireAdmin();

  const classRow = await prisma.class.findUnique({ where: { id: classId } });
  if (!classRow) throw new Error("Class not found");

  if (classRow.bannerImagePath) {
    await supabaseAdmin.storage.from(BLOCK_RESOURCES_BUCKET).remove([classRow.bannerImagePath]);
  }

  await prisma.class.update({ where: { id: classId }, data: { bannerImagePath: null } });

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${classId}`);
}
