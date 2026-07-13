// Class/Subject have no icon field in the schema — these give each one a
// stable, distinct visual identity without needing one.

const CLASS_PALETTE = [
  { icon: "🔢", bg: "bg-blue-soft" },
  { icon: "🌱", bg: "bg-sage-soft" },
  { icon: "⭐", bg: "bg-gold-soft" },
  { icon: "📚", bg: "bg-rose-soft" },
];

export function classStyle(index: number) {
  return CLASS_PALETTE[index % CLASS_PALETTE.length];
}

const SUBJECT_STYLE: Record<string, { icon: string; bg: string }> = {
  Maths: { icon: "🔢", bg: "bg-blue-soft" },
  Science: { icon: "🔬", bg: "bg-sage-soft" },
  English: { icon: "📖", bg: "bg-rose-soft" },
};

const DEFAULT_SUBJECT_STYLE = { icon: "📘", bg: "bg-gold-soft" };

export function subjectStyle(name: string) {
  return SUBJECT_STYLE[name] ?? DEFAULT_SUBJECT_STYLE;
}
