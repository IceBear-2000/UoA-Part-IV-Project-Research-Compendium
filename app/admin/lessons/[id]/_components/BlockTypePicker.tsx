"use client";

import { useState } from "react";
import type { BlockType } from "@prisma/client";
import { BLOCK_META, BLOCK_TYPES } from "@/lib/block-meta";

export function BlockTypePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: BlockType) => void;
}) {
  const [showInfo, setShowInfo] = useState(false);

  if (!open) return null;

  function handleClose() {
    setShowInfo(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(51,48,42,0.34)]"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-[520px] max-w-[92vw] rounded-2xl border border-line bg-surface p-[26px] shadow-paper-2">
        <div className="mb-[18px] flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Add a block</h3>
            <p className="mt-1 text-sm text-muted">
              {showInfo ? "What each block type is for" : "Choose what to add to the lesson flow"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowInfo((prev) => !prev)}
            title="What do these mean?"
            aria-label="What do these mean?"
            className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border text-sm font-bold transition-colors ${
              showInfo
                ? "border-clay bg-clay text-white"
                : "border-line bg-white text-muted hover:border-clay-line hover:text-clay"
            }`}
          >
            ?
          </button>
        </div>

        {showInfo ? (
          <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto pr-1">
            {BLOCK_TYPES.map((type) => {
              const meta = BLOCK_META[type];
              return (
                <div
                  key={type}
                  className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3"
                >
                  <div
                    className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-[9px] text-base ${meta.soft}`}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <strong className="text-sm">{meta.label}</strong>
                    <p className="mt-0.5 text-[13px] leading-snug text-muted">
                      {meta.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {BLOCK_TYPES.map((type) => {
              const meta = BLOCK_META[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onPick(type)}
                  className="rounded-xl border border-line bg-surface p-[13px] text-center transition-colors hover:border-clay-line hover:bg-white"
                >
                  <div
                    className={`mx-auto mb-2 grid h-9 w-9 place-items-center rounded-[9px] text-[17px] ${meta.soft}`}
                  >
                    {meta.icon}
                  </div>
                  <small className="text-xs font-semibold">{meta.label}</small>
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => (showInfo ? setShowInfo(false) : handleClose())}
          className="mt-5 w-full rounded-input border border-line bg-white py-2.5 text-sm font-semibold hover:bg-bg-2"
        >
          {showInfo ? "← Back" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
