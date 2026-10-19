"use client";

import { useFormStatus } from "react-dom";

// useFormStatus only sees pending state from inside the <form> it belongs
// to, so this has to be its own component rather than living in the form's
// own component. Without it, a fast double-click submits a form twice —
// which is exactly how a duplicate lesson slipped in earlier this project.
export function SubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "mt-1.5 rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {pending ? (pendingLabel ?? "Working…") : label}
    </button>
  );
}
