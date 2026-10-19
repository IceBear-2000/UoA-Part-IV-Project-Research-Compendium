// Live production (syd1), unauthenticated pages only: n=25 each, measured from Auckland.
import { stats, r1, save } from "./lib.mjs";
const PROD = "https://study-buddy-uoa-project.vercel.app";
const out = {};
for (const p of ["/login", "/about", "/admin (unauthenticated -> 307 from middleware)"]) {
  const path = p.split(" ")[0];
  const ttfb = [], total = [];
  for (let i = 0; i < 26; i++) {
    const t0 = performance.now();
    const res = await fetch(PROD + path, { redirect: "manual" });
    const t1 = performance.now(); // headers received
    await res.arrayBuffer();
    const t2 = performance.now();
    if (i > 0) { ttfb.push(t1 - t0); total.push(t2 - t0); } // first request discarded as warm-up (DNS/TLS/cold)
  }
  const a = stats(ttfb), b = stats(total);
  out[p] = { ttfb: Object.fromEntries(Object.entries(a).map(([k, v]) => [k, r1(v)])), total: Object.fromEntries(Object.entries(b).map(([k, v]) => [k, r1(v)])) };
  console.log(p.padEnd(48), `n=${a.n} TTFB median=${r1(a.median)}ms p95=${r1(a.p95)}ms | total median=${r1(b.median)}ms p95=${r1(b.p95)}ms`);
}
save("c-perf-live-public.json", out);
