// Runs the real two-step worksheet pipeline (analyze -> generate) through the app's own Server Actions for the 15 test lessons.
import fs from "node:fs";
import { loginViaForm, callAction, save } from "./lib.mjs";

const B = process.env.BASE ?? "http://localhost:3002";
const USAGE = "eval/raw/anthropic-usage.jsonl";
const fx = JSON.parse(fs.readFileSync("eval/raw/d-fixtures.json", "utf8"));
const usageLines = () => (fs.existsSync(USAGE) ? fs.readFileSync(USAGE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
// Minimal React Flight reader: long strings arrive as length-prefixed text rows ("2:T445,<bytes>") that the result
// object references as "$2"; they are not newline-terminated.
const parse = (text) => {
  const buf = Buffer.from(text, "utf8");
  const texts = {}, rows = {};
  let i = 0;
  while (i < buf.length) {
    const c = buf.indexOf(0x3a, i); if (c < 0) break;
    const id = buf.subarray(i, c).toString();
    i = c + 1;
    if (buf[i] === 0x54) { // 'T'
      const comma = buf.indexOf(0x2c, i); const len = parseInt(buf.subarray(i + 1, comma).toString(), 16);
      texts[id] = buf.subarray(comma + 1, comma + 1 + len).toString("utf8"); i = comma + 1 + len;
    } else { let e = buf.indexOf(0x0a, i); if (e < 0) e = buf.length; rows[id] = buf.subarray(i, e).toString("utf8"); i = e + 1; }
  }
  const resolve = (v) => (typeof v === "string" && /^\$\d+$/.test(v) && v.slice(1) in texts ? texts[v.slice(1)] : Array.isArray(v) ? v.map(resolve) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x)])) : v);
  for (const [id, r] of Object.entries(rows)) {
    if (id === "0") continue;
    try { const o = JSON.parse(r); if (o && typeof o === "object" && ("summary" in o || "draft" in o || "error" in o || "warnings" in o || "questions" in o)) return resolve(o); } catch {}
  }
  return null;
};
const PRICE = { "claude-haiku-4-5-20251001": [1, 5], "claude-sonnet-5": [2, 10] }; // $ per million tokens (input, output), from the claude-api reference cached 2026-10-06
const cost = (u, model) => { const p = PRICE[model] ?? PRICE[Object.keys(PRICE).find((k) => model?.startsWith(k.slice(0, 14)))] ?? [0, 0]; return (u.input_tokens * p[0] + u.output_tokens * p[1]) / 1e6; };

const adminJar = (await loginViaForm(B, "gill@school.nz", process.env.SEED_PASSWORD)).jar;
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
const results = [];
for (const f of fx) {
  if (only && !only.includes(f.n)) continue;
  const repl = { id: f.lessonId };
  let n0 = usageLines().length;
  const a = await callAction(B, adminJar, "analyzeLessonContent", [f.lessonId], repl);
  const aOut = parse(a.text);
  const aUsage = usageLines().slice(n0);
  n0 = usageLines().length;
  let g = null, gOut = null, gUsage = [];
  const summary = aOut?.summary ?? "";
  if (summary) {
    g = await callAction(B, adminJar, "generateWorksheetDraft", [{ summary, questionTypes: ["mcq", "short_answer"], specialInstructions: "" }], repl);
    gOut = parse(g.text);
    gUsage = usageLines().slice(n0);
  }
  const row = {
    n: f.n, cls: f.cls, subject: f.subject, lesson: f.real, src: f.src,
    analyze: { status: a.status, ms: Math.round(a.ms), warnings: aOut?.warnings ?? null, summary, usage: aUsage.map((u) => ({ model: u.model, ...u.usage, ms: u.ms, stop: u.stop_reason, usd: cost(u.usage, u.model) })), error: aOut && !summary ? aOut : undefined },
    generate: g ? { status: g.status, ms: Math.round(g.ms), draft: gOut?.draft ?? null, error: gOut?.error ?? null, usage: gUsage.map((u) => ({ model: u.model, ...u.usage, ms: u.ms, stop: u.stop_reason, usd: cost(u.usage, u.model) })) } : null,
  };
  results.push(row);
  const usd = [...row.analyze.usage, ...(row.generate?.usage ?? [])].reduce((s, u) => s + u.usd, 0);
  console.log(f.n, `analyze ${row.analyze.ms}ms (${row.analyze.usage[0]?.input_tokens ?? 0} in/${row.analyze.usage[0]?.output_tokens ?? 0} out)`, `| generate ${row.generate?.ms ?? "-"}ms (${row.generate?.usage[0]?.input_tokens ?? 0} in/${row.generate?.usage[0]?.output_tokens ?? 0} out)`, `| questions=${row.generate?.draft?.questions?.length ?? 0} | warnings=${(row.analyze.warnings ?? []).length} | $${usd.toFixed(4)}`);
}
save(only ? "d-results-partial.json" : "d-results.json", results);
