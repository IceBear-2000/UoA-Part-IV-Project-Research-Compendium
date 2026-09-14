"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LessonStatus } from "@prisma/client";

type LessonRow = {
  id: string;
  name: string;
  status: LessonStatus;
  blockCount: number;
  className: string;
  subjectName: string;
};

type StatusFilter = "all" | "DRAFT" | "PUBLISHED";

function StatusBadge({ status }: { status: LessonStatus }) {
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
        status === "PUBLISHED" ? "bg-sage-soft text-[#5f7355]" : "bg-bg-2 text-muted"
      }`}
    >
      {status === "PUBLISHED" ? "Published" : "Draft"}
    </span>
  );
}

export function LessonsView({ lessons }: { lessons: LessonRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return lessons.filter((l) => {
      const matchesSearch = !term || l.name.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [lessons, search, statusFilter]);

  const groups = useMemo(() => {
    const map = new Map<string, { className: string; subjectName: string; lessons: LessonRow[] }>();
    for (const lesson of filtered) {
      const key = `${lesson.className}::${lesson.subjectName}`;
      if (!map.has(key)) {
        map.set(key, { className: lesson.className, subjectName: lesson.subjectName, lessons: [] });
      }
      map.get(key)!.lessons.push(lesson);
    }
    return Array.from(map.values()).sort(
      (a, b) =>
        a.className.localeCompare(b.className) || a.subjectName.localeCompare(b.subjectName),
    );
  }, [filtered]);

  function toggleGroup(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search lessons…"
          className="w-64 rounded-input border border-line bg-white px-3 py-2 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
        />
        <div className="inline-flex rounded-[9px] bg-bg-2 p-[3px]">
          {(["all", "DRAFT", "PUBLISHED"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`rounded-[7px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                statusFilter === f ? "bg-surface text-ink shadow-paper" : "text-muted"
              }`}
            >
              {f === "all" ? "All" : f === "DRAFT" ? "Draft" : "Published"}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          No lessons match your search.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => {
            const key = `${group.className}::${group.subjectName}`;
            const isCollapsed = collapsed.has(key);
            return (
              <div key={key} className="rounded-card border border-line bg-surface shadow-paper">
                <button
                  type="button"
                  onClick={() => toggleGroup(key)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-3.5"
                >
                  <span className="text-sm font-semibold">
                    {group.className} · {group.subjectName}
                    <span className="ml-2 rounded-md bg-bg-2 px-2 py-0.5 text-[11.5px] font-semibold text-muted">
                      {group.lessons.length}
                    </span>
                  </span>
                  <span className="text-muted">{isCollapsed ? "▸" : "▾"}</span>
                </button>

                {!isCollapsed && (
                  <div className="border-t border-line">
                    {group.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/admin/lessons/${lesson.id}`}
                        className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 last:border-b-0 hover:bg-bg"
                      >
                        <div>
                          <strong className="text-sm">{lesson.name}</strong>
                          <p className="mt-0.5 text-[12.5px] text-muted">
                            {lesson.blockCount} block{lesson.blockCount === 1 ? "" : "s"}
                          </p>
                        </div>
                        <StatusBadge status={lesson.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
