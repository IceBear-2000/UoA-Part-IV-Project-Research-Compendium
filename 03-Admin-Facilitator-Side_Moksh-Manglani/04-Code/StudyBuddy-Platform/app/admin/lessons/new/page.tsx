import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createLesson } from "../actions";
import { LessonForm } from "../_components/LessonForm";

export const metadata = { title: "Create lesson" };

export default async function NewLessonPage({
  searchParams,
}: {
  searchParams: { error?: string; subjectId?: string };
}) {
  const classes = await prisma.class.findMany({
    include: { subjects: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <p className="mb-1.5 text-[13px] text-muted">
        <Link href="/admin/lessons" className="hover:text-clay">
          Lessons
        </Link>{" "}
        › <span>New lesson</span>
      </p>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">
          Create lesson
        </h1>
        <p className="mt-1 text-[14.5px] text-muted">
          Add blocks one by one after you save, or import them from a spreadsheet now.
        </p>
      </div>

      <div className="max-w-[420px]">
        <LessonForm
          classes={classes}
          initialValues={
            searchParams?.subjectId
              ? {
                  name: "",
                  subjectId: searchParams.subjectId,
                  durationMinutes: null,
                  description: null,
                  learningObjectives: null,
                }
              : undefined
          }
          action={createLesson}
          errorMessage={searchParams?.error}
          submitLabel="Create lesson →"
          allowImport
        />
      </div>
    </>
  );
}
