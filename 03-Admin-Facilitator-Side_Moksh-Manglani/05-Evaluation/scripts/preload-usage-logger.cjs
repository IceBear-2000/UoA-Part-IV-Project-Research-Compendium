// Preloaded into the test server (NODE_OPTIONS=--require). Logs token usage + latency of every
// Anthropic API call without modifying application code. Output: eval/raw/anthropic-usage.jsonl
const fs = require("node:fs");
const path = require("node:path");
const out = path.join(__dirname, "raw", "anthropic-usage.jsonl");
const orig = globalThis.fetch;
globalThis.fetch = async function (input, init) {
  const url = typeof input === "string" ? input : input?.url ?? String(input);
  if (!url.includes("api.anthropic.com")) return orig(input, init);
  const t0 = performance.now();
  const res = await orig(input, init);
  const ms = performance.now() - t0;
  try {
    const body = await res.clone().json();
    fs.appendFileSync(
      out,
      JSON.stringify({
        ts: new Date().toISOString(),
        status: res.status,
        ms: Math.round(ms),
        model: body.model ?? null,
        usage: body.usage ?? null,
        stop_reason: body.stop_reason ?? null,
        error: body.error ?? null,
      }) + "\n",
    );
  } catch {}
  return res;
};
