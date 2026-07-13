"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlockType } from "@prisma/client";
import { BLOCK_META } from "@/lib/block-meta";
import { getBlockState, type LessonProgressState } from "@/lib/lesson-progress";
import { resolveVideoEmbed } from "@/lib/video-embed";
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

export function LessonFlowPlayer({
  classId,
  subjectId,
  lessonId,
  lessonName,
  gradeName,
  subjectName,
  blocks: initialBlocks,
  initialProgress,
}: {
  classId: string;
  subjectId: string;
  lessonId: string;
  lessonName: string;
  gradeName: string;
  subjectName: string;
  blocks: ClientBlock[];
  initialProgress: LessonProgressState;
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

  const activeIndex = blocks.findIndex((b) => b.id === activeBlockId);
  const activeBlock = blocks[activeIndex];
  const doneCount = progress.completedBlockIds.length;
  const lessonComplete = !!progress.completedAt;
  const alreadyDone = activeBlock.state === "done" || activeBlock.state === "free";

  function openStep(blockId: string) {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || block.state === "locked") return;
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
      if (next) setActiveBlockId(next.id);
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToCompletion() {
    router.push(`/facilitator/classes/${classId}/subjects/${subjectId}/lessons/${lessonId}/complete`);
  }

  return (
    <>
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
                  className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52]"
                >
                  Next step →
                </button>
              )
            ) : alreadyDone ? (
              <button
                type="button"
                onClick={() => openStep(blocks[activeIndex + 1].id)}
                className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52]"
              >
                Next step →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleMarkDone}
                disabled={isSubmitting}
                className="rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52] disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving…"
                  : activeIndex === blocks.length - 1
                    ? "Mark done & finish lesson ✓"
                    : "Mark step done & continue →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
