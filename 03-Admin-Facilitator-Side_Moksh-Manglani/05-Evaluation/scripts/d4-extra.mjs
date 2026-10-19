// Worksheet generator: regenerate, "does the new block overwrite anything?", concurrent finalize.
import fs from "node:fs";
import crypto from "node:crypto";
import { prisma } from "./db.mjs";
import { loginViaForm, callAction, save } from "./lib.mjs";

const B = "http://localhost:3002";
const fx = JSON.parse(fs.readFileSync("eval/raw/d-fixtures.json", "utf8"));
const res = JSON.parse(fs.readFileSync("eval/raw/d-results.json", "utf8"));
const USAGE = "eval/raw/anthropic-usage.jsonl";
const nUsage = () => (fs.existsSync(USAGE) ? fs.readFileSync(USAGE, "utf8").split("\n").filter(Boolean).length : 0);
const adminJar = (await loginViaForm(B, "gill@school.nz", process.env.SEED_PASSWORD)).jar;
const out = { regenerate: [], finalize: [], concurrent: null };

// ---- regenerate: same summary, no re-gathering of sources (no analyze call, no transcript/document fetch)
const flat = (text) => { const m = text.match(/^\d+:(\{"draft".*)$/m) ?? text.match(/^1:(.*)$/m); return m ? JSON.parse(m[1]) : null; };
for (const n of ["D04", "D12"]) {
  const f = fx.find((x) => x.n === n), r = res.find((x) => x.n === n);
  const u0 = nUsage();
  const g = await callAction(B, adminJar, "generateWorksheetDraft", [{ summary: r.analyze.summary, questionTypes: ["mcq", "short_answer"], specialInstructions: "" }], { id: f.lessonId });
  const calls = fs.readFileSync(USAGE, "utf8").split("\n").filter(Boolean).slice(u0).map((l) => JSON.parse(l));
  const body = flat(g.text);
  const first = r.generate.draft;
  const again = body?.draft;
  const same = again && JSON.stringify(again.questions.map((q) => q.prompt)) === JSON.stringify(first.questions.map((q) => q.prompt));
  out.regenerate.push({ n, status: g.status, ms: Math.round(g.ms), anthropicCalls: calls.map((c) => c.model), questions: again?.questions?.length, identicalToFirst: !!same, firstTitle: first.title, newTitle: again?.title, newDraft: again });
  console.log(n, "regenerate:", g.status, `${Math.round(g.ms)}ms`, "calls:", calls.map((c) => c.model).join(","), "| questions", again?.questions?.length, "| identical to first draft:", !!same);
}

// ---- finalize every draft: must append one NEW block and leave every existing block byte-identical
const hash = (b) => crypto.createHash("sha1").update(JSON.stringify([b.id, b.type, b.title, b.order, b.content, b.facilitatorNote])).digest("hex");
for (const r of res.filter((x) => x.generate?.draft)) {
  const f = fx.find((x) => x.n === r.n);
  const before = await prisma.block.findMany({ where: { lessonId: f.lessonId }, orderBy: { order: "asc" } });
  const resp = await callAction(B, adminJar, "finalizeWorksheetBlock", [f.lessonId, r.generate.draft], { id: f.lessonId });
  const after = await prisma.block.findMany({ where: { lessonId: f.lessonId }, orderBy: { order: "asc" } });
  const beforeH = new Map(before.map((b) => [b.id, hash(b)]));
  const changed = after.filter((b) => beforeH.has(b.id) && beforeH.get(b.id) !== hash(b));
  const added = after.filter((b) => !beforeH.has(b.id));
  const ok = resp.status === 200 && added.length === 1 && changed.length === 0 && after.length === before.length + 1 && added[0].order === before.length && added[0].type === "WORKSHEET";
  out.finalize.push({ n: r.n, status: resp.status, before: before.length, after: after.length, existingChanged: changed.length, newOrder: added[0]?.order, newType: added[0]?.type, ok });
  console.log(r.n, "finalize:", ok ? "OK" : "PROBLEM", `blocks ${before.length}->${after.length}`, `existing changed=${changed.length}`, `new block order=${added[0]?.order} type=${added[0]?.type}`);
}
// finalize the same draft twice more on D04 (sequential), then two at the same moment on D12
{
  const f = fx.find((x) => x.n === "D04"), r = res.find((x) => x.n === "D04");
  const pre = await prisma.block.count({ where: { lessonId: f.lessonId } });
  await callAction(B, adminJar, "finalizeWorksheetBlock", [f.lessonId, r.generate.draft], { id: f.lessonId });
  const mid = await prisma.block.count({ where: { lessonId: f.lessonId } });
  out.sequentialRepeat = { before: pre, after: mid };
  console.log("D04 finalize same draft again: blocks", pre, "->", mid, "(two worksheet blocks, nothing overwritten)");
}
{
  const f = fx.find((x) => x.n === "D12"), r = res.find((x) => x.n === "D12");
  const pre = await prisma.block.count({ where: { lessonId: f.lessonId } });
  await Promise.all([1, 2].map(() => callAction(B, adminJar, "finalizeWorksheetBlock", [f.lessonId, r.generate.draft], { id: f.lessonId })));
  const blocks = await prisma.block.findMany({ where: { lessonId: f.lessonId }, orderBy: { order: "asc" } });
  const orders = blocks.map((b) => b.order);
  const dup = orders.length !== new Set(orders).size;
  out.concurrent = { before: pre, after: blocks.length, orders, duplicateOrder: dup };
  console.log("D12 two finalize calls at the same instant: blocks", pre, "->", blocks.length, "| orders:", orders.join(","), "| duplicate order values:", dup);
}
save("d4-extra.json", out);
await prisma.$disconnect();
