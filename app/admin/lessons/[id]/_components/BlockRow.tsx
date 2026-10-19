"use client";

import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import { BlockType } from "@prisma/client";
import { BLOCK_META, summarizeContent } from "@/lib/block-meta";
import { getBlockFilePreviewUrl } from "../file-actions";

export type BlockData = {
  id: string;
  type: BlockType;
  title: string;
  order: number;
  facilitatorNote: string | null;
  // Shape depends on block type (see prisma/schema.prisma's Block.content comment) — genuinely dynamic, not worth a discriminated union here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
};

type SaveHandler = (
  blockId: string,
  data: { title: string; facilitatorNote: string | null; content: Record<string, unknown> },
) => void;

type UploadFileHandler = (
  blockId: string,
  formData: FormData,
) => Promise<Record<string, unknown>>;

type RemoveFileHandler = (blockId: string) => Promise<Record<string, unknown>>;

const inputClasses =
  "w-full rounded-input border border-line bg-white px-3 py-2 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft";

export function BlockRow({
  block,
  expanded,
  onToggleExpand,
  onSave,
  onDelete,
  onUploadFile,
  onRemoveFile,
}: {
  block: BlockData;
  expanded: boolean;
  onToggleExpand: () => void;
  onSave: SaveHandler;
  onDelete: () => void;
  onUploadFile: UploadFileHandler;
  onRemoveFile: RemoveFileHandler;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const meta = BLOCK_META[block.type];

  // Two-click confirm instead of window.confirm() — native dialogs are
  // blocked/unreliable in some embedded contexts and block the JS thread.
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-3 rounded-xl border border-line bg-surface shadow-paper transition-colors hover:border-clay-line"
    >
      <div className="flex items-center gap-3 p-3.5">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab select-none text-base text-muted active:cursor-grabbing"
        >
          ⠿
        </span>
        <div
          className={`grid h-[38px] w-[38px] flex-shrink-0 place-items-center rounded-[10px] text-lg ${meta.soft}`}
        >
          {meta.icon}
        </div>
        <button type="button" onClick={onToggleExpand} className="flex-1 text-left">
          <strong className="text-sm">{block.title}</strong>
          <br />
          <small className="text-muted">
            {meta.label} · {summarizeContent(block.type, block.content)}
          </small>
        </button>
        <span
          className={`rounded-md px-2 py-1 text-[10.5px] font-bold uppercase tracking-wide ${meta.soft} ${meta.text}`}
        >
          {meta.label}
        </span>
        <button
          type="button"
          onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
          title={confirmDelete ? "Click again to delete this block" : "Delete this block"}
          aria-label={confirmDelete ? "Delete block: click again to confirm" : "Delete block"}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold transition-colors ${
            confirmDelete
              ? "bg-[#a85a69] text-white"
              : "text-muted hover:bg-rose-soft hover:text-[#8a4b58]"
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          Delete
          {confirmDelete && <span className="font-normal opacity-90"> · click again</span>}
        </button>
      </div>

      {expanded && (
        <BlockEditForm
          block={block}
          onSave={onSave}
          onCancel={onToggleExpand}
          onUploadFile={onUploadFile}
          onRemoveFile={onRemoveFile}
        />
      )}
    </div>
  );
}

function FileUploadField({
  blockId,
  fileName,
  filePath,
  onUpload,
  onRemove,
}: {
  blockId: string;
  fileName: string | null;
  filePath: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveClick() {
    setBusy(true);
    setError(null);
    try {
      await onRemove();
    } finally {
      setBusy(false);
    }
  }

  async function handlePreview() {
    if (!filePath) return;
    const url = await getBlockFilePreviewUrl(filePath);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <label className="mb-1 block text-[12.5px] font-semibold">
        Uploaded file
        <span className="ml-1.5 rounded-[5px] bg-bg-2 px-[7px] py-[2px] text-[11px] font-medium text-muted">
          PDF, Word, or PowerPoint
        </span>
      </label>

      {fileName ? (
        <div className="flex items-center justify-between gap-2 rounded-input border border-line bg-white px-3 py-2">
          <button
            type="button"
            onClick={handlePreview}
            className="truncate text-left text-sm font-medium text-clay underline"
          >
            📎 {fileName}
          </button>
          <button
            type="button"
            onClick={handleRemoveClick}
            disabled={busy}
            className="flex-shrink-0 text-xs font-semibold text-muted hover:text-[#946b76]"
          >
            Remove
          </button>
        </div>
      ) : (
        <input
          key={blockId}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          onChange={handleChange}
          disabled={busy}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-input file:border file:border-line file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink hover:file:bg-bg-2"
        />
      )}
      {busy && <p className="mt-1 text-xs text-muted">Working…</p>}
      {error && <p className="mt-1 text-xs text-[#946b76]">{error}</p>}
    </div>
  );
}

function BlockEditForm({
  block,
  onSave,
  onCancel,
  onUploadFile,
  onRemoveFile,
}: {
  block: BlockData;
  onSave: SaveHandler;
  onCancel: () => void;
  onUploadFile: UploadFileHandler;
  onRemoveFile: RemoveFileHandler;
}) {
  const [title, setTitle] = useState(block.title);
  const [facilitatorNote, setFacilitatorNote] = useState(block.facilitatorNote ?? "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<Record<string, any>>(block.content ?? {});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(block.id, { title, facilitatorNote: facilitatorNote || null, content });
  }

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const newContent = await onUploadFile(block.id, formData);
    setContent(newContent);
  }

  async function handleRemoveFile() {
    const newContent = await onRemoveFile(block.id);
    setContent(newContent);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-line p-3.5 pt-4">
      <div>
        <label className="mb-1 block text-[12.5px] font-semibold">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClasses} />
      </div>

      {block.type === BlockType.VIDEO && (
        <>
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold">Video URL</label>
            <input
              value={content.url ?? ""}
              onChange={(e) => setContent({ ...content, url: e.target.value })}
              placeholder="https://…"
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-muted">
              YouTube, Vimeo, or a direct video file link (.mp4)
            </p>
          </div>
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold">
              Duration (seconds)
            </label>
            <input
              type="number"
              min={0}
              value={content.durationSeconds ?? ""}
              onChange={(e) =>
                setContent({
                  ...content,
                  durationSeconds: e.target.value ? Number(e.target.value) : null,
                })
              }
              className={inputClasses}
            />
          </div>
        </>
      )}

      {block.type === BlockType.WORKBOOK && (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[12.5px] font-semibold">Start page</label>
            <input
              type="number"
              min={0}
              value={content.pageStart ?? ""}
              onChange={(e) =>
                setContent({
                  ...content,
                  pageStart: e.target.value ? Number(e.target.value) : null,
                })
              }
              className={inputClasses}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[12.5px] font-semibold">End page</label>
            <input
              type="number"
              min={0}
              value={content.pageEnd ?? ""}
              onChange={(e) =>
                setContent({
                  ...content,
                  pageEnd: e.target.value ? Number(e.target.value) : null,
                })
              }
              className={inputClasses}
            />
          </div>
        </div>
      )}

      {block.type === BlockType.WORKSHEET &&
        (Array.isArray(content.questions) ? (
          <p className="rounded-input border border-line bg-bg-2 px-3 py-2.5 text-[13px] text-muted">
            AI-generated worksheet · {content.questions.length} question
            {content.questions.length === 1 ? "" : "s"}. Edit questions and the answer key from the
            lesson page&apos;s <strong>✨ Generate AI worksheet</strong> button.
          </p>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-[12.5px] font-semibold">
                Worksheet link
                <span className="ml-1.5 rounded-[5px] bg-bg-2 px-[7px] py-[2px] text-[11px] font-medium text-muted">
                  Optional if uploading a file below
                </span>
              </label>
              <input
                value={content.fileUrl ?? ""}
                onChange={(e) => setContent({ ...content, fileUrl: e.target.value })}
                placeholder="https://…"
                className={inputClasses}
              />
            </div>
            <FileUploadField
              blockId={block.id}
              fileName={content.fileName ?? null}
              filePath={content.filePath ?? null}
              onUpload={handleUpload}
              onRemove={handleRemoveFile}
            />
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={!!content.generatedByAI}
                onChange={(e) => setContent({ ...content, generatedByAI: e.target.checked })}
              />
              AI-generated
            </label>
          </>
        ))}

      {block.type === BlockType.ACTIVITY && (
        <div>
          <label className="mb-1 block text-[12.5px] font-semibold">Instructions</label>
          <textarea
            value={content.instructions ?? ""}
            onChange={(e) => setContent({ ...content, instructions: e.target.value })}
            className={`min-h-[70px] resize-y ${inputClasses}`}
          />
        </div>
      )}

      {block.type === BlockType.READING && (
        <>
          <div>
            <label className="mb-1 block text-[12.5px] font-semibold">Instructions</label>
            <textarea
              value={content.instructions ?? ""}
              onChange={(e) => setContent({ ...content, instructions: e.target.value })}
              className={`min-h-[70px] resize-y ${inputClasses}`}
            />
          </div>
          <FileUploadField
            blockId={block.id}
            fileName={content.fileName ?? null}
            filePath={content.filePath ?? null}
            onUpload={handleUpload}
            onRemove={handleRemoveFile}
          />
        </>
      )}

      {(block.type === BlockType.QUIZ ||
        block.type === BlockType.DISCUSSION ||
        block.type === BlockType.BREAK ||
        block.type === BlockType.NOTE) && (
        <div>
          <label className="mb-1 block text-[12.5px] font-semibold">Instructions</label>
          <textarea
            value={content.instructions ?? ""}
            onChange={(e) => setContent({ ...content, instructions: e.target.value })}
            className={`min-h-[70px] resize-y ${inputClasses}`}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-[12.5px] font-semibold">
          Facilitator note
          <span className="ml-1.5 rounded-[5px] bg-bg-2 px-[7px] py-[2px] text-[11px] font-medium text-muted">
            Optional
          </span>
        </label>
        <textarea
          value={facilitatorNote}
          onChange={(e) => setFacilitatorNote(e.target.value)}
          placeholder="Guidance shown to the facilitator while running this step…"
          className={`min-h-[60px] resize-y ${inputClasses}`}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-input bg-clay px-4 py-2 text-[13px] font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover"
        >
          Save block
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-input border border-line bg-white px-4 py-2 text-[13px] font-semibold hover:bg-bg-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
