import fs from "node:fs";
import { createRequire } from "node:module";
import { prisma } from "./db.mjs";
const require = createRequire(import.meta.url);
const { YoutubeTranscript } = require("youtube-transcript");
const fx = JSON.parse(fs.readFileSync("eval/raw/d-fixtures.json", "utf8"));
const res = JSON.parse(fs.readFileSync("eval/raw/d-results.json", "utf8"));
const wanted = process.argv.slice(2);
for (const n of wanted) {
  const f = fx.find((x) => x.n === n), r = res.find((x) => x.n === n);
  const blocks = await prisma.block.findMany({ where: { lessonId: f.lessonId }, orderBy: { order: "asc" } });
  console.log(`\n==================== ${n} | ${f.cls} | ${f.subject} | ${f.real} | ${f.src}`);
  for (const b of blocks) {
    const c = b.content ?? {};
    let line = `  [${b.order}] ${b.type} "${b.title}"`;
    if (b.type === "VIDEO") { line += ` url=${c.url ?? "-"}`; if (/watch\?v=/.test(c.url ?? "")) { try { const t = (await YoutubeTranscript.fetchTranscript(c.url)).map((s) => s.text).join(" "); line += `\n      TRANSCRIPT (${t.length} chars): ${t.slice(0, 1400)} ...[END]... ${t.slice(-300)}`; } catch (e) { line += ` (no transcript: ${String(e.message).slice(0, 60)})`; } } }
    if (c.instructions) line += `\n      instructions: ${String(c.instructions).slice(0, 700)}`;
    if (c.filePath) line += `\n      file: ${c.fileName}`;
    console.log(line);
  }
  console.log("  --- warnings:", JSON.stringify(r.analyze.warnings));
  console.log("  --- SUMMARY:", r.analyze.summary || "(none)");
  const d = r.generate?.draft;
  if (d) {
    console.log(`  --- WORKSHEET: "${d.title}" | instructions: ${d.studentInstructions}`);
    d.questions.forEach((q, i) => {
      if (q.type === "mcq") console.log(`   ${i + 1}. [MCQ] ${q.prompt}\n        ${q.options.map((o, k) => `${String.fromCharCode(65 + k)}) ${o}`).join("  ")}  => KEY: ${String.fromCharCode(65 + q.correctIndex)}`);
      else console.log(`   ${i + 1}. [${q.type}] ${q.prompt}  => ANSWER: ${q.answer ?? ""}`);
    });
  } else console.log("  --- no worksheet:", r.generate?.error ?? "not generated");
}
await prisma.$disconnect();
