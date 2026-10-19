// Lists every published lesson whose first/any VIDEO block cannot play in the app's player and proposes a
// specific, embeddable replacement. READ-ONLY: it never writes to the database.
import fs from "node:fs";
import { createRequire } from "node:module";
import { prisma } from "./db.mjs";
const require = createRequire(import.meta.url);
const { YoutubeTranscript } = require("youtube-transcript");

const UA = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36", "accept-language": "en-US,en;q=0.9", cookie: "CONSENT=YES+1; SOCS=CAI" };
const embeddable = (u) => { try { const x = new URL(u); const h = x.hostname.replace(/^www\.|^m\./, ""); if (["youtube.com", "youtube-nocookie.com"].includes(h)) return (x.pathname === "/watch" && !!x.searchParams.get("v")) || /^\/(shorts|embed)\//.test(x.pathname); if (h === "youtu.be") return x.pathname.length > 1; if (h === "vimeo.com") return /^\/\d+/.test(x.pathname); if (h === "player.vimeo.com") return true; return /\.(mp4|webm|ogg)(\?|$)/i.test(x.pathname); } catch { return false; } };
const kind = (u) => { if (!u) return "empty"; try { const x = new URL(u); if (x.hostname === "example.com") return "placeholder"; if (x.pathname === "/playlist") return "playlist"; if (x.pathname.startsWith("/@") || x.pathname.startsWith("/scishowkids") || x.pathname.startsWith("/channel") || x.pathname.startsWith("/c/") || x.pathname.startsWith("/user/")) return "channel"; } catch {} return "other"; };
const STOP = new Set(["first", "learn", "kids", "about", "using", "simple", "introducing", "resource", "reference", "nzc", "the", "and", "of", "to", "a", "in", "for", "with", "our", "us", "around", "is", "it", "chapter", "unit", "class", "maths", "math", "joyful", "mathematics", "year", "grade", "ncert", "all"]);
const toks = (s) => (s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
const overlap = (a, b) => { const A = new Set(toks(a)), B = new Set(toks(b)); let n = 0; for (const w of A) if (B.has(w)) n++; return A.size ? n / A.size : 0; };
const secs = (l) => { if (!l) return 0; const p = l.split(":").map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; };

const jsonFrom = (html) => JSON.parse(html.match(/var ytInitialData = (\{.*?\});<\/script>/s)[1]);
async function search(q) { let d; for (let t = 0; t < 4; t++) { try { const r = await fetch("https://www.youtube.com/results?search_query=" + encodeURIComponent(q) + "&hl=en", { headers: UA }); d = jsonFrom(await r.text()); break; } catch { await new Promise((x) => setTimeout(x, 1500 * (t + 1))); } } if (!d) return []; await new Promise((x) => setTimeout(x, 500)); const out = []; (function w(o) { if (!o || typeof o !== "object") return; if (o.videoRenderer) { const v = o.videoRenderer; out.push({ id: v.videoId, title: v.title?.runs?.map((x) => x.text).join(""), channel: v.ownerText?.runs?.[0]?.text, length: v.lengthText?.simpleText }); } for (const k of Object.keys(o)) w(o[k]); })(d); return out; }
const plCache = new Map();
async function playlist(url) { if (plCache.has(url)) return plCache.get(url); let d; for (let t = 0; t < 4 && !d; t++) { try { d = jsonFrom(await (await fetch(url, { headers: UA })).text()); } catch { await new Promise((x) => setTimeout(x, 1500 * (t + 1))); } } const out = []; if (!d) return out; (function w(o) { if (!o || typeof o !== "object") return; if (o.lockupViewModel?.contentType === "LOCKUP_CONTENT_TYPE_VIDEO") { const l = o.lockupViewModel; out.push({ id: l.contentId, title: l.metadata?.lockupMetadataViewModel?.title?.content, channel: "playlist", length: JSON.stringify(l).match(/"text":"(\d+:\d+(?::\d+)?)"/)?.[1] }); } for (const k of Object.keys(o)) w(o[k]); })(d); (function w(o) { if (!o || typeof o !== "object") return; if (o.playlistVideoRenderer) { const v = o.playlistVideoRenderer; out.push({ id: v.videoId, title: v.title?.runs?.map((x) => x.text).join(""), channel: v.shortBylineText?.runs?.[0]?.text, length: v.lengthText?.simpleText }); } for (const k of Object.keys(o)) w(o[k]); })(d); plCache.set(url, out); return out; }

const ALLOW = ["numberblocks", "alphablocks", "scishow kids", "national geographic kids", "crash course kids", "peekaboo kidz", "free school", "khan academy", "math antics", "homeschool pop", "mashup math", "math with mr", "jack hartmann", "khan academy kids", "kids academy", "learning junction", "smile and learn", "happy learning", "periwinkle", "science with mr", "numberblocks"];
const allowRank = (c) => { const i = ALLOW.findIndex((a) => (c ?? "").toLowerCase().includes(a)); return i < 0 ? 99 : i; };

async function check(id) {
  let embed = false, captions = false;
  try { embed = (await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)).status === 200; } catch {}
  try { const t = await YoutubeTranscript.fetchTranscript(`https://www.youtube.com/watch?v=${id}`); captions = t.length > 0; } catch {}
  return { embed, captions };
}

const lessons = await prisma.lesson.findMany({ where: { status: "PUBLISHED", name: { not: { startsWith: "ZZ-EVAL" } } }, include: { subject: { include: { class: true } }, blocks: { orderBy: { order: "asc" } } }, orderBy: [{ subject: { class: { name: "asc" } } }, { createdAt: "asc" }] });
const rows = [];
for (const l of lessons) {
  for (const b of l.blocks.filter((x) => x.type === "VIDEO")) {
    const url = b.content?.url ?? "";
    if (embeddable(url)) continue;
    const reading = l.blocks.find((x) => x.type === "READING");
    rows.push({ cls: l.subject.class.name, curriculum: l.subject.class.curriculum, subject: l.subject.name, lesson: l.name, lessonId: l.id, blockId: b.id, blockTitle: b.title, readingTitle: reading?.title ?? "", url, kind: kind(url), firstBlock: l.blocks[0]?.id === b.id });
  }
}
console.log("unplayable video blocks:", rows.length);

let i = 0;
async function worker() {
  while (i < rows.length) {
    const r = rows[i++];
    const topic = r.lesson.replace(/\s[—-]\s.*$/, "").replace(/[—-]/g, " ");
    const want = `${r.lesson} ${r.readingTitle}`;
    try {
      let cands = [];
      if (r.kind === "playlist") {
        const items = await playlist(r.url);
        cands = items.map((v) => ({ ...v, score: overlap(want, v.title) + overlap(v.title, want) * 0.5, via: "playlist" })).filter((v) => v.score >= 0.5).sort((a, b) => b.score - a.score);
      } else if (r.kind === "channel") {
        const nz = r.curriculum === "NZC";
        const yr = Number((r.cls.match(/\d/) || [1])[0]);
        const qs = r.subject === "English" ? [`Alphablocks ${topic}`, `${topic} english for kids`] : r.subject === "Science" ? [`SciShow Kids ${topic}`, `${topic} science for kids`] : yr <= 2 ? [`Numberblocks ${topic}`, `${topic} maths for kids`] : [`Math Antics ${topic}`, `${topic} maths for kids`, `Khan Academy ${topic}`];
        const seen = new Set();
        for (const q of qs) for (const v of await search(q)) { if (seen.has(v.id)) continue; seen.add(v.id); const s = secs(v.length); if (s < 120 || s > 1500) continue; if (allowRank(v.channel) === 99) continue; cands.push({ ...v, score: overlap(topic, v.title), via: "search: " + q }); }
        cands = cands.filter((v) => v.score >= 0.5).sort((a, b) => b.score - a.score || allowRank(a.channel) - allowRank(b.channel));
      }
      const best = cands[0];
      if (best) { const c = await check(best.id); r.proposal = { ...best, ...c, url: `https://www.youtube.com/watch?v=${best.id}` }; r.alternatives = cands.slice(1, 3).map((v) => `${v.title} (${v.channel}, ${v.length})`); }
    } catch (e) { r.error = String(e.message).slice(0, 80); }
  }
}
await worker();
fs.writeFileSync("eval/raw/video-fix-proposal.json", JSON.stringify(rows, null, 2));
const good = rows.filter((r) => r.proposal?.embed);
console.log("with an embeddable proposal:", good.length, "| with captions too:", good.filter((r) => r.proposal.captions).length, "| needs video:", rows.length - good.length);
await prisma.$disconnect();
