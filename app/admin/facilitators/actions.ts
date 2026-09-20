"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// The checklist is the source of truth for one facilitator + one class:
// whatever's checked when you save is exactly what they end up with for
// that class — subjects newly checked get created, subjects unchecked
// that were previously assigned get removed. Other classes are untouched.
export async function syncClassAssignments(
  facilitatorId: string,
  classId: string,
  subjectIds: string[],
) {
  await requireAdmin();

  const [classRow, existing] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId }, select: { name: true } }),
    prisma.facilitatorAssignment.findMany({ where: { facilitatorId, classId } }),
  ]);
  if (!classRow) throw new Error("Class not found");

  const existingSubjectIds = new Set(existing.map((a) => a.subjectId));
  const nextSubjectIds = new Set(subjectIds);

  const toAdd = subjectIds.filter((id) => !existingSubjectIds.has(id));
  const toRemove = existing.filter((a) => !nextSubjectIds.has(a.subjectId));

  await prisma.$transaction([
    ...toRemove.map((a) => prisma.facilitatorAssignment.delete({ where: { id: a.id } })),
    ...toAdd.map((subjectId) =>
      prisma.facilitatorAssignment.create({ data: { facilitatorId, classId, subjectId } }),
    ),
  ]);

  if (toAdd.length > 0) {
    const addedSubjects = await prisma.subject.findMany({
      where: { id: { in: toAdd } },
      select: { name: true },
    });
    await createNotification({
      userId: facilitatorId,
      body: `You've been granted access to ${classRow.name} · ${addedSubjects.map((s) => s.name).join(", ")}.`,
      link: "/facilitator",
    });
  }

  revalidatePath("/admin/facilitators");

  return prisma.facilitatorAssignment.findMany({
    where: { facilitatorId },
    include: { class: true, subject: true },
  });
}
