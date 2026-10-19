// Evaluation harness helpers: HTTP with a cookie jar, form login against the app itself,
// raw Next.js Server Action calls, and summary statistics. No secrets are ever printed.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./env.mjs";

export const ACTION_IDS = JSON.parse(fs.readFileSync(path.join(ROOT, "eval/action-ids.json"), "utf8"));
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, ".next/server/server-reference-manifest.json"), "utf8")).node;

export class Jar {
  constructor() { this.m = new Map(); }
  absorb(res) {
    const list = res.headers.getSetCookie?.() ?? [];
    for (const c of list) {
      const [pair, ...attrs] = c.split(";");
      const i = pair.indexOf("=");
      const name = pair.slice(0, i).trim();
      const value = pair.slice(i + 1).trim();
      const expired = attrs.some((a) => /^\s*max-age=0/i.test(a)) || attrs.some((a) => /expires=.*1970/i.test(a));
      if (expired || value === "") this.m.delete(name);
      else this.m.set(name, value);
    }
  }
  header() { return [...this.m].map(([k, v]) => `${k}=${v}`).join("; "); }
  get size() { return this.m.size; }
}

export async function http(base, p, { jar, method = "GET", headers = {}, body, redirect = "manual" } = {}) {
  const h = { ...headers };
  if (jar && jar.size) h.cookie = jar.header();
  const t0 = performance.now();
  const res = await fetch(base + p, { method, headers: h, body, redirect });
  const text = await res.text();
  const ms = performance.now() - t0;
  if (jar) jar.absorb(res);
  return { status: res.status, headers: res.headers, text, ms, location: res.headers.get("location") };
}

// Signs in by submitting the app's own login form (progressive-enhancement POST), exactly as a browser without JS would.
export async function loginViaForm(base, email, password) {
  const jar = new Jar();
  const page = await http(base, "/login", { jar });
  const hidden = [...page.text.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?/g)];
  const fd = new FormData();
  for (const [, n, v] of hidden) fd.set(n, v ?? "");
  fd.set("email", email);
  fd.set("password", password);
  const res = await http(base, "/login", { jar, method: "POST", body: fd, headers: { origin: base } });
  return { jar, ok: res.status === 303 && !!res.location && res.location.includes("/dashboard"), res };
}

// Generic MPA-style form post to a page (progressive-enhancement), used for signup/set-password forms.
export async function postForm(base, p, fields, { jar } = {}) {
  const page = await http(base, p, { jar });
  const hidden = [...page.text.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?/g)];
  const fd = new FormData();
  for (const [, n, v] of hidden) fd.set(n, v ?? "");
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return http(base, p, { jar, method: "POST", body: fd, headers: { origin: base } });
}

function pageForAction(name, repl = {}) {
  const id = ACTION_IDS[name];
  const worker = Object.keys(MANIFEST[id].workers)[0]; // e.g. app/admin/lessons/[id]/page
  let p = "/" + worker.replace(/^app\//, "").replace(/\/page$/, "");
  for (const [k, v] of Object.entries(repl)) p = p.replace(`[${k}]`, v);
  return p === "/" ? "/" : p;
}

// Raw Server Action call (what an attacker with a session cookie would send).
export async function callAction(base, jar, name, args, repl = {}, extraHeaders = {}) {
  const id = ACTION_IDS[name];
  if (!id) throw new Error("unknown action " + name);
  const p = pageForAction(name, repl);
  const res = await http(base, p, {
    jar, method: "POST",
    headers: { "next-action": id, "content-type": "text/plain;charset=UTF-8", accept: "text/x-component", origin: base, ...extraHeaders },
    body: JSON.stringify(args),
  });
  return { ...res, page: p };
}

export function stats(values) {
  const v = [...values].sort((a, b) => a - b);
  const n = v.length;
  const q = (p) => v[Math.min(n - 1, Math.max(0, Math.ceil(p * n) - 1))]; // nearest-rank percentile
  const mean = v.reduce((a, b) => a + b, 0) / n;
  return { n, min: v[0], median: n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2, p95: q(0.95), max: v[n - 1], mean };
}
export const r1 = (x) => Math.round(x * 10) / 10;

export function save(name, data) {
  fs.mkdirSync(path.join(ROOT, "eval/raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "eval/raw", name), JSON.stringify(data, null, 2));
}
