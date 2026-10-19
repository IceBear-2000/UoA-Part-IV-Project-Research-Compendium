import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getSubjectAssignment } from "@/app/facilitator/data";
import { prisma } from "@/lib/prisma";

export default async function SubjectLessonsPage({
  params,
}: {
  params: { classId: string; subjectId: string };
}) {
  const user = await getCurrentUser();
  const assignment = await getSubjectAssignment(user!.id, params.classId, params.subjectId);

  if (!assignment) notFound();

  const lessons = await prisma.lesson.findMany({
    where: { subjectId: params.subjectId, status: "PUBLISHED" },
    include: { blocks: { select: { id: true } } },
    orderBy: { createdAt: "asc" },
  });

  const progressRows = await prisma.lessonProgress.findMany({
    where: { facilitatorId: user!.id, lessonId: { in: lessons.map((l) => l.id) } },
  });
  const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]));
  function statusFor(lessonId: string): "Completed" | "In progress" | "Not started" {
    const p = progressByLesson.get(lessonId);
    if (!p) return "Not started";
    if (p.completedAt) return "Completed";
    // Opening a lesson creates its progress row, so a row alone does not mean any work was done.
    if (p.completedBlockIds.length > 0 || p.currentBlockIndex > 0) return "In progress";
    return "Not started";
  }
  const STATUS_STYLE = {
    Completed: "bg-sage-soft text-[#4f6445]",
    "In progress": "bg-gold-soft text-[#7a6320]",
    "Not started": "bg-bg-2 text-muted",
  } as const;

  return (
    <>
      <p className="mb-1.5 text-[13px] text-muted">
        <Link href="/facilitator" className="hover:text-clay">
          Dashboard
        </Link>{" "}
        ›{" "}
        <Link href={`/facilitator/classes/${params.classId}`} className="hover:text-clay">
          {assignment.class.name}
        </Link>{" "}
        › <span>{assignment.subject.name}</span>
      </p>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">
          {assignment.class.name} · {assignment.subject.name}
        </h1>
        <p className="mt-1 text-[14.5px] text-muted">
          {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          No published lessons yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/facilitator/classes/${params.classId}/subjects/${params.subjectId}/lessons/${lesson.id}`}
              className="flex items-center gap-[18px] rounded-card border border-line bg-surface p-[21px] shadow-paper transition-colors hover:border-clay-line hover:bg-white"
            >
              <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-bg-2">
                <BookOpen className="h-5 w-5 text-muted" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h2 className="text-[15px] font-semibold">{lesson.name}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  {lesson.blocks.length} step{lesson.blocks.length === 1 ? "" : "s"}
                  {lesson.durationMinutes ? ` · ${lesson.durationMinutes} min` : ""}
                </p>
              </div>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[statusFor(lesson.id)]}`}
              >
                {statusFor(lesson.id)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
