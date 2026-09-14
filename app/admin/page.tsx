import Link from "next/link";
import { School, BookOpen, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SignupRequestStatus } from "@prisma/client";

export default async function AdminHome() {
  const user = await getCurrentUser();
  const [
    lessonCount,
    publishedCount,
    draftCount,
    pendingRequestCount,
    facilitatorCount,
    recentLessons,
  ] = await Promise.all([
    prisma.lesson.count(),
    prisma.lesson.count({ where: { status: "PUBLISHED" } }),
    prisma.lesson.count({ where: { status: "DRAFT" } }),
    prisma.signupRequest.count({ where: { status: SignupRequestStatus.PENDING } }),
    prisma.user.count({ where: { role: "FACILITATOR" } }),
    prisma.lesson.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { subject: { include: { class: true } } },
    }),
  ]);

  const stats = [
    { label: "Total lessons", value: lessonCount },
    { label: "Published", value: publishedCount },
    { label: "Draft", value: draftCount },
    { label: "Pending requests", value: pendingRequestCount },
    { label: "Facilitators", value: facilitatorCount },
  ];

  const quickLinks = [
    { href: "/admin/classes", icon: School, label: "Classes", description: "Browse grades and subjects" },
    { href: "/admin/lessons", icon: BookOpen, label: "Lessons", description: "View, edit, and publish all lessons" },
    { href: "/admin/facilitators", icon: Users, label: "Facilitators", description: "See assignments and reach out" },
  ];

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

      <div className="grid grid-cols-5 gap-[14px]">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card border border-line bg-surface p-[18px] shadow-paper">
            <div className="text-[25px] font-bold tracking-tight">{s.value}</div>
            <div className="mt-0.5 text-[12.5px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-7 grid grid-cols-3 gap-[14px]">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3.5 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-clay-line hover:bg-white"
            >
              <div className="grid h-[38px] w-[38px] flex-shrink-0 place-items-center rounded-[10px] bg-clay-soft">
                <Icon className="h-[18px] w-[18px] text-[#8c5538]" strokeWidth={2} />
              </div>
              <div>
                <strong className="text-[14.5px]">{link.label}</strong>
                <p className="mt-0.5 text-sm text-muted">{link.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="mb-3.5 text-[12px] font-semibold uppercase tracking-wide text-muted">
          Recently updated
        </p>
        {recentLessons.length === 0 ? (
          <div className="rounded-card border border-dashed border-line p-8 text-center text-muted">
            No lessons yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/admin/lessons/${lesson.id}`}
                className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-4 shadow-paper transition-colors hover:border-clay-line hover:bg-white"
              >
                <div>
                  <strong className="text-sm">{lesson.name}</strong>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {lesson.subject.class.name} · {lesson.subject.name}
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
      </div>
    </>
  );
}
