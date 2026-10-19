"use client";

import { useState } from "react";

export function MessageComposer({ onSend }: { onSend: (body: string) => Promise<void> }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onSend(trimmed);
      setBody("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2.5 border-t border-line px-[18px] py-3.5">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Write a message…"
        autoComplete="off"
        className="flex-1 rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={busy || !body.trim()}
        className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "…" : "Send"}
      </button>
    </div>
  );
}
