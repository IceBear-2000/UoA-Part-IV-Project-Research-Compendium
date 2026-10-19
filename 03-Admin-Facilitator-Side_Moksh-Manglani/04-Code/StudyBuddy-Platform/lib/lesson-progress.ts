export type LessonProgressState = {
  currentBlockIndex: number;
  completedBlockIds: string[];
  completedAt: Date | null;
};

export type BlockLike = { id: string; order: number };

// The single source of truth for a block's state — used both to enforce
// access server-side (mark-done, content visibility) and to render the
// sidebar client-side, so the two can never disagree. completedBlockIds is
// checked before completedAt/currentBlockIndex because once a lesson is
// finished every block should already be in that list (each one had to be
// marked done to get there) — this matches the schema's documented intent
// that the explicit set, not positional comparison, is authoritative.
export function getBlockState(
  block: BlockLike,
  progress: LessonProgressState,
): "done" | "active" | "locked" | "free" {
  if (progress.completedBlockIds.includes(block.id)) return "done";
  if (progress.completedAt) return "free";
  if (block.order === progress.currentBlockIndex) return "active";
  if (block.order < progress.currentBlockIndex) return "done";
  return "locked";
}

export function isBlockLocked(block: BlockLike, progress: LessonProgressState): boolean {
  return getBlockState(block, progress) === "locked";
}
