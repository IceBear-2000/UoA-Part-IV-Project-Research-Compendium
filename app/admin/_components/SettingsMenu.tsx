"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings, ChevronRight, ExternalLink } from "lucide-react";
import { PreferenceToggles } from "./PreferenceToggles";

const PROJECT_DOCS = [
  {
    href: "https://claude.ai/code/artifact/da6af19a-7817-48da-8464-677f82935067",
    label: "Design exploration",
  },
  {
    href: "https://claude.ai/code/artifact/e03fd1cd-34b6-45db-b82e-a9e1aa88906d",
    label: "Worksheet generator spec",
  },
] as const;

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

          <p className="mb-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Project docs
          </p>
          {PROJECT_DOCS.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-[9px] px-2.5 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-bg-2"
            >
              {doc.label}
              <ExternalLink className="h-3.5 w-3.5 text-muted" strokeWidth={2} />
            </a>
          ))}

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
