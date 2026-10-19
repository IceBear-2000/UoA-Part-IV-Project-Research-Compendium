import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LessonsView } from "./_components/LessonsView";

export const metadata = { title: "Lessons" };

export default async function LessonsListPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const lessons = await prisma.lesson.findMany({
    include: { subject: { include: { class: true } }, blocks: { select: { id: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const rows = lessons.map((lesson) => ({
    id: lesson.id,
    name: lesson.name,
    status: lesson.status,
    blockCount: lesson.blocks.length,
    className: lesson.subject.class.name,
    subjectName: lesson.subject.name,
    curriculum: lesson.subject.class.curriculum,
  }));

  return (
    <>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-bold tracking-tight">Lessons</h1>
          <p className="mt-1 text-[14.5px] text-muted">
            {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/lessons/new"
          className="inline-flex items-center gap-2 rounded-input bg-clay px-[17px] py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover"
        >
          ＋ Create lesson
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          No lessons yet. Create your first one.
        </div>
      ) : (
        <LessonsView
          lessons={rows}
          initialStatus={searchParams.status === "DRAFT" ? "DRAFT" : "all"}
        />
      )}
    </>
  );
}
