// Which of the seeded VIDEO block links yield a transcript with the same library the app uses?
import { createRequire } from "node:module";
import { prisma } from "./db.mjs";
import { save } from "./lib.mjs";
const require = createRequire(import.meta.url);
const { YoutubeTranscript } = require("youtube-transcript");
const blocks = await prisma.block.findMany({ where: { type: "VIDEO", lesson: { name: { not: { startsWith: "ZZ-EVAL" } } } }, include: { lesson: { include: { subject: { include: { class: true } } } } } });
const rows = [];
let i = 0;
async function worker() {
  while (i < blocks.length) {
    const b = blocks[i++];
    const url = b.content?.url;
    const t0 = Date.now();
    let res;
    if (!url) res = { ok: false, err: "no url" };
    else {
      try { const seg = await YoutubeTranscript.fetchTranscript(url); const text = seg.map((s) => s.text).join(" "); res = { ok: text.trim().length > 0, chars: text.length, err: text.trim() ? null : "empty" }; }
      catch (e) { res = { ok: false, err: String(e.message).slice(0, 120) }; }
    }
    rows.push({ cls: b.lesson.subject.class.name, subj: b.lesson.subject.name, lesson: b.lesson.name, lessonId: b.lessonId, blockId: b.id, url, ms: Date.now() - t0, ...res });
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
save("d0-video-scan.json", rows);
const ok = rows.filter((r) => r.ok);
console.log(`video blocks: ${rows.length}; transcript OK: ${ok.length}; failed: ${rows.length - ok.length}`);
const errs = {}; for (const r of rows.filter((r) => !r.ok)) errs[r.err] = (errs[r.err] ?? 0) + 1;
console.log("failure reasons:", errs);
const byClass = {}; for (const r of rows) { byClass[r.cls] ??= { total: 0, ok: 0 }; byClass[r.cls].total++; if (r.ok) byClass[r.cls].ok++; }
console.log(byClass);
await prisma.$disconnect();
