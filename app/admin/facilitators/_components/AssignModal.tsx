"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignFacilitator, removeAssignment } from "../actions";

type Assignment = {
  id: string;
  class: { id: string; name: string };
  subject: { id: string; name: string };
};
type ClassOption = { id: string; name: string; subjects: { id: string; name: string }[] };

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
  const [subjectId, setSubjectId] = useState(classes[0]?.subjects[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjectsForClass = classes.find((c) => c.id === classId)?.subjects ?? [];

  function handleClassChange(newClassId: string) {
    setClassId(newClassId);
    const firstSubject = classes.find((c) => c.id === newClassId)?.subjects[0];
    setSubjectId(firstSubject?.id ?? "");
  }

  async function handleAssign() {
    if (!classId || !subjectId) return;
    setBusy(true);
    setError(null);
    try {
      const newAssignment = await assignFacilitator(facilitator.id, classId, subjectId);
      setAssignments((prev) =>
        prev.some((a) => a.id === newAssignment.id) ? prev : [...prev, newAssignment],
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not assign.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(assignmentId: string) {
    setBusy(true);
    setError(null);
    try {
      await removeAssignment(assignmentId);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(51,48,42,0.34)]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[430px] max-w-[92vw] rounded-2xl border border-line bg-surface p-[26px] shadow-paper-2">
        <h3 className="text-lg font-semibold tracking-tight">Assign facilitator</h3>
        <p className="mb-5 mt-1 text-sm text-muted">{facilitator.name}</p>

        {assignments.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
              Current assignments
            </p>
            <div className="flex flex-wrap gap-1.5">
              {assignments.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1.5 rounded-md bg-bg-2 px-2 py-1 text-[11.5px] font-semibold"
                >
                  {a.class.name} · {a.subject.name}
                  <button
                    type="button"
                    onClick={() => handleRemove(a.id)}
                    disabled={busy}
                    title="Remove assignment"
                    className="text-muted hover:text-[#946b76]"
                  >
                    ✕
                  </button>
                </span>
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
            onChange={(e) => handleClassChange(e.target.value)}
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
          <label className="mb-1.5 block text-[13px] font-semibold">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
          >
            {subjectsForClass.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
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
            onClick={handleAssign}
            disabled={busy || !subjectId}
            className="flex-1 rounded-input bg-clay py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52] disabled:opacity-60"
          >
            {busy ? "Working…" : "Assign →"}
          </button>
        </div>
      </div>
    </div>
  );
}
