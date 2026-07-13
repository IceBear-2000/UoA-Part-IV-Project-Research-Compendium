"use client";

import { useState } from "react";
import { generateWorksheetAction } from "../actions";
import type { WorksheetResult } from "@/lib/worksheet-generator";

const inputClasses =
  "w-full rounded-input border border-line bg-white px-3 py-2 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft";

export function WorksheetGeneratorView() {
  const [topic, setTopic] = useState("Counting to 20");
  const [classGrade, setClassGrade] = useState("Grade 1");
  const [subject, setSubject] = useState("Maths");
  const [numQuestions, setNumQuestions] = useState(8);
  const [styleNotes, setStyleNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<WorksheetResult | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function handleGenerate() {
    setBusy(true);
    setCopyState("idle");
    const formData = new FormData();
    formData.set("topic", topic);
    formData.set("classGrade", classGrade);
    formData.set("subject", subject);
    formData.set("numQuestions", String(numQuestions));
    formData.set("styleNotes", styleNotes);
    try {
      setResult(await generateWorksheetAction(formData));
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    const text = [result.title, result.subtitle, "", ...result.questions.map((q, i) => `${i + 1}. ${q}`)].join(
      "\n",
    );
    // Clipboard writes can be refused (unfocused document, no permission,
    // insecure context) — that's a normal outcome to handle, not a crash.
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 1500);
  }

  return (
    <div className="grid grid-cols-2 items-start gap-5">
      <div className="rounded-card border border-line bg-surface p-[22px] shadow-paper">
        <h2 className="mb-4 text-base font-semibold">Generate</h2>
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold">Topic</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold">Class / Grade</label>
            <input
              value={classGrade}
              onChange={(e) => setClassGrade(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold">Number of questions</label>
            <input
              type="number"
              min={1}
              max={20}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value) || 1)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold">
              Style / notes
              <span className="ml-1.5 rounded-[5px] bg-bg-2 px-[7px] py-[2px] text-[11px] font-medium text-muted">
                Optional
              </span>
            </label>
            <textarea
              value={styleNotes}
              onChange={(e) => setStyleNotes(e.target.value)}
              placeholder="e.g. visual, picture-based, simple language"
              rows={3}
              className={inputClasses}
            />
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={busy || !topic.trim()}
            className="mt-1.5 rounded-input bg-clay px-4 py-2.5 text-center text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Generating…" : "✨ Generate worksheet"}
          </button>
        </div>
      </div>

      <div className="rounded-card border border-line bg-surface p-[22px] shadow-paper">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Preview</h2>
          {result && (
            <span className="rounded-md bg-gold-soft px-2.5 py-1 text-[11.5px] font-semibold text-[#8d7426]">
              Draft
            </span>
          )}
        </div>

        {!result ? (
          <div className="grid h-[220px] place-items-center rounded-input border border-dashed border-line text-sm text-muted">
            Generate a worksheet to see a preview
          </div>
        ) : (
          <>
            <div className="rounded-input border border-line bg-white p-[22px]">
              <strong>{result.title}</strong>
              <p className="mb-3.5 mt-1 text-[13px] text-muted">{result.subtitle} · Name: ____________</p>
              {result.questions.map((q, i) => (
                <div key={i} className="mb-2.5">
                  <p className="text-[13.5px]">
                    {i + 1}. {q}
                  </p>
                  <div className="mt-2 h-2 w-[85%] rounded bg-bg-2" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={busy}
                className="flex-1 rounded-input border border-line bg-white py-2.5 text-sm font-semibold shadow-paper hover:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Regenerating…" : "Regenerate"}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 rounded-input bg-clay py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52]"
              >
                {copyState === "copied" ? "Copied!" : copyState === "failed" ? "Couldn't copy" : "Copy as text"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
