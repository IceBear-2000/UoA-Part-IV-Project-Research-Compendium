import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminHome() {
  const user = await getCurrentUser();
  const [lessonCount, publishedCount] = await Promise.all([
    prisma.lesson.count(),
    prisma.lesson.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-bold tracking-tight">
            Admin overview
          </h1>
          <p className="mt-1 text-[14.5px] text-muted">
            Welcome back, {user?.name}
          </p>
        </div>
        <Link
          href="/admin/lessons/new"
          className="inline-flex items-center gap-2 rounded-input bg-clay px-[17px] py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52]"
        >
          ＋ Create lesson
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-[18px]">
        <div className="rounded-card border border-line bg-surface p-[21px] shadow-paper">
          <div className="text-[29px] font-bold tracking-tight">
            {lessonCount}
          </div>
          <div className="mt-0.5 text-[13px] text-muted">Total lessons</div>
        </div>
        <div className="rounded-card border border-line bg-surface p-[21px] shadow-paper">
          <div className="text-[29px] font-bold tracking-tight">
            {publishedCount}
          </div>
          <div className="mt-0.5 text-[13px] text-muted">Published</div>
        </div>
      </div>

      <Link
        href="/admin/lessons"
        className="mt-7 flex items-center gap-3.5 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-clay-line hover:bg-white"
      >
        <div className="grid h-[38px] w-[38px] flex-shrink-0 place-items-center rounded-[10px] bg-clay-soft text-lg">
          🧩
        </div>
        <div>
          <strong className="text-[14.5px]">Manage lessons</strong>
          <p className="mt-0.5 text-sm text-muted">
            View, edit, and publish all lessons
          </p>
        </div>
      </Link>
    </>
  );
}
