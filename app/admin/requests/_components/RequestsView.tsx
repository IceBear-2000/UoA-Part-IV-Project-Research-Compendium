"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/format";
import { rejectRequest } from "../actions";
import { ApproveModal } from "./ApproveModal";

type Request = {
  id: string;
  name: string;
  email: string;
  requestedClassNote: string | null;
  createdAt: Date;
};
type ClassOption = { id: string; name: string; subjects: { id: string; name: string }[] };

function RejectControl({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleReject() {
    setBusy(true);
    try {
      await rejectRequest(requestId, reason);
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-input border border-line bg-white px-[13px] py-[7px] text-[13px] font-semibold shadow-paper hover:bg-bg-2"
      >
        Reject
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="w-40 rounded-input border border-line bg-white px-2 py-[7px] text-[12.5px]"
      />
      <button
        type="button"
        onClick={handleReject}
        disabled={busy}
        className="rounded-input bg-[#946b76] px-[10px] py-[7px] text-[12.5px] font-semibold text-white disabled:opacity-60"
      >
        {busy ? "…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        disabled={busy}
        className="text-[12.5px] font-semibold text-muted"
      >
        Cancel
      </button>
    </div>
  );
}

export function RequestsView({
  requests,
  classes,
}: {
  requests: Request[];
  classes: ClassOption[];
}) {
  const [approving, setApproving] = useState<Request | null>(null);

  // The empty state and the modal are rendered independently of each other —
  // approving a request triggers router.refresh(), which drops this request
  // out of the `requests` prop (it's no longer PENDING). If the modal were
  // gated behind `requests.length === 0`, that refresh would unmount it out
  // from under the admin before they could see/copy the invite link.
  return (
    <>
      {requests.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          No pending requests right now.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 rounded-card border border-line bg-surface p-[18px] shadow-paper"
            >
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <strong className="text-sm">{r.name}</strong>
                  <span className="text-xs text-muted">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="text-sm text-muted">{r.email}</p>
                {r.requestedClassNote && (
                  <p className="mt-1 text-[12.5px] text-muted">
                    Hoping to help with: <strong className="text-ink">{r.requestedClassNote}</strong>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setApproving(r)}
                  className="rounded-input bg-clay px-[13px] py-[7px] text-[13px] font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52]"
                >
                  Approve
                </button>
                <RejectControl requestId={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {approving && (
        <ApproveModal request={approving} classes={classes} onClose={() => setApproving(null)} />
      )}
    </>
  );
}
