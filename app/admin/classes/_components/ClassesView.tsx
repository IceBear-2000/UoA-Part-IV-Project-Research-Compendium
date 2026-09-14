"use client";

import { useState } from "react";
import Link from "next/link";
import { createClass } from "../actions";

type ClassData = {
  id: string;
  name: string;
  subjectCount: number;
  lessonCount: number;
};

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
    <div className="mb-6 rounded-card border border-line bg-surface p-5 shadow-paper">
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
  return (
    <div className="max-w-[820px]">
      <AddClassForm />

      {classes.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          No classes yet — add one above to get started.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[18px]">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/admin/classes/${c.id}`}
              className="rounded-card border border-line bg-surface p-[21px] shadow-paper transition-colors hover:border-clay-line hover:bg-white"
            >
              <div className="mb-2.5 grid h-11 w-11 place-items-center rounded-xl bg-clay-soft text-xl">
                🏫
              </div>
              <h3 className="text-base font-semibold">{c.name}</h3>
              <p className="mt-1 text-[13px] text-muted">
                {c.subjectCount} subject{c.subjectCount === 1 ? "" : "s"} · {c.lessonCount} lesson
                {c.lessonCount === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
