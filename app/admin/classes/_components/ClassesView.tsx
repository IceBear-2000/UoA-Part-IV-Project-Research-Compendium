"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Curriculum } from "@prisma/client";
import { createClass } from "../actions";
import { ClassBanner } from "@/lib/class-banner";

type ClassData = {
  id: string;
  name: string;
  curriculum: Curriculum;
  subjectCount: number;
  lessonCount: number;
  bannerUrl: string | null;
};

type CurriculumFilter = "all" | Curriculum;

const CURRICULUM_LABEL: Record<Curriculum, string> = { NCERT: "NCERT", NZC: "NZC" };

function AddClassForm() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createClass(name);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add class.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 max-w-[480px] rounded-card border border-line bg-surface p-5 shadow-paper">
      <label className="mb-1.5 block text-[13px] font-semibold">Add a class</label>
      <div className="flex gap-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="e.g. Grade 3"
          className="flex-1 rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !name.trim()}
          className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Adding…" : "+ Add class"}
        </button>
      </div>
      {error && <p className="mt-2 text-[12.5px] text-[#946b76]">{error}</p>}
    </div>
  );
}

export function ClassesView({ classes }: { classes: ClassData[] }) {
  const [filter, setFilter] = useState<CurriculumFilter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? classes : classes.filter((c) => c.curriculum === filter)),
    [classes, filter],
  );

  return (
    <div>
      <AddClassForm />

      <div className="mb-5 flex items-center gap-2.5">
        <span className="text-[12.5px] font-semibold text-muted">Sort classes by</span>
        <div className="inline-flex rounded-[9px] bg-bg-2 p-[3px]">
          {(["all", "NCERT", "NZC"] as CurriculumFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-[7px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                filter === f ? "bg-surface text-ink shadow-paper" : "text-muted"
              }`}
            >
              {f === "all" ? "All" : CURRICULUM_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          {classes.length === 0
            ? "No classes yet — add one above to get started."
            : "No classes match this filter."}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[18px]">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/admin/classes/${c.id}`}
              className="overflow-hidden rounded-card border border-line bg-surface shadow-paper transition-colors hover:border-clay-line hover:shadow-paper-2"
            >
              <div className="relative aspect-[5/2] w-full overflow-hidden bg-bg-2">
                {c.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.bannerUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ClassBanner classId={c.id} className="h-full w-full" />
                )}
                <span className="absolute right-2.5 top-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-ink shadow-paper">
                  {CURRICULUM_LABEL[c.curriculum]}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold">{c.name}</h3>
                <p className="mt-1 text-[13px] text-muted">
                  {c.subjectCount} subject{c.subjectCount === 1 ? "" : "s"} · {c.lessonCount} lesson
                  {c.lessonCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
