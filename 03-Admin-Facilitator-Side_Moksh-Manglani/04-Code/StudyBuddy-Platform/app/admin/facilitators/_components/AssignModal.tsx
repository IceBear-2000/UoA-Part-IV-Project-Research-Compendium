"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { syncClassAssignments } from "../actions";

type Assignment = {
  id: string;
  class: { id: string; name: string };
  subject: { id: string; name: string };
};
type ClassOption = { id: string; name: string; subjects: { id: string; name: string }[] };

function subjectIdsForClass(assignments: Assignment[], classId: string): Set<string> {
  return new Set(assignments.filter((a) => a.class.id === classId).map((a) => a.subject.id));
}

export function AssignModal({
  facilitator,
  classes,
  onClose,
}: {
  facilitator: { id: string; name: string; assignments: Assignment[] };
  classes: ClassOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [assignments, setAssignments] = useState(facilitator.assignments);
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const subjectsForClass = classes.find((c) => c.id === classId)?.subjects ?? [];

  // Re-derive the checklist whenever the selected class changes: if the
  // facilitator already has some subjects assigned for it, show exactly
  // that (don't silently re-grant or revoke anything); if this class is
  // untouched so far, default to the whole suite checked.
  useEffect(() => {
    const existing = subjectIdsForClass(assignments, classId);
    if (existing.size > 0) {
      setChecked(existing);
    } else {
      setChecked(new Set(classes.find((c) => c.id === classId)?.subjects.map((s) => s.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  function toggleSubject(subjectId: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      const updated = await syncClassAssignments(facilitator.id, classId, Array.from(checked));
      setAssignments(updated);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  // Revoke every subject in one class. Two clicks, no pop-up: the first click arms the button.
  async function handleRemoveClass(removeClassId: string) {
    if (confirmRemove !== removeClassId) {
      setConfirmRemove(removeClassId);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await syncClassAssignments(facilitator.id, removeClassId, []);
      setAssignments(updated);
      setConfirmRemove(null);
      if (removeClassId === classId) setChecked(new Set());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove access.");
    } finally {
      setBusy(false);
    }
  }

  const grouped = Array.from(new Map(assignments.map((a) => [a.class.id, a.class.name])).entries()).map(
    ([id, name]) => ({
      id,
      name,
      subjects: assignments.filter((a) => a.class.id === id).map((a) => a.subject.name),
    }),
  );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(51,48,42,0.34)]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[440px] max-w-[92vw] rounded-2xl border border-line bg-surface p-[26px] shadow-paper-2">
        <h3 className="text-lg font-semibold tracking-tight">Manage access</h3>
        <p className="mb-5 mt-1 text-sm text-muted">{facilitator.name}</p>

        {grouped.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
              Current access
            </p>
            <div className="flex flex-col gap-1.5">
              {grouped.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between gap-2 rounded-input bg-bg-2 px-2.5 py-1.5 text-[12.5px]"
                >
                  <span>
                    <strong className="font-semibold">{g.name}</strong>
                    <span className="text-muted">: {g.subjects.join(", ")}</span>
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRemoveClass(g.id)}
                    onBlur={() => setConfirmRemove(null)}
                    className={`flex-shrink-0 rounded-md px-2 py-0.5 text-[12px] font-semibold transition-colors ${
                      confirmRemove === g.id
                        ? "bg-[#a85a69] text-white"
                        : "text-[#8a4b58] hover:bg-rose-soft"
                    }`}
                  >
                    {confirmRemove === g.id ? "Click again to remove" : "Remove access"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-input border border-rose bg-rose-soft px-3 py-2 text-sm text-[#946b76]">
            {error}
          </p>
        )}

        <div className="mb-3.5">
          <label className="mb-1.5 block text-[13px] font-semibold">Class / Grade</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">
            Subjects
            <span className="ml-1.5 rounded-[5px] bg-bg-2 px-[7px] py-[2px] text-[11px] font-medium text-muted">
              All included by default
            </span>
          </label>
          {subjectsForClass.length === 0 ? (
            <p className="rounded-input border border-dashed border-line p-3 text-[13px] text-muted">
              This class has no subjects yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {subjectsForClass.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2.5 rounded-input border border-line bg-white px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(s.id)}
                    onChange={() => toggleSubject(s.id)}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-[22px] flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-input border border-line bg-white py-2.5 text-sm font-semibold hover:bg-bg-2"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || subjectsForClass.length === 0}
            className="flex-1 rounded-input bg-clay py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover disabled:opacity-60"
          >
            {busy ? "Saving…" : `Save ${classes.find((c) => c.id === classId)?.name ?? ""} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
