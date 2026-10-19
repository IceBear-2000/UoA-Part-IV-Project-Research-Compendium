import { Check, CalendarCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getSubjectAssignment } from "@/app/facilitator/data";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Lesson complete" };

export default async function LessonCompletePage({
  params,
}: {
  params: { classId: string; subjectId: string; lessonId: string };
}) {
  const user = await getCurrentUser();
  const assignment = await getSubjectAssignment(user!.id, params.classId, params.subjectId);
  if (!assignment) notFound();

  const lesson = await prisma.lesson.findUnique({ where: { id: params.lessonId } });
  if (!lesson || lesson.status !== "PUBLISHED" || lesson.subjectId !== params.subjectId) {
    notFound();
  }

  const progress = await prisma.lessonProgress.findUnique({
    where: { facilitatorId_lessonId: { facilitatorId: user!.id, lessonId: lesson.id } },
  });

  // Can't show a completion screen for a lesson that isn't actually
  // finished — send them back into the flow instead of faking it.
  if (!progress?.completedAt) {
    redirect(
      `/facilitator/classes/${params.classId}/subjects/${params.subjectId}/lessons/${params.lessonId}`,
    );
  }

  return (
    <div className="grid min-h-[70vh] place-items-center text-center">
      <div className="max-w-[460px] rounded-2xl border border-line bg-surface p-11 shadow-paper">
        <div className="mx-auto mb-6 grid h-[90px] w-[90px] place-items-center rounded-full bg-sage text-white">
          <Check className="h-11 w-11" strokeWidth={2.5} aria-hidden />
        </div>
        <h1 className="text-[25px] font-bold tracking-tight">Lesson complete</h1>
        <p className="mt-2 text-[15px] text-muted">
          Thank you for your time, {user?.name?.split(" ")[0]}.
          <br />
          {assignment.class.name} · {assignment.subject.name} · {lesson.name}
        </p>
        <div className="my-[22px] flex items-center gap-3.5 rounded-card bg-bg p-4 text-left">
          <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-sage-soft">
            <CalendarCheck className="h-5 w-5 text-[#4f6445]" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <strong className="text-sm">Marked complete</strong>
            <p className="mt-0.5 text-sm text-muted">
              {progress.completedAt!.toLocaleDateString("en-NZ", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              ·{" "}
              {progress.completedAt!.toLocaleTimeString("en-NZ", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <p className="mb-5 text-sm text-muted">
          This lesson is now unlocked for free navigation. Revisit any step
          anytime.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href={`/facilitator/classes/${params.classId}/subjects/${params.subjectId}/lessons/${params.lessonId}`}
            className="rounded-input border border-line bg-white px-4 py-2.5 text-sm font-semibold shadow-paper hover:bg-bg-2"
          >
            Review lesson
          </Link>
          <Link
            href={`/facilitator/classes/${params.classId}/subjects/${params.subjectId}`}
            className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover"
          >
            Back to lessons →
          </Link>
        </div>
      </div>
    </div>
  );
}
