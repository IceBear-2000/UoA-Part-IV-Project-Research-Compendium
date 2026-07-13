"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// Upsert, not create — clicking "Assign" on a pair that's already assigned
// is a harmless no-op rather than a duplicate-key error. Matches
// PROJECT_BRIEF.md: this is the one place assignments are written,
// regardless of which screen triggers it.
export async function assignFacilitator(facilitatorId: string, classId: string, subjectId: string) {
  await requireAdmin();

  const alreadyAssigned = await prisma.facilitatorAssignment.findUnique({
    where: {
      facilitatorId_classId_subjectId: { facilitatorId, classId, subjectId },
    },
  });

  const assignment = await prisma.facilitatorAssignment.upsert({
    where: {
      facilitatorId_classId_subjectId: { facilitatorId, classId, subjectId },
    },
    create: { facilitatorId, classId, subjectId },
    update: {},
    include: { class: true, subject: true },
  });

  if (!alreadyAssigned) {
    await createNotification({
      userId: facilitatorId,
      body: `You've been granted access to ${assignment.class.name} · ${assignment.subject.name}.`,
      link: "/facilitator",
    });
  }

  revalidatePath("/admin/facilitators");
  return assignment;
}

export async function removeAssignment(assignmentId: string) {
  await requireAdmin();
  await prisma.facilitatorAssignment.delete({ where: { id: assignmentId } });
  revalidatePath("/admin/facilitators");
}
