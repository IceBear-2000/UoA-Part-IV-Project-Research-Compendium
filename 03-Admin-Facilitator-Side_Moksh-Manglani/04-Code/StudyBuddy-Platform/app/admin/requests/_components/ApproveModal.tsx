"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveRequest } from "../actions";

type ClassOption = { id: string; name: string; subjects: { id: string; name: string }[] };
type StagedAssignment = { classId: string; subjectId: string; className: string; subjectName: string };

export function ApproveModal({
  request,
  classes,
  onClose,
}: {
  request: { id: string; name: string; email: string; requestedClassNote: string | null };
  classes: ClassOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState(classes[0]?.subjects[0]?.id ?? "");
  const [staged, setStaged] = useState<StagedAssignment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ inviteLink: string; emailSent: boolean } | null>(null);

  const subjectsForClass = classes.find((c) => c.id === classId)?.subjects ?? [];

  function handleClassChange(newClassId: string) {
    setClassId(newClassId);
    const firstSubject = classes.find((c) => c.id === newClassId)?.subjects[0];
    setSubjectId(firstSubject?.id ?? "");
  }

  function handleStage() {
    if (!classId || !subjectId) return;
    if (staged.some((s) => s.classId === classId && s.subjectId === subjectId)) return;
    const cls = classes.find((c) => c.id === classId);
    const subj = cls?.subjects.find((s) => s.id === subjectId);
    if (!cls || !subj) return;
    setStaged((prev) => [
      ...prev,
      { classId, subjectId, className: cls.name, subjectName: subj.name },
    ]);
  }

  function handleUnstage(classId: string, subjectId: string) {
    setStaged((prev) => prev.filter((s) => !(s.classId === classId && s.subjectId === subjectId)));
  }

  async function handleApprove() {
    setBusy(true);
    setError(null);
    try {
      const res = await approveRequest(
        request.id,
        staged.map((s) => ({ classId: s.classId, subjectId: s.subjectId })),
      );
      setResult(res);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve this request.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(51,48,42,0.34)]">
        <div className="w-[460px] max-w-[92vw] rounded-2xl border border-line bg-surface p-[26px] shadow-paper-2">
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-sage text-white">
            <Check className="h-6 w-6" strokeWidth={2.5} aria-hidden />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">
            {request.name} is approved
          </h3>
          <p className="mt-1 text-sm text-muted">
            {result.emailSent
              ? "An email with a sign-in link has been sent to them."
              : "Email isn't set up yet. Copy this link and send it to them directly:"}
          </p>
          {!result.emailSent && (
            <div className="mt-3 break-all rounded-input border border-line bg-white p-2.5 text-[12.5px] text-ink">
              {result.inviteLink}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-input bg-clay py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(51,48,42,0.34)]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="w-[430px] max-w-[92vw] rounded-2xl border border-line bg-surface p-[26px] shadow-paper-2">
        <h3 className="text-lg font-semibold tracking-tight">Approve request</h3>
        <p className="mt-1 text-sm text-muted">
          {request.name} · {request.email}
        </p>
        {request.requestedClassNote && (
          <p className="mt-1.5 rounded-input bg-bg-2 px-2.5 py-1.5 text-[13px] text-muted">
            Hoping to help with: {request.requestedClassNote}
          </p>
        )}

        {staged.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
              Granting access to
            </p>
            <div className="flex flex-wrap gap-1.5">
              {staged.map((s) => (
                <span
                  key={`${s.classId}-${s.subjectId}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-clay-soft px-2 py-1 text-[11.5px] font-semibold text-[#8c5538]"
                >
                  {s.className} · {s.subjectName}
                  <button
                    type="button"
                    onClick={() => handleUnstage(s.classId, s.subjectId)}
                    disabled={busy}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-label="Remove" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-input border border-rose bg-rose-soft px-3 py-2 text-sm text-[#946b76]">
            {error}
          </p>
        )}

        <div className="mt-4 flex items-end gap-2">
          <div className="flex-1">
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
          <div className="flex-1">
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
          <button
            type="button"
            onClick={handleStage}
            disabled={!subjectId}
            className="rounded-input border border-line bg-white px-3.5 py-2.5 text-sm font-semibold shadow-paper hover:bg-bg-2"
          >
            + Add
          </button>
        </div>

        <div className="mt-[22px] flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-input border border-line bg-white py-2.5 text-sm font-semibold hover:bg-bg-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={busy}
            className="flex-1 rounded-input bg-clay py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover disabled:opacity-60"
          >
            {busy ? "Approving…" : "Approve & send invite →"}
          </button>
        </div>
      </div>
    </div>
  );
}
