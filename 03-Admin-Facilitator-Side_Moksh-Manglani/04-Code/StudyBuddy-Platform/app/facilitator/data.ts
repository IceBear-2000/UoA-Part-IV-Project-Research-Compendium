import { prisma } from "@/lib/prisma";

// Centralizes the "is this facilitator actually assigned to this
// class/subject" checks so every nested route enforces them the same way,
// server-side — a facilitator can never see another's classes by guessing
// an id in the URL.

export async function getAssignedClassSummaries(facilitatorId: string) {
  const assignments = await prisma.facilitatorAssignment.findMany({
    where: { facilitatorId },
    include: { class: true },
    orderBy: { class: { name: "asc" } },
  });

  const byClass = new Map<string, { id: string; name: string; subjectIds: string[] }>();
  for (const a of assignments) {
    const entry = byClass.get(a.classId) ?? { id: a.class.id, name: a.class.name, subjectIds: [] };
    entry.subjectIds.push(a.subjectId);
    byClass.set(a.classId, entry);
  }

  return Promise.all(
    Array.from(byClass.values()).map(async (c) => ({
      ...c,
      lessonCount: await prisma.lesson.count({
        where: { subjectId: { in: c.subjectIds }, status: "PUBLISHED" },
      }),
    })),
  );
}

export async function getAssignedSubjects(facilitatorId: string, classId: string) {
  const assignments = await prisma.facilitatorAssignment.findMany({
    where: { facilitatorId, classId },
    include: { class: true, subject: true },
  });

  if (assignments.length === 0) return null;

  const subjects = await Promise.all(
    assignments.map(async (a) => ({
      id: a.subject.id,
      name: a.subject.name,
      lessonCount: await prisma.lesson.count({
        where: { subjectId: a.subjectId, status: "PUBLISHED" },
      }),
    })),
  );

  return { className: assignments[0].class.name, subjects };
}

export async function getSubjectAssignment(
  facilitatorId: string,
  classId: string,
  subjectId: string,
) {
  return prisma.facilitatorAssignment.findFirst({
    where: { facilitatorId, classId, subjectId },
    include: { class: true, subject: true },
  });
}
