"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuestionType, WorksheetDraft, WorksheetQuestion } from "@/lib/ai-worksheet";
import { analyzeLessonContent, finalizeWorksheetBlock, generateWorksheetDraft } from "../actions";

type Step = "loading" | "review" | "generating" | "editor" | "finalizing";

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string; hint: string }[] = [
  { value: "mcq", label: "Multiple choice", hint: "4 options, one correct" },
  { value: "short_answer", label: "Short answer", hint: "A sentence or two" },
  { value: "long_answer", label: "Long answer / essay", hint: "A paragraph or more" },
  { value: "coloring", label: "Coloring / drawing", hint: "Themed prompt, not real art" },
];

const inputClasses =
  "w-full rounded-input border border-line bg-white px-3 py-2 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft";

function emptyQuestion(type: QuestionType): WorksheetQuestion {
  switch (type) {
    case "mcq":
      return { type: "mcq", prompt: "", options: ["", "", "", ""], correctIndex: 0 };
    case "short_answer":
      return { type: "short_answer", prompt: "", answer: "" };
    case "long_answer":
      return { type: "long_answer", prompt: "", answer: "" };
    case "coloring":
      return { type: "coloring", prompt: "" };
  }
}

export function WorksheetWizard({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Set<QuestionType>>(new Set<QuestionType>(["mcq"]));
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [draft, setDraft] = useState<WorksheetDraft | null>(null);

  useEffect(() => {
    let cancelled = false;
    analyzeLessonContent(lessonId)
      .then((result) => {
        if (cancelled) return;
        setSummary(result.summary);
        setWarnings(result.warnings);
        setStep("review");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Couldn't read this lesson's content.");
        setStep("review");
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  function toggleType(type: QuestionType) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  async function handleGenerate() {
    setError(null);
    setStep("generating");
    const result = await generateWorksheetDraft({
      summary,
      questionTypes: Array.from(selectedTypes),
      specialInstructions,
    });
    if ("error" in result) {
      setError(result.error);
      setStep("review");
      return;
    }
    setDraft(result.draft);
    setStep("editor");
  }

  async function handleRegenerate() {
    setError(null);
    setStep("generating");
    const result = await generateWorksheetDraft({
      summary,
      questionTypes: Array.from(selectedTypes),
      specialInstructions,
    });
    if ("error" in result) {
      setError(result.error);
      setStep("editor");
      return;
    }
    setDraft(result.draft);
    setStep("editor");
  }

  async function handleFinalize() {
    if (!draft) return;
    setStep("finalizing");
    await finalizeWorksheetBlock(lessonId, draft);
    router.push(`/admin/lessons/${lessonId}?saved=1`);
  }

  function updateQuestion(index: number, next: WorksheetQuestion) {
    if (!draft) return;
    const questions = draft.questions.slice();
    questions[index] = next;
    setDraft({ ...draft, questions });
  }

  function removeQuestion(index: number) {
    if (!draft) return;
    setDraft({ ...draft, questions: draft.questions.filter((_, i) => i !== index) });
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    if (!draft) return;
    const target = index + direction;
    if (target < 0 || target >= draft.questions.length) return;
    const questions = draft.questions.slice();
    [questions[index], questions[target]] = [questions[target], questions[index]];
    setDraft({ ...draft, questions });
  }

  function addQuestion(type: QuestionType) {
    if (!draft) return;
    setDraft({ ...draft, questions: [...draft.questions, emptyQuestion(type)] });
  }

  if (step === "loading") {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center shadow-paper">
        <p className="text-sm font-semibold text-ink">Compressing the topic…</p>
        <p className="mt-1.5 text-sm text-muted">
          Reading blocks, fetching video transcripts, and scanning documents in this lesson.
        </p>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center shadow-paper">
        <p className="text-sm font-semibold text-ink">Writing the worksheet…</p>
        <p className="mt-1.5 text-sm text-muted">Claude is generating questions from the summary.</p>
      </div>
    );
  }

  if (step === "finalizing") {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center shadow-paper">
        <p className="text-sm font-semibold text-ink">Adding the worksheet block…</p>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="rounded-card border border-line bg-surface p-[25px] shadow-paper">
        {error && (
          <p className="mb-4 rounded-input border border-[#E4C9CE] bg-rose-soft px-3 py-2 text-sm text-[#946b76]">
            {error}
          </p>
        )}

        {warnings.length > 0 && (
          <div className="mb-4 rounded-input border border-[#E4D7A8] bg-gold-soft p-3.5">
            <p className="mb-1.5 text-[13px] font-semibold text-[#8d7426]">
              A few things couldn&apos;t be read
            </p>
            <ul className="list-disc space-y-1 pl-4 text-[13px] text-[#8d7426]">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <label className="mb-1 block text-[12.5px] font-semibold">
          AI&apos;s understanding of this lesson
          <span className="ml-1.5 rounded-[5px] bg-bg-2 px-[7px] py-[2px] text-[11px] font-medium text-muted">
            Editable
          </span>
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Nothing to summarize yet — add some content to this lesson's blocks first."
          className={`min-h-[140px] resize-y ${inputClasses}`}
        />

        <label className="mb-1 mt-5 block text-[12.5px] font-semibold">Question types</label>
        <div className="grid grid-cols-2 gap-2.5">
          {QUESTION_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-input border p-3 text-sm ${
                selectedTypes.has(opt.value) ? "border-clay-line bg-clay-soft" : "border-line bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedTypes.has(opt.value)}
                onChange={() => toggleType(opt.value)}
                className="mt-0.5"
              />
              <span>
                <strong className="block">{opt.label}</strong>
                <span className="text-xs text-muted">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>

        <label className="mb-1 mt-5 block text-[12.5px] font-semibold">
          Special instructions
          <span className="ml-1.5 rounded-[5px] bg-bg-2 px-[7px] py-[2px] text-[11px] font-medium text-muted">
            Optional
          </span>
        </label>
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g. keep it to 6 questions, focus on vocabulary, make it easier…"
          className={`min-h-[70px] resize-y ${inputClasses}`}
        />

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!summary.trim() || selectedTypes.size === 0}
            className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52] disabled:opacity-50"
          >
            Generate worksheet
          </button>
        </div>
      </div>
    );
  }

  if (step === "editor" && draft) {
    return (
      <div className="grid grid-cols-[1fr_260px] items-start gap-[25px]">
        <div className="rounded-card border border-line bg-surface p-[25px] shadow-paper">
          {error && (
            <p className="mb-4 rounded-input border border-[#E4C9CE] bg-rose-soft px-3 py-2 text-sm text-[#946b76]">
              {error}
            </p>
          )}

          <label className="mb-1 block text-[12.5px] font-semibold">Title</label>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className={inputClasses}
          />

          <label className="mb-1 mt-3.5 block text-[12.5px] font-semibold">Student instructions</label>
          <textarea
            value={draft.studentInstructions}
            onChange={(e) => setDraft({ ...draft, studentInstructions: e.target.value })}
            className={`min-h-[60px] resize-y ${inputClasses}`}
          />

          <p className="mb-2 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Questions
          </p>

          <div className="flex flex-col gap-3">
            {draft.questions.map((q, i) => (
              <QuestionEditor
                key={i}
                index={i}
                question={q}
                total={draft.questions.length}
                onChange={(next) => updateQuestion(i, next)}
                onRemove={() => removeQuestion(i)}
                onMove={(dir) => moveQuestion(i, dir)}
              />
            ))}
          </div>

          {draft.questions.length === 0 && (
            <p className="rounded-xl border border-dashed border-line p-5 text-center text-[13px] text-muted">
              No questions — add one below.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {QUESTION_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => addQuestion(opt.value)}
                className="rounded-input border border-dashed border-line bg-transparent px-3 py-1.5 text-xs font-semibold text-muted hover:border-clay hover:bg-clay-soft hover:text-clay"
              >
                ＋ {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-line bg-surface p-[18px] shadow-paper">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted">Tools</p>
          <button
            type="button"
            onClick={handleFinalize}
            className="mb-2 w-full rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52]"
          >
            Add worksheet block
          </button>
          <button
            type="button"
            onClick={handleRegenerate}
            className="mb-2 w-full rounded-input border border-line bg-white px-4 py-2 text-sm font-semibold shadow-paper hover:bg-bg-2"
          >
            ↻ Regenerate
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(null);
              setStep("review");
            }}
            className="w-full rounded-input border border-line bg-white px-4 py-2 text-sm font-semibold shadow-paper hover:bg-bg-2"
          >
            ← Back to summary
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function QuestionEditor({
  index,
  question,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  index: number;
  question: WorksheetQuestion;
  total: number;
  onChange: (q: WorksheetQuestion) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const typeLabel = QUESTION_TYPE_OPTIONS.find((o) => o.value === question.type)?.label ?? question.type;

  return (
    <div className="rounded-xl border border-line bg-white p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-[5px] bg-sage-soft px-[7px] py-[2px] text-[10.5px] font-bold uppercase tracking-wide text-[#5f7355]">
          {typeLabel}
        </span>
        <span className="text-xs text-muted">Q{index + 1}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="text-muted hover:text-clay disabled:opacity-30"
            title="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="text-muted hover:text-clay disabled:opacity-30"
            title="Move down"
          >
            ↓
          </button>
          <button type="button" onClick={onRemove} className="text-muted hover:text-[#946b76]" title="Remove">
            ✕
          </button>
        </div>
      </div>

      <textarea
        value={question.prompt}
        onChange={(e) => onChange({ ...question, prompt: e.target.value })}
        placeholder="Question prompt…"
        className={`min-h-[50px] resize-y ${inputClasses}`}
      />

      {question.type === "mcq" && (
        <div className="mt-2 flex flex-col gap-1.5">
          {question.options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2">
              <input
                type="radio"
                checked={question.correctIndex === i}
                onChange={() => onChange({ ...question, correctIndex: i })}
              />
              <input
                value={opt}
                onChange={(e) => {
                  const options = question.options.slice();
                  options[i] = e.target.value;
                  onChange({ ...question, options });
                }}
                placeholder={`Option ${i + 1}`}
                className={inputClasses}
              />
            </label>
          ))}
          <p className="text-[11px] text-muted">Select the radio next to the correct answer.</p>
        </div>
      )}

      {(question.type === "short_answer" || question.type === "long_answer") && (
        <div className="mt-2">
          <label className="mb-1 block text-[11px] font-semibold text-muted">Answer key</label>
          <textarea
            value={question.answer}
            onChange={(e) => onChange({ ...question, answer: e.target.value })}
            className={`min-h-[45px] resize-y ${inputClasses}`}
          />
        </div>
      )}
    </div>
  );
}
