import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSubjectAssignment } from "@/app/facilitator/data";
import { prisma } from "@/lib/prisma";
import { getBlockState } from "@/lib/lesson-progress";
import { getSignedFileUrl } from "@/lib/supabase-admin";
import { LessonFlowPlayer } from "./_components/LessonFlowPlayer";

export const metadata = { title: "Lesson" };

export default async function LessonFlowPage({
  params,
}: {
  params: { classId: string; subjectId: string; lessonId: string };
}) {
  const user = await getCurrentUser();
  const assignment = await getSubjectAssignment(user!.id, params.classId, params.subjectId);
  if (!assignment) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!lesson || lesson.status !== "PUBLISHED" || lesson.subjectId !== params.subjectId) {
    notFound();
  }
  if (lesson.blocks.length === 0) {
    // Nothing to play — shouldn't happen for a real published lesson, but
    // handle it rather than rendering a broken player.
    notFound();
  }

  let progress = await prisma.lessonProgress.findUnique({
    where: { facilitatorId_lessonId: { facilitatorId: user!.id, lessonId: lesson.id } },
  });
  if (!progress) {
    progress = await prisma.lessonProgress.create({
      data: { facilitatorId: user!.id, lessonId: lesson.id },
    });
  }

  const blocksForClient = await Promise.all(
    lesson.blocks.map(async (block) => {
      const state = getBlockState(block, progress!);

      // Withhold real content for anything still locked — enforced here,
      // not just hidden client-side, per the brief.
      if (state === "locked") {
        return {
          id: block.id,
          type: block.type,
          title: block.title,
          order: block.order,
          state,
          content: null,
          facilitatorNote: null,
        };
      }

      const rawContent = (block.content as Record<string, unknown>) ?? {};
      let content: Record<string, unknown> = rawContent;

      // Resolve an uploaded file to a fresh signed URL at render time —
      // the browser never sees the raw storage path, only a link that
      // expires. Never a public direct link, per PROJECT_BRIEF.md.
      if (typeof rawContent.filePath === "string") {
        const signedFileUrl = await getSignedFileUrl(rawContent.filePath);
        content = { ...rawContent, signedFileUrl };
      }

      return {
        id: block.id,
        type: block.type,
        title: block.title,
        order: block.order,
        state,
        content,
        facilitatorNote: block.facilitatorNote,
      };
    }),
  );

  // Where "Ask the admin a question" goes: the organisation's first admin, as in the chat.
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", organisationId: user!.organisationId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return (
    <LessonFlowPlayer
      classId={params.classId}
      subjectId={params.subjectId}
      lessonId={lesson.id}
      lessonName={lesson.name}
      gradeName={assignment.class.name}
      subjectName={assignment.subject.name}
      adminId={admin?.id ?? null}
      blocks={blocksForClient}
      initialProgress={{
        currentBlockIndex: progress.currentBlockIndex,
        completedBlockIds: progress.completedBlockIds,
        completedAt: progress.completedAt,
      }}
    />
  );
}
