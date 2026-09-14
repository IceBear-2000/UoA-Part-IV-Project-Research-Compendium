// Every class always has a banner — no upload required. Deterministic per
// class id, so a card's banner never changes between renders/reloads. When
// an admin uploads a real image (Class.bannerImagePath), that always wins;
// this is only the fallback.

const PALETTES = [
  { from: "#f4a988", via: "#e8845f", to: "#c65d3b" }, // coral sunset
  { from: "#8fd9c4", via: "#4fae94", to: "#2d7d68" }, // teal ocean
  { from: "#b6a6e8", via: "#8b74d6", to: "#5c4a9e" }, // violet dusk
  { from: "#f6d582", via: "#e3b545", to: "#b8862a" }, // amber field
  { from: "#f2a8c2", via: "#dd7ba0", to: "#a84e73" }, // rose blush
  { from: "#8ec9ea", via: "#4f9fd1", to: "#2f6f9e" }, // sky cyan
  { from: "#a3d187", via: "#6fab52", to: "#457032" }, // forest green
  { from: "#a8b4c4", via: "#7c8ba0", to: "#4f5c70" }, // slate graphite
] as const;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function paletteForClass(classId: string) {
  return PALETTES[hashString(classId) % PALETTES.length];
}

// Blob positions vary by a second hash so same-palette banners (once you
// have more than 8 classes) still don't look identical.
function blobLayout(classId: string) {
  const seed = hashString(classId + "-layout");
  const variants = [
    [
      { cx: 60, cy: 40, r: 90 },
      { cx: 340, cy: 130, r: 110 },
    ],
    [
      { cx: 350, cy: 30, r: 100 },
      { cx: 70, cy: 140, r: 95 },
    ],
    [
      { cx: 200, cy: 150, r: 130 },
      { cx: 30, cy: 10, r: 70 },
    ],
  ];
  return variants[seed % variants.length];
}

export function ClassBanner({ classId, className }: { classId: string; className?: string }) {
  const palette = paletteForClass(classId);
  const blobs = blobLayout(classId);
  const gradId = `cb-grad-${classId}`;

  return (
    <svg
      viewBox="0 0 400 160"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label=""
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.from} />
          <stop offset="55%" stopColor={palette.via} />
          <stop offset="100%" stopColor={palette.to} />
        </linearGradient>
      </defs>
      <rect width="400" height="160" fill={`url(#${gradId})`} />
      {blobs.map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="#ffffff" opacity={i === 0 ? 0.14 : 0.09} />
      ))}
    </svg>
  );
}
