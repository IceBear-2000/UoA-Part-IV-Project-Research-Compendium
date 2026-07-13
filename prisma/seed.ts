import { PrismaClient, BlockType, LessonStatus, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const organisation = await prisma.organisation.create({
    data: { name: "StudyBuddy Auckland Pilot" },
  });

  // authId values are placeholders — Session 3 wires up real Supabase Auth
  // and these will correspond to real auth users at that point.
  const admin = await prisma.user.create({
    data: {
      authId: "seed-admin-gill",
      name: "Gill Dobbie",
      email: "gill@school.nz",
      role: Role.ADMIN,
      organisationId: organisation.id,
    },
  });

  const [aroha, tama] = await Promise.all([
    prisma.user.create({
      data: {
        authId: "seed-facilitator-aroha",
        name: "Aroha Reweti",
        email: "aroha@school.nz",
        role: Role.FACILITATOR,
        organisationId: organisation.id,
      },
    }),
    prisma.user.create({
      data: {
        authId: "seed-facilitator-tama",
        name: "Tama Mahuta",
        email: "tama@school.nz",
        role: Role.FACILITATOR,
        organisationId: organisation.id,
      },
    }),
  ]);

  const [grade1, grade2] = await Promise.all([
    prisma.class.create({ data: { name: "Grade 1", organisationId: organisation.id } }),
    prisma.class.create({ data: { name: "Grade 2", organisationId: organisation.id } }),
  ]);

  const grade1Maths = await prisma.subject.create({
    data: { name: "Maths", classId: grade1.id },
  });
  await prisma.subject.createMany({
    data: [
      { name: "Science", classId: grade1.id },
      { name: "English", classId: grade1.id },
      { name: "Maths", classId: grade2.id },
      { name: "Science", classId: grade2.id },
    ],
  });

  const lesson = await prisma.lesson.create({
    data: {
      subjectId: grade1Maths.id,
      name: "Counting to 20",
      status: LessonStatus.PUBLISHED,
      durationMinutes: 45,
      description:
        "An introduction to counting objects up to 20, combining a warm-up song, guided workbook practice, and a hands-on counting game.",
      learningObjectives:
        "Students will be able to count a set of objects up to 20 and write the corresponding numeral.",
    },
  });

  await prisma.block.createMany({
    data: [
      {
        lessonId: lesson.id,
        type: BlockType.VIDEO,
        title: "Warm-up song",
        order: 0,
        facilitatorNote:
          "Play the full song and encourage the class to clap along to the beat.",
        content: {
          url: "https://example.com/videos/warm-up-song.mp4",
          durationSeconds: 120,
        },
      },
      {
        lessonId: lesson.id,
        type: BlockType.WORKBOOK,
        title: "Counting workbook",
        order: 1,
        facilitatorNote:
          "Open the workbook to pages 12–13. Work through the first row together as a class.",
        content: { pageStart: 12, pageEnd: 13 },
      },
      {
        lessonId: lesson.id,
        type: BlockType.VIDEO,
        title: "Count the objects",
        order: 2,
        facilitatorNote:
          "Pause at 2:10 and ask the class to count along out loud before continuing.",
        content: {
          url: "https://example.com/videos/count-the-objects.mp4",
          durationSeconds: 240,
        },
      },
      {
        lessonId: lesson.id,
        type: BlockType.ACTIVITY,
        title: "Class counting game",
        order: 3,
        facilitatorNote:
          "Split the class into pairs. Each pair counts a set of blocks and writes the number.",
        content: {
          instructions:
            "Split the class into pairs. Each pair counts a set of counting blocks and writes down the number.",
        },
      },
      {
        lessonId: lesson.id,
        type: BlockType.WORKSHEET,
        title: "Practice worksheet",
        order: 4,
        facilitatorNote:
          "Print one worksheet per student. Hand out and let them complete individually.",
        content: {
          fileUrl: "https://example.com/worksheets/counting-to-20.pdf",
          generatedByAI: false,
        },
      },
    ],
  });

  console.log("Seed complete:", {
    organisation: organisation.name,
    admin: admin.email,
    facilitators: [aroha.email, tama.email],
    classes: [grade1.name, grade2.name],
    lesson: lesson.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
