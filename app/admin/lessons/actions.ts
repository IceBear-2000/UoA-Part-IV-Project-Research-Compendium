"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { LessonStatus, Prisma } from "@prisma/client";
import { parseLessonPlan, MAX_PLAN_BYTES, type PlanResult } from "@/lib/lesson-plan-import";

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

  // Optional spreadsheet lesson plan: one row per block. Checked in full before anything is saved.
  let plan: PlanResult | null = null;
  const planFile = formData.get("planFile");
  if (planFile instanceof File && planFile.size > 0) {
    const fail = (msg: string) => redirect(`/admin/lessons/new?error=${encodeURIComponent(msg)}`);
    if (planFile.size > MAX_PLAN_BYTES) fail("The spreadsheet is too large. 1MB is the limit.");
    plan = await parseLessonPlan(Buffer.from(await planFile.arrayBuffer()), planFile.name);
    if (plan.errors.length > 0) {
      const shown = plan.errors.slice(0, 4).join(" ");
      fail(`Nothing was saved. ${shown}${plan.errors.length > 4 ? ` (${plan.errors.length - 4} more problems.)` : ""}`);
    }
  }

  const planMinutes = plan ? plan.blocks.reduce((sum, b) => sum + (b.minutes ?? 0), 0) : 0;

  const lesson = await prisma.lesson.create({
    data: {
      name: fields.name,
      subjectId: fields.subjectId,
      durationMinutes: fields.durationMinutes ?? (planMinutes > 0 ? planMinutes : null),
      description: fields.description,
      learningObjectives: fields.learningObjectives,
      status: LessonStatus.DRAFT,
      ...(plan
        ? {
            blocks: {
              create: plan.blocks.map((b, i) => ({
                type: b.type,
                title: b.title,
                order: i,
                facilitatorNote: b.facilitatorNote,
                content: b.content as Prisma.InputJsonValue,
              })),
            },
          }
        : {}),
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
