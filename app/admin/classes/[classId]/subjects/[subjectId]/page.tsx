import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Subject" };

export default async function SubjectDetailPage({
  params,
}: {
  params: { classId: string; subjectId: string };
}) {
  const subject = await prisma.subject.findUnique({
    where: { id: params.subjectId },
    include: {
      class: true,
      lessons: {
        include: { blocks: { select: { id: true } } },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!subject || subject.classId !== params.classId) notFound();

  return (
    <>
      <p className="mb-1.5 text-[13px] text-muted">
        <Link href="/admin/classes" className="hover:text-clay">
          Classes
        </Link>{" "}
        ›{" "}
        <Link href={`/admin/classes/${params.classId}`} className="hover:text-clay">
          {subject.class.name}
        </Link>{" "}
        › <span>{subject.name}</span>
      </p>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-bold tracking-tight">
            {subject.class.name} · {subject.name}
          </h1>
          <p className="mt-1 text-[14.5px] text-muted">
            {subject.lessons.length} lesson{subject.lessons.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href={`/admin/lessons/new?subjectId=${subject.id}`}
          className="inline-flex items-center gap-2 rounded-input bg-clay px-[17px] py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover"
        >
          ＋ Create lesson
        </Link>
      </div>

      {subject.lessons.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          No lessons yet. Create the first one for {subject.class.name} · {subject.name}.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {subject.lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/admin/lessons/${lesson.id}`}
              className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-4 shadow-paper transition-colors hover:border-clay-line hover:bg-white"
            >
              <div>
                <strong className="text-sm">{lesson.name}</strong>
                <p className="mt-0.5 text-[13px] text-muted">
                  {lesson.blocks.length} block{lesson.blocks.length === 1 ? "" : "s"}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  lesson.status === "PUBLISHED" ? "bg-sage-soft text-[#5f7355]" : "bg-bg-2 text-muted"
                }`}
              >
                {lesson.status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
