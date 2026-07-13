"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { LessonStatus } from "@prisma/client";

function parseLessonFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const subjectId = String(formData.get("subjectId") ?? "");
  const durationRaw = String(formData.get("durationMinutes") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const learningObjectives = String(formData.get("learningObjectives") ?? "").trim();

  return {
    name,
    subjectId,
    durationMinutes:
      durationRaw && !Number.isNaN(Number(durationRaw)) ? parseInt(durationRaw, 10) : null,
    description: description || null,
    learningObjectives: learningObjectives || null,
  };
}

export async function createLesson(formData: FormData) {
  await requireAdmin();
  const fields = parseLessonFields(formData);

  if (!fields.name || !fields.subjectId) {
    redirect(
      `/admin/lessons/new?error=${encodeURIComponent("Lesson name, class, and subject are required.")}`,
    );
  }

  const lesson = await prisma.lesson.create({
    data: {
      name: fields.name,
      subjectId: fields.subjectId,
      durationMinutes: fields.durationMinutes,
      description: fields.description,
      learningObjectives: fields.learningObjectives,
      status: LessonStatus.DRAFT,
    },
  });

  revalidatePath("/admin/lessons");
  redirect(`/admin/lessons/${lesson.id}`);
}

export async function updateLesson(lessonId: string, formData: FormData) {
  await requireAdmin();
  const fields = parseLessonFields(formData);

  if (!fields.name || !fields.subjectId) {
    redirect(
      `/admin/lessons/${lessonId}?error=${encodeURIComponent("Lesson name, class, and subject are required.")}`,
    );
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      name: fields.name,
      subjectId: fields.subjectId,
      durationMinutes: fields.durationMinutes,
      description: fields.description,
      learningObjectives: fields.learningObjectives,
    },
  });

  revalidatePath("/admin/lessons");
  revalidatePath(`/admin/lessons/${lessonId}`);
  redirect(`/admin/lessons/${lessonId}?saved=1`);
}

export async function togglePublish(lessonId: string, nextStatus: LessonStatus) {
  await requireAdmin();
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { status: nextStatus },
  });

  revalidatePath("/admin/lessons");
  revalidatePath(`/admin/lessons/${lessonId}`);
  redirect(`/admin/lessons/${lessonId}`);
}
