"use client";

import { useState } from "react";
import Link from "next/link";
import { createSubject } from "../../actions";

type SubjectData = { id: string; name: string; lessonCount: number };

function AddSubjectForm({ classId }: { classId: string }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createSubject(classId, name);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add subject.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 rounded-card border border-line bg-surface p-5 shadow-paper">
      <label className="mb-1.5 block text-[13px] font-semibold">Add a subject</label>
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
          placeholder="e.g. English"
          className="flex-1 rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !name.trim()}
          className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Adding…" : "+ Add subject"}
        </button>
      </div>
      {error && <p className="mt-2 text-[12.5px] text-[#946b76]">{error}</p>}
    </div>
  );
}

export function SubjectsView({ classId, subjects }: { classId: string; subjects: SubjectData[] }) {
  return (
    <div className="max-w-[820px]">
      <AddSubjectForm classId={classId} />

      {subjects.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          No subjects yet — add one above to get started.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[18px]">
          {subjects.map((s) => (
            <Link
              key={s.id}
              href={`/admin/classes/${classId}/subjects/${s.id}`}
              className="rounded-card border border-line bg-surface p-[21px] shadow-paper transition-colors hover:border-clay-line hover:bg-white"
            >
              <div className="mb-2.5 grid h-11 w-11 place-items-center rounded-xl bg-sage-soft text-xl">
                📘
              </div>
              <h3 className="text-base font-semibold">{s.name}</h3>
              <p className="mt-1 text-[13px] text-muted">
                {s.lessonCount} lesson{s.lessonCount === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
