import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function LessonsListPage() {
  const lessons = await prisma.lesson.findMany({
    include: { subject: { include: { class: true } }, blocks: { select: { id: true } } },
    orderBy: { updatedAt: "desc" },
  });

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
          className="inline-flex items-center gap-2 rounded-input bg-clay px-[17px] py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52]"
        >
          ＋ Create lesson
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          No lessons yet — create your first one.
        </div>
      ) : (
        <table className="w-full border-collapse overflow-hidden rounded-card border border-line bg-surface shadow-paper">
          <thead>
            <tr>
              <th className="border-b border-line px-[18px] py-[13px] text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                Lesson
              </th>
              <th className="border-b border-line px-[18px] py-[13px] text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                Class / Subject
              </th>
              <th className="border-b border-line px-[18px] py-[13px] text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                Blocks
              </th>
              <th className="border-b border-line px-[18px] py-[13px] text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                Status
              </th>
              <th className="border-b border-line px-[18px] py-[13px] text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted" />
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="hover:bg-bg">
                <td className="border-b border-line px-[18px] py-3.5 text-sm font-semibold">
                  {lesson.name}
                </td>
                <td className="border-b border-line px-[18px] py-3.5 text-sm">
                  {lesson.subject.class.name} · {lesson.subject.name}
                </td>
                <td className="border-b border-line px-[18px] py-3.5 text-sm text-muted">
                  {lesson.blocks.length}
                </td>
                <td className="border-b border-line px-[18px] py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      lesson.status === "PUBLISHED"
                        ? "bg-sage-soft text-[#5f7355]"
                        : "bg-bg-2 text-muted"
                    }`}
                  >
                    {lesson.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="border-b border-line px-[18px] py-3.5 text-right">
                  <Link
                    href={`/admin/lessons/${lesson.id}`}
                    className="rounded-input border border-line bg-white px-[13px] py-[7px] text-[13px] font-semibold shadow-paper hover:bg-bg-2"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
