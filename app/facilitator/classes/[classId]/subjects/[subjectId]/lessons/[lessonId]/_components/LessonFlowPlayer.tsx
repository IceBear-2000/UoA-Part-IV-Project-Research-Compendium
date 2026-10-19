"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import { BlockType } from "@prisma/client";
import { BLOCK_META } from "@/lib/block-meta";
import { getBlockState, type LessonProgressState } from "@/lib/lesson-progress";
import { resolveVideoEmbed } from "@/lib/video-embed";
import type { WorksheetQuestion } from "@/lib/ai-worksheet";
import { sendMessageAction } from "@/lib/messaging-actions";
import { markBlockDone } from "../actions";

type ClientBlock = {
  id: string;
  type: BlockType;
  title: string;
  order: number;
  state: "done" | "active" | "locked" | "free";
  // Shape depends on block type (see prisma/schema.prisma's Block.content comment) — genuinely dynamic, not worth a discriminated union here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  facilitatorNote: string | null;
};

function StageBody({ block }: { block: ClientBlock }) {
  const content = block.content ?? {};

  switch (block.type) {
    case BlockType.VIDEO: {
      const embed = content.url ? resolveVideoEmbed(content.url) : null;
      if (!embed) {
        return (
          <div className="grid aspect-video w-full place-items-center rounded-xl bg-ink text-sm text-white/70">
            No video added yet
          </div>
        );
      }
      return embed.kind === "iframe" ? (
        <iframe
          src={embed.src}
          className="aspect-video w-full rounded-xl bg-ink"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video controls src={embed.src} className="aspect-video w-full rounded-xl bg-ink" />
      );
    }

    case BlockType.WORKBOOK:
      return (
        <div className="rounded-xl border border-line bg-white p-5">
          {content.pageStart && content.pageEnd ? (
            <p className="text-sm">
              Reference the printed workbook, pages{" "}
              <strong>
                {content.pageStart}–{content.pageEnd}
              </strong>
              .
            </p>
          ) : (
            <p className="text-sm text-muted">No page range set yet.</p>
          )}
        </div>
      );

    case BlockType.ACTIVITY:
      return (
        <div className="rounded-xl border border-[#E4D7A8] bg-gold-soft p-[18px]">
          <p className="whitespace-pre-line text-sm">
            {content.instructions || "No instructions added yet."}
          </p>
        </div>
      );

    case BlockType.WORKSHEET: {
      if (Array.isArray(content.questions)) {
        return <AiWorksheetBody content={content} />;
      }

      // An uploaded file takes priority over a pasted external link if
      // somehow both are set.
      const link = content.signedFileUrl ?? content.fileUrl;
      const linkLabel = content.fileName ? `Open ${content.fileName} →` : "Open worksheet file →";
      return (
        <div className="rounded-xl border border-line bg-white p-5">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-clay underline"
            >
              {linkLabel}
            </a>
          ) : (
            <p className="text-sm text-muted">No worksheet file added yet.</p>
          )}
          {content.generatedByAI && (
            <span className="mt-2 inline-block rounded-md bg-bg-2 px-2 py-1 text-[11px] font-semibold text-muted">
              AI-generated
            </span>
          )}
          <div>
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-4 inline-flex items-center gap-2 rounded-input border border-line bg-white px-3.5 py-2 text-sm font-semibold shadow-paper hover:bg-bg-2"
            >
              🖨️ Print worksheet
            </button>
          </div>
        </div>
      );
    }

    case BlockType.READING:
      return (
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="whitespace-pre-line text-sm">
            {content.instructions || "No instructions added yet."}
          </p>
          {content.signedFileUrl && (
            <a
              href={content.signedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-clay underline"
            >
              Open {content.fileName ?? "reading file"} →
            </a>
          )}
        </div>
      );

    default:
      return (
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="whitespace-pre-line text-sm">
            {content.instructions || "No instructions added yet."}
          </p>
        </div>
      );
  }
}

function AiWorksheetBody({
  content,
}: {
  content: { title?: string; studentInstructions?: string; questions: WorksheetQuestion[] };
}) {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-block rounded-md bg-bg-2 px-2 py-1 text-[11px] font-semibold text-muted">
          AI-generated
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAnswers((v) => !v)}
            className="rounded-input border border-line bg-white px-3 py-1.5 text-xs font-semibold shadow-paper hover:bg-bg-2"
          >
            {showAnswers ? "Hide answer key" : "Show answer key"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-input border border-line bg-white px-3 py-1.5 text-xs font-semibold shadow-paper hover:bg-bg-2"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {content.studentInstructions && (
        <p className="mb-4 whitespace-pre-line text-sm">{content.studentInstructions}</p>
      )}

      <ol className="flex flex-col gap-4">
        {content.questions.map((q, i) => (
          <li key={i} className="rounded-lg border border-line p-3.5">
            <p className="mb-2 text-sm font-semibold">
              {i + 1}. {q.prompt}
            </p>

            {q.type === "mcq" && (
              <ul className="flex flex-col gap-1 pl-1 text-sm">
                {q.options.map((opt, oi) => (
                  <li
                    key={oi}
                    className={
                      showAnswers && oi === q.correctIndex
                        ? "rounded-md bg-sage-soft px-2 py-1 font-semibold text-[#5f7355]"
                        : "px-2 py-1"
                    }
                  >
                    {String.fromCharCode(65 + oi)}. {opt}
                  </li>
                ))}
              </ul>
            )}

            {(q.type === "short_answer" || q.type === "long_answer") && (
              <>
                <div
                  className={`rounded-md border border-dashed border-line ${
                    q.type === "long_answer" ? "min-h-[70px]" : "min-h-[32px]"
                  }`}
                />
                {showAnswers && (
                  <p className="mt-2 rounded-md bg-sage-soft px-2 py-1.5 text-sm text-[#5f7355]">
                    <strong>Answer:</strong> {q.answer}
                  </p>
                )}
              </>
            )}

            {q.type === "coloring" && (
              <p className="text-sm text-muted">🖍️ Drawing/coloring prompt — no answer key needed.</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// Shown after a step is marked done: carry on, or send the admin a question first.
function CheckpointPrompt({
  stepNumber,
  stepTitle,
  adminId,
  lessonName,
  onContinue,
}: {
  stepNumber: number;
  stepTitle: string;
  adminId: string | null;
  lessonName: string;
  onContinue: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send() {
    if (!adminId || !question.trim() || state === "sending") return;
    setState("sending");
    try {
      await sendMessageAction(
        adminId,
        `Question about "${lessonName}", step ${stepNumber} (${stepTitle}):\n${question.trim()}`,
      );
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="grid min-h-[380px] place-items-center text-center">
      <div className="w-full max-w-[460px]">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-sage text-white">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Step {stepNumber} done</h2>
        <p className="mt-1 text-sm text-muted">{stepTitle}</p>

        {state === "sent" ? (
          <div className="mt-6">
            <p className="text-sm text-ink">Question sent. Your admin will reply in the chat.</p>
            <button
              type="button"
              onClick={onContinue}
              className="mt-4 inline-flex items-center gap-2 rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover"
            >
              Continue <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ) : asking ? (
          <div className="mt-6 text-left">
            <label htmlFor="checkpoint-question" className="mb-1.5 block text-[13px] font-semibold">
              Your question for the admin
            </label>
            <textarea
              id="checkpoint-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              autoFocus
              className="w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
            />
            {state === "error" && (
              <p className="mt-2 text-[12.5px] text-[#8a4b58]">Could not send. Please try again.</p>
            )}
            <div className="mt-3 flex gap-2.5">
              <button
                type="button"
                onClick={() => setAsking(false)}
                className="rounded-input border border-line bg-white px-4 py-2.5 text-sm font-semibold shadow-paper hover:bg-bg-2"
              >
                Back
              </button>
              <button
                type="button"
                onClick={send}
                disabled={!question.trim() || state === "sending"}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover disabled:opacity-60"
              >
                <Send className="h-4 w-4" strokeWidth={2} />
                {state === "sending" ? "Sending…" : "Send to admin"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center gap-2 rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover"
            >
              Continue <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
            {adminId && (
              <button
                type="button"
                onClick={() => setAsking(true)}
                className="rounded-input border border-line bg-white px-4 py-2.5 text-sm font-semibold shadow-paper hover:bg-bg-2"
              >
                Ask the admin a question
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function LessonFlowPlayer({
  classId,
  subjectId,
  lessonId,
  lessonName,
  gradeName,
  subjectName,
  blocks: initialBlocks,
  initialProgress,
  adminId,
}: {
  classId: string;
  subjectId: string;
  lessonId: string;
  lessonName: string;
  gradeName: string;
  subjectName: string;
  blocks: ClientBlock[];
  initialProgress: LessonProgressState;
  adminId: string | null;
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [progress, setProgress] = useState(initialProgress);
  const [activeBlockId, setActiveBlockId] = useState(
    () =>
      initialBlocks.find((b) => b.order === initialProgress.currentBlockIndex)?.id ??
      initialBlocks[0].id,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkpoint, setCheckpoint] = useState<{
    nextId: string;
    stepNumber: number;
    stepTitle: string;
  } | null>(null);

  const activeIndex = blocks.findIndex((b) => b.id === activeBlockId);
  const activeBlock = blocks[activeIndex];
  const doneCount = progress.completedBlockIds.length;
  const lessonComplete = !!progress.completedAt;
  const alreadyDone = activeBlock.state === "done" || activeBlock.state === "free";

  function openStep(blockId: string) {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || block.state === "locked") return;
    setCheckpoint(null);
    setActiveBlockId(blockId);
  }

  async function handleMarkDone() {
    setIsSubmitting(true);
    try {
      const result = await markBlockDone(lessonId, activeBlock.id);

      setProgress(result.progress);
      setBlocks((prev) =>
        prev.map((b) => {
          const state = getBlockState(b, result.progress);
          if (result.unlockedBlock && b.id === result.unlockedBlock.id) {
            return {
              ...b,
              state,
              content: result.unlockedBlock.content,
              facilitatorNote: result.unlockedBlock.facilitatorNote,
            };
          }
          return { ...b, state };
        }),
      );

      if (result.progress.completedAt) {
        router.push(
          `/facilitator/classes/${classId}/subjects/${subjectId}/lessons/${lessonId}/complete`,
        );
        return;
      }

      const next = blocks.find((b) => b.order === activeBlock.order + 1);
      if (next) {
        setCheckpoint({ nextId: next.id, stepNumber: activeIndex + 1, stepTitle: activeBlock.title });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToCompletion() {
    router.push(`/facilitator/classes/${classId}/subjects/${subjectId}/lessons/${lessonId}/complete`);
  }

  return (
    <>
      <Link
        href={`/facilitator/classes/${classId}/subjects/${subjectId}`}
        className="mb-3 inline-flex items-center gap-1.5 rounded-input border border-line bg-surface px-3 py-1.5 text-[13px] font-semibold shadow-paper transition-colors hover:bg-bg-2"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to lessons
      </Link>
      <p className="mb-1.5 text-[13px] text-muted">
        <Link href="/facilitator" className="hover:text-clay">
          Dashboard
        </Link>{" "}
        ›{" "}
        <Link href={`/facilitator/classes/${classId}`} className="hover:text-clay">
          {gradeName}
        </Link>{" "}
        ›{" "}
        <Link
          href={`/facilitator/classes/${classId}/subjects/${subjectId}`}
          className="hover:text-clay"
        >
          {subjectName}
        </Link>{" "}
        › <span>{lessonName}</span>
      </p>

      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-bold tracking-tight">{lessonName}</h1>
          <p className="mt-1 text-[14.5px] text-muted">
            {lessonComplete
              ? `${gradeName} · ${subjectName} — completed · free navigation unlocked`
              : `${gradeName} · ${subjectName} — follow each step in order`}
          </p>
        </div>
        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            lessonComplete ? "bg-sage-soft text-[#5f7355]" : "bg-gold-soft text-[#8d7426]"
          }`}
        >
          {doneCount} of {blocks.length} complete
        </span>
      </div>

      <div className="grid grid-cols-[300px_1fr] items-start gap-7">
        <div className="flex flex-col">
          {blocks.map((block, i) => {
            const meta = BLOCK_META[block.type];
            const isLast = i === blocks.length - 1;
            const clickable = block.state !== "locked";
            const showsCheck = block.state === "done" || block.state === "free";

            return (
              <div key={block.id} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  <div
                    className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border-[1.5px] text-sm font-semibold transition-colors ${
                      showsCheck
                        ? "border-sage bg-sage text-white"
                        : block.state === "active"
                          ? "border-clay bg-clay text-white"
                          : "border-line bg-surface text-muted"
                    }`}
                  >
                    {showsCheck ? "✓" : block.state === "locked" ? "🔒" : i + 1}
                  </div>
                  {!isLast && (
                    <div
                      className={`min-h-[24px] w-0.5 flex-1 ${showsCheck ? "bg-sage" : "bg-line"}`}
                    />
                  )}
                </div>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => openStep(block.id)}
                  className={`mb-3 flex-1 rounded-[11px] border p-3.5 text-left transition-colors ${
                    block.id === activeBlockId
                      ? "border-clay-line bg-clay-soft"
                      : clickable
                        ? "border-line bg-surface hover:border-clay-line"
                        : "cursor-not-allowed border-line bg-bg opacity-45"
                  }`}
                >
                  <h4
                    className={`flex items-center gap-2 text-sm font-semibold ${
                      block.id === activeBlockId ? "text-[#8c5538]" : ""
                    }`}
                  >
                    {block.title}
                    <span
                      className={`ml-auto rounded-[5px] px-[7px] py-[2px] text-[10.5px] font-bold uppercase tracking-wide ${meta.soft} ${meta.text}`}
                    >
                      {meta.label}
                    </span>
                  </h4>
                  <small className="text-xs text-muted">
                    {showsCheck ? "Done" : block.state === "active" ? "In progress" : "Locked"}
                  </small>
                </button>
              </div>
            );
          })}
        </div>

        <div className="min-h-[430px] rounded-card border border-line bg-surface p-[25px] shadow-paper">
          {checkpoint ? (
            <CheckpointPrompt
              key={checkpoint.nextId}
              stepNumber={checkpoint.stepNumber}
              stepTitle={checkpoint.stepTitle}
              adminId={adminId}
              lessonName={lessonName}
              onContinue={() => {
                setActiveBlockId(checkpoint.nextId);
                setCheckpoint(null);
              }}
            />
          ) : (
            <>
          <div className="mb-[18px] flex items-center gap-3">
            <div
              className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl text-xl ${BLOCK_META[activeBlock.type].soft}`}
            >
              {BLOCK_META[activeBlock.type].icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{activeBlock.title}</h2>
              <p className="text-sm text-muted">
                Step {activeIndex + 1} of {blocks.length} · {BLOCK_META[activeBlock.type].label}
              </p>
            </div>
          </div>

          <StageBody block={activeBlock} />

          {activeBlock.facilitatorNote && (
            <p className="mt-4 text-sm leading-relaxed">
              <strong className="text-ink">Facilitator note:</strong>{" "}
              {activeBlock.facilitatorNote}
            </p>
          )}

          <div className="mt-[22px] flex items-center justify-between border-t border-line pt-5">
            {activeIndex > 0 ? (
              <button
                type="button"
                onClick={() => openStep(blocks[activeIndex - 1].id)}
                className="rounded-input border border-line bg-white px-3.5 py-2 text-sm font-semibold shadow-paper hover:bg-bg-2"
              >
                ← Previous
              </button>
            ) : (
              <span />
            )}

            {lessonComplete ? (
              activeIndex === blocks.length - 1 ? (
                <button
                  type="button"
                  onClick={goToCompletion}
                  className="rounded-input border border-line bg-white px-4 py-2.5 text-sm font-semibold shadow-paper hover:bg-bg-2"
                >
                  View completion ✓
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openStep(blocks[activeIndex + 1].id)}
                  className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover"
                >
                  Next step →
                </button>
              )
            ) : alreadyDone ? (
              <button
                type="button"
                onClick={() => openStep(blocks[activeIndex + 1].id)}
                className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover"
              >
                Next step →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleMarkDone}
                disabled={isSubmitting}
                className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving…"
                  : activeIndex === blocks.length - 1
                    ? "Mark done & finish lesson ✓"
                    : "Mark step done & continue →"}
              </button>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
