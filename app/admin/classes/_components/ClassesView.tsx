"use client";

import { useState } from "react";
import { createClass, createSubject } from "../actions";

type ClassData = {
  id: string;
  name: string;
  subjects: { id: string; name: string }[];
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

function AddSubjectControl({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add subject.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-dashed border-line px-2 py-1 text-[11.5px] font-semibold text-muted hover:border-clay hover:text-clay"
      >
        + Add subject
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="e.g. English"
          className="w-40 rounded-input border border-line bg-white px-2 py-[7px] text-[12.5px]"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !name.trim()}
          className="rounded-input bg-clay px-[10px] py-[7px] text-[12.5px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={busy}
          className="text-[12.5px] font-semibold text-muted"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-[11.5px] text-[#946b76]">{error}</p>}
    </div>
  );
}

export function ClassesView({ classes }: { classes: ClassData[] }) {
  return (
    <div className="max-w-[640px]">
      <AddClassForm />

      {classes.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          No classes yet — add one above to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {classes.map((c) => (
            <div key={c.id} className="rounded-card border border-line bg-surface p-5 shadow-paper">
              <h3 className="mb-3 text-base font-semibold">{c.name}</h3>
              <div className="flex flex-wrap items-center gap-1.5">
                {c.subjects.map((s) => (
                  <span key={s.id} className="rounded-md bg-bg-2 px-2 py-1 text-[11.5px] font-semibold">
                    {s.name}
                  </span>
                ))}
                <AddSubjectControl classId={c.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
