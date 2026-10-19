// 20 repeated end-to-end worksheet generations on one standard lesson (D04, 6.0k-char captioned transcript).
import fs from "node:fs";
import { loginViaForm, callAction, stats, r1, save } from "./lib.mjs";
const B = "http://localhost:3002";
const fx = JSON.parse(fs.readFileSync("eval/fixtures/../raw/d-fixtures.json", "utf8"));
const f = fx.find((x) => x.n === "D04");
const USAGE = "eval/raw/anthropic-usage.jsonl";
const lines = () => (fs.existsSync(USAGE) ? fs.readFileSync(USAGE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const jar = (await loginViaForm(B, "gill@school.nz", process.env.SEED_PASSWORD)).jar;
const parseSummary = (t) => { const m = t.match(/"summary":"((?:[^"\\]|\\.)*)"/); return m ? JSON.parse(`"${m[1]}"`) : ""; };
const PRICE = { haiku: [1, 5], sonnet: [2, 10] }; // $/M tokens (input, output): claude-api reference cached 2026-10-06
const rows = [];
for (let i = 0; i < 20; i++) {
  let n0 = lines().length;
  const a = await callAction(B, jar, "analyzeLessonContent", [f.lessonId], { id: f.lessonId });
  const au = lines().slice(n0)[0]; n0 = lines().length;
  const summary = parseSummary(a.text);
  if (!summary) throw new Error("no summary on run " + i);
  const g = await callAction(B, jar, "generateWorksheetDraft", [{ summary, questionTypes: ["mcq", "short_answer"], specialInstructions: "" }], { id: f.lessonId });
  const gu = lines().slice(n0)[0];
  rows.push({ aMs: a.ms, gMs: g.ms, aIn: au.usage.input_tokens, aOut: au.usage.output_tokens, gIn: gu.usage.input_tokens, gOut: gu.usage.output_tokens, aUsd: (au.usage.input_tokens * 1 + au.usage.output_tokens * 5) / 1e6, gUsd: (gu.usage.input_tokens * 2 + gu.usage.output_tokens * 10) / 1e6, gStop: gu.stop_reason });
  process.stdout.write(`run ${i + 1}: analyze ${r1(a.ms)}ms generate ${r1(g.ms)}ms\n`);
}
const S = (k) => Object.fromEntries(Object.entries(stats(rows.map((r) => r[k]))).map(([a, b]) => [a, r1(b)]));
const out = { n: rows.length, analyzeMs: S("aMs"), generateMs: S("gMs"), totalMs: Object.fromEntries(Object.entries(stats(rows.map((r) => r.aMs + r.gMs))).map(([a, b]) => [a, r1(b)])), tokens: { analyzeIn: S("aIn"), analyzeOut: S("aOut"), generateIn: S("gIn"), generateOut: S("gOut") }, usdPerWorksheet: Object.fromEntries(Object.entries(stats(rows.map((r) => r.aUsd + r.gUsd))).map(([a, b]) => [a, Math.round(b * 1e5) / 1e5])), totalUsd: Math.round(rows.reduce((s, r) => s + r.aUsd + r.gUsd, 0) * 1e4) / 1e4, stopReasons: [...new Set(rows.map((r) => r.gStop))], rows };
save("d6-perf.json", out);
console.log(JSON.stringify({ analyzeMs: out.analyzeMs, generateMs: out.generateMs, totalMs: out.totalMs, usdPerWorksheet: out.usdPerWorksheet, totalUsd: out.totalUsd, tokens: out.tokens }, null, 1));
