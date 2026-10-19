"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function PitchExpand({ fullPitch }: { fullPitch: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-clay hover:underline"
      >
        {open ? "Hide the full pitch" : "Read the full pitch"}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3.5 rounded-card border border-line bg-surface p-[22px] shadow-paper">
          {fullPitch.map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-ink">
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
