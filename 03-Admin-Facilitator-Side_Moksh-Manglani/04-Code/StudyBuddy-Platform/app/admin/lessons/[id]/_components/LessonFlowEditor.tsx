"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { BlockType } from "@prisma/client";
import { addBlock, deleteBlock, reorderBlocks, updateBlock } from "../block-actions";
import { uploadBlockFile, removeBlockFile } from "../file-actions";
import { BlockRow, type BlockData } from "./BlockRow";
import { BlockTypePicker } from "./BlockTypePicker";

export function LessonFlowEditor({
  lessonId,
  initialBlocks,
}: {
  lessonId: string;
  initialBlocks: BlockData[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // No router.refresh() after these — the server action's own response
  // already has everything the UI needs, and a refresh means waiting on a
  // second full round trip for a block count in the page header that isn't
  // worth blocking on. revalidatePath() (in each action) still keeps the
  // next real navigation to this page fresh.
  async function handleAdd(type: BlockType) {
    setPickerOpen(false);
    const newBlock = await addBlock(lessonId, type);
    setBlocks((prev) => [...prev, newBlock as BlockData]);
    setExpandedId(newBlock.id);
  }

  async function handleSave(
    blockId: string,
    data: { title: string; facilitatorNote: string | null; content: Record<string, unknown> },
  ) {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...data } : b)));
    setExpandedId(null);
    await updateBlock(blockId, lessonId, data);
  }

  async function handleDelete(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    await deleteBlock(blockId, lessonId);
  }

  async function handleUploadFile(blockId: string, formData: FormData) {
    const newContent = await uploadBlockFile(lessonId, blockId, formData);
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, content: newContent } : b)));
    return newContent;
  }

  async function handleRemoveFile(blockId: string) {
    const newContent = await removeBlockFile(lessonId, blockId);
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, content: newContent } : b)));
    return newContent;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    const next = arrayMove(blocks, oldIndex, newIndex);

    setBlocks(next);
    reorderBlocks(
      lessonId,
      next.map((b) => b.id),
    );
  }

  return (
    <div>
      {blocks.length === 0 && (
        <p className="mb-3 rounded-xl border border-dashed border-line p-6 text-center text-[13px] text-muted">
          No blocks yet. Add your first step below.
        </p>
      )}

      <DndContext
        id="lesson-flow-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockRow
              key={block.id}
              block={block}
              expanded={expandedId === block.id}
              onToggleExpand={() =>
                setExpandedId((current) => (current === block.id ? null : block.id))
              }
              onSave={handleSave}
              onDelete={() => handleDelete(block.id)}
              onUploadFile={handleUploadFile}
              onRemoveFile={handleRemoveFile}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="w-full rounded-xl border-[1.5px] border-dashed border-line bg-transparent p-[15px] text-center text-sm font-semibold text-muted transition-colors hover:border-clay hover:bg-clay-soft hover:text-clay"
      >
        ＋ Add block
      </button>

      <BlockTypePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={handleAdd} />
    </div>
  );
}
