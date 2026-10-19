// One-off setup script: creates FacilitatorAssignment records so Session 6's
// browsing flow has real data to show. The admin UI for managing these
// assignments is built in a later session — this just seeds enough to
// develop and test against. Run with: npx tsx scripts/assign-facilitators.ts
import { prisma } from "../lib/prisma";

async function main() {
  const [aroha, tama] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { email: "aroha@school.nz" } }),
    prisma.user.findUniqueOrThrow({ where: { email: "tama@school.nz" } }),
  ]);

  const [grade1, grade2] = await Promise.all([
    prisma.class.findFirstOrThrow({ where: { name: "Grade 1" } }),
    prisma.class.findFirstOrThrow({ where: { name: "Grade 2" } }),
  ]);

  const subjects = await prisma.subject.findMany({
    where: { classId: { in: [grade1.id, grade2.id] } },
  });
  const find = (classId: string, name: string) =>
    subjects.find((s) => s.classId === classId && s.name === name)!;

  const assignments = [
    { facilitatorId: aroha.id, classId: grade1.id, subjectId: find(grade1.id, "Maths").id },
    { facilitatorId: aroha.id, classId: grade1.id, subjectId: find(grade1.id, "Science").id },
    { facilitatorId: aroha.id, classId: grade2.id, subjectId: find(grade2.id, "Maths").id },
    { facilitatorId: tama.id, classId: grade2.id, subjectId: find(grade2.id, "Science").id },
  ];

  for (const a of assignments) {
    await prisma.facilitatorAssignment.upsert({
      where: {
        facilitatorId_classId_subjectId: {
          facilitatorId: a.facilitatorId,
          classId: a.classId,
          subjectId: a.subjectId,
        },
      },
      create: a,
      update: {},
    });
  }

  console.log(`Created/confirmed ${assignments.length} facilitator assignments.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
