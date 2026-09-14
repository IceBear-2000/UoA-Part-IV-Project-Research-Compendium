"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings, ChevronRight } from "lucide-react";
import { PreferenceToggles } from "./PreferenceToggles";

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Display settings"
        className={`grid h-9 w-9 place-items-center rounded-[9px] text-muted transition-colors hover:bg-bg-2 hover:text-ink ${
          open ? "bg-bg-2 text-ink" : ""
        }`}
      >
        <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] rounded-card border border-line bg-surface p-3.5 shadow-paper-2">
          <p className="mb-2.5 px-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Display
          </p>
          <PreferenceToggles />

          <div className="my-3 border-t border-line" />

          <Link
            href="/admin/settings"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-2 rounded-[9px] px-2.5 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:bg-bg-2"
          >
            Advanced settings
            <ChevronRight className="h-4 w-4 text-muted" strokeWidth={2} />
          </Link>
        </div>
      )}
    </div>
  );
}
