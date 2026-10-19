import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LessonStatus } from "@prisma/client";
import { updateLesson, togglePublish } from "../actions";
import { LessonForm } from "../_components/LessonForm";
import { LessonFlowEditor } from "./_components/LessonFlowEditor";

export default async function EditLessonPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; saved?: string };
}) {
  const [lesson, classes] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: params.id },
      include: { subject: true, blocks: { orderBy: { order: "asc" } } },
    }),
    prisma.class.findMany({
      include: { subjects: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!lesson) notFound();

  const isPublished = lesson.status === "PUBLISHED";

  return (
    <>
      <Link href="/admin/lessons" className="mb-3 inline-flex items-center gap-1.5 rounded-input border border-line bg-surface px-3 py-1.5 text-[13px] font-semibold shadow-paper transition-colors hover:bg-bg-2">
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to lessons
      </Link>
      <p className="mb-1.5 text-[13px] text-muted">
        <Link href="/admin/lessons" className="hover:text-clay">
          Lessons
        </Link>{" "}
        › <span>{lesson.name}</span>
      </p>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-bold tracking-tight">
            {lesson.name}
          </h1>
          <p className="mt-1 text-[14.5px] text-muted">
            {lesson.blocks.length} block{lesson.blocks.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
              isPublished ? "bg-sage-soft text-[#5f7355]" : "bg-bg-2 text-muted"
            }`}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
          <Link
            href={`/admin/lessons/${lesson.id}/worksheet-generator`}
            className="rounded-input border border-line bg-white px-4 py-2 text-sm font-semibold shadow-paper hover:bg-bg-2"
          >
            ✨ Generate AI worksheet
          </Link>
          <form
            action={togglePublish.bind(
              null,
              lesson.id,
              isPublished ? LessonStatus.DRAFT : LessonStatus.PUBLISHED,
            )}
          >
            <button
              type="submit"
              className="rounded-input border border-line bg-white px-4 py-2 text-sm font-semibold shadow-paper hover:bg-bg-2"
            >
              {isPublished ? "Unpublish" : "Publish"}
            </button>
          </form>
        </div>
      </div>

      {searchParams?.saved && (
        <p className="mb-4 rounded-input border border-sage bg-sage-soft px-3 py-2 text-sm text-[#5f7355]">
          Saved.
        </p>
      )}

      <div className="grid grid-cols-[1fr_318px] items-start gap-[25px]">
        <div>
          <p className="mb-3.5 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Lesson flow
          </p>
          <LessonFlowEditor lessonId={lesson.id} initialBlocks={lesson.blocks} />
        </div>

        <LessonForm
          classes={classes}
          initialValues={{
            name: lesson.name,
            subjectId: lesson.subjectId,
            durationMinutes: lesson.durationMinutes,
            description: lesson.description,
            learningObjectives: lesson.learningObjectives,
          }}
          action={updateLesson.bind(null, lesson.id)}
          errorMessage={searchParams?.error}
          submitLabel="Save changes"
        />
      </div>
    </>
  );
}
