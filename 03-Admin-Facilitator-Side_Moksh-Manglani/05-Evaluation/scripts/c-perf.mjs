// Section C: latency of the main pages and actions. Self-contained: creates its own ZZ-EVAL-PERF fixtures, measures, removes them.
//   Local production build:  node eval/c-perf.mjs
//   Live site (you supply the credentials, they are never stored):
//     BASE=https://study-buddy-uoa-project.vercel.app ADMIN_EMAIL=... ADMIN_PASSWORD=... FAC_EMAIL=... FAC_PASSWORD=... node eval/c-perf.mjs
// NOTE: action IDs come from the local build of the same commit; the script checks that the target accepts them.
import { prisma } from "./db.mjs";
import { loginViaForm, http, callAction, stats, r1, save } from "./lib.mjs";

const BASE = process.env.BASE ?? "http://localhost:3002";
const local = /localhost|127\.0\.0\.1/.test(BASE);
const cred = (k, d) => process.env[k] ?? (local ? d : (() => { throw new Error(`${k} required for non-local BASE`); })());
const ADMIN = [cred("ADMIN_EMAIL", "gill@school.nz"), cred("ADMIN_PASSWORD", process.env.SEED_PASSWORD)];
const FAC = [cred("FAC_EMAIL", "moksh@school.nz"), cred("FAC_PASSWORD", process.env.SEED_PASSWORD)];
const N = 25;

const fac = await prisma.user.findUnique({ where: { email: FAC[0] } });
const asg = await prisma.facilitatorAssignment.findFirst({ where: { facilitatorId: fac.id }, include: { subject: true } });
const mk = async (name, nBlocks, status = "PUBLISHED") => {
  const l = await prisma.lesson.create({ data: { name, subjectId: asg.subjectId, status, durationMinutes: 10 } });
  const bs = [];
  for (let i = 0; i < nBlocks; i++) bs.push(await prisma.block.create({ data: { lessonId: l.id, type: "NOTE", title: `Step ${i + 1}`, order: i, content: { instructions: `Perf step ${i + 1}` } } }));
  return { l, bs };
};
const perfPlay = await mk("ZZ-EVAL-PERF Player 25 steps", 25);
const perfFive = await mk("ZZ-EVAL-PERF Player 5 steps", 5);
const perfAdd = await mk("ZZ-EVAL-PERF Add-block", 1, "DRAFT");
const cls = asg.classId, sub = asg.subjectId;
const url = (l) => `/facilitator/classes/${cls}/subjects/${sub}/lessons/${l}`;

const adminJar = (await loginViaForm(BASE, ...ADMIN)).jar;
const facJar = (await loginViaForm(BASE, ...FAC)).jar;
const out = { base: BASE, when: new Date().toISOString(), n: N, series: {} };

async function series(name, fn, { warm = 1 } = {}) {
  const first = [];
  for (let i = 0; i < warm; i++) first.push((await fn(-1 - i)).ms);
  const xs = [];
  for (let i = 0; i < N; i++) xs.push((await fn(i)).ms);
  const s = stats(xs);
  out.series[name] = { firstRequestMs: first.map(r1), ...Object.fromEntries(Object.entries(s).map(([k, v]) => [k, r1(v)])), samples: xs.map(r1) };
  console.log(name.padEnd(46), `n=${s.n} median=${r1(s.median)}ms p95=${r1(s.p95)}ms min=${r1(s.min)} max=${r1(s.max)} (first/warm-up request: ${first.map(r1).join(", ")}ms)`);
}

await series("Admin dashboard (GET /admin)", async () => { const r = await http(BASE, "/admin", { jar: adminJar }); if (r.status !== 200) throw new Error("status " + r.status); return r; });
await series("Facilitator dashboard (GET /facilitator)", async () => { const r = await http(BASE, "/facilitator", { jar: facJar }); if (r.status !== 200) throw new Error("status " + r.status); return r; });
const lessonCount = await prisma.lesson.count();
await series(`Lessons index (GET /admin/lessons, ${lessonCount} lessons)`, async () => { const r = await http(BASE, "/admin/lessons", { jar: adminJar }); if (r.status !== 200) throw new Error("status " + r.status); return r; });
await series("Lesson player, 5-step lesson (GET)", async () => { const r = await http(BASE, url(perfFive.l.id), { jar: facJar }); if (r.status !== 200) throw new Error("status " + r.status); return r; });
await series("Lesson player, 25-step lesson (GET)", async () => { const r = await http(BASE, url(perfPlay.l.id), { jar: facJar }); if (r.status !== 200) throw new Error("status " + r.status); return r; });

// add block (admin Server Action round trip, as the editor's "Add block" button sends it)
await series("Add block (addBlock Server Action)", async () => { const r = await callAction(BASE, adminJar, "addBlock", [perfAdd.l.id, "NOTE"], { id: perfAdd.l.id }); if (r.status !== 200) throw new Error("addBlock status " + r.status + " (action id not accepted by target?)"); return r; });

// mark step done: walk the 25-step lesson once, one sample per step
await prisma.lessonProgress.deleteMany({ where: { lessonId: perfPlay.l.id } });
await http(BASE, url(perfPlay.l.id), { jar: facJar }); // creates the progress row (not timed)
{
  const xs = [];
  for (let i = 0; i < perfPlay.bs.length; i++) {
    const r = await callAction(BASE, facJar, "markBlockDone", [perfPlay.l.id, perfPlay.bs[i].id], { classId: cls, subjectId: sub, lessonId: perfPlay.l.id });
    if (r.status !== 200) throw new Error("markBlockDone status " + r.status);
    xs.push(r.ms);
  }
  const s = stats(xs);
  out.series["Mark step done (markBlockDone Server Action)"] = { firstRequestMs: [r1(xs[0])], ...Object.fromEntries(Object.entries(s).map(([k, v]) => [k, r1(v)])), samples: xs.map(r1) };
  console.log("Mark step done (markBlockDone Server Action)".padEnd(46), `n=${s.n} median=${r1(s.median)}ms p95=${r1(s.p95)}ms min=${r1(s.min)} max=${r1(s.max)} (first sample ${r1(xs[0])}ms)`);
}

save(local ? "c-perf-local.json" : "c-perf-live.json", out);
// cleanup fixtures
const ids = [perfPlay.l.id, perfFive.l.id, perfAdd.l.id];
await prisma.lessonProgress.deleteMany({ where: { lessonId: { in: ids } } });
await prisma.block.deleteMany({ where: { lessonId: { in: ids } } });
await prisma.lesson.deleteMany({ where: { id: { in: ids } } });
await prisma.$disconnect();
console.log("fixtures removed");
