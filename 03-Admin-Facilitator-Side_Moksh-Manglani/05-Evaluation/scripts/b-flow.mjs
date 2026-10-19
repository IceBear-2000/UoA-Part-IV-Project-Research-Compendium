// Section B (lesson-flow rules) + check A9 (progress forging). Runs against the local production build.
import fs from "node:fs";
import { prisma } from "./db.mjs";
import { loginViaForm, http, callAction, save } from "./lib.mjs";

const B = process.env.BASE ?? "http://localhost:3002";
const fx = JSON.parse(fs.readFileSync("eval/raw/fixtures.json", "utf8"));
const LOG = "/tmp/eval-server.log";
const results = [];
const rec = (id, check, expected, actual, pass, evidence = "") => { results.push({ id, check, expected, actual, pass, evidence }); console.log(pass ? "PASS" : "FAIL", id, "-", check, "=>", actual); };

let logOffset = fs.statSync(LOG).size;
const lastErr = (t) => [...t.matchAll(/^(?:⨯ )?Error: (.+)$/gm)].map((m) => m[1]).pop();
const newLog = async () => { await new Promise((r) => setTimeout(r, 200)); const buf = fs.readFileSync(LOG); const t = buf.subarray(logOffset).toString("utf8"); logOffset = buf.length; return t; };

const lessonUrl = (l = fx.e1.lessonId, c = fx.ids.G1, s = fx.ids.G1_MATHS) => `/facilitator/classes/${c}/subjects/${s}/lessons/${l}`;
function blocksFrom(html) {
  const raw = html.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  const i = raw.indexOf('"blocks":[');
  if (i < 0) return null;
  let depth = 0, j = raw.indexOf("[", i), start = j, inStr = false;
  for (; j < raw.length; j++) {
    const ch = raw[j];
    if (inStr) { if (ch === "\\") j++; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true; else if (ch === "[") depth++; else if (ch === "]") { depth--; if (depth === 0) break; }
  }
  return JSON.parse(raw.slice(start, j + 1));
}
const summarise = (bl) => bl.map((b) => b.state[0]).join(""); // d=done a=active l=locked f=free
const mokshId = (await prisma.user.findUnique({ where: { email: "moksh@school.nz" } })).id;
const progressRow = () => prisma.lessonProgress.findUnique({ where: { facilitatorId_lessonId: { facilitatorId: mokshId, lessonId: fx.e1.lessonId } } });

// reset: make sure there is no progress row for this fixture (first-open condition)
await prisma.lessonProgress.deleteMany({ where: { facilitatorId: mokshId, lessonId: fx.e1.lessonId } });

let { jar } = await loginViaForm(B, "moksh@school.nz", process.env.SEED_PASSWORD);
const ids = fx.e1.blockIds;

// B1 first open
let r = await http(B, lessonUrl(), { jar });
let bl = blocksFrom(r.text);
const row0 = await progressRow();
rec("B1", "First open: only block 1 unlocked", "states = active,locked,locked,locked,locked; locked content null", `states=${summarise(bl)} (a=active,l=locked); locked content null=${bl.slice(1).every((b) => b.content === null)}; currentBlockIndex=${row0?.currentBlockIndex}`,
  summarise(bl) === "allll" && bl.slice(1).every((b) => b.content === null) && row0?.currentBlockIndex === 0);
rec("B1b", "Locked blocks' content never reaches the browser", "no SECRET-CONTENT-OF-STEP-2..5 anywhere in the HTML/RSC payload", `leaked=[${[2, 3, 4, 5].filter((n) => r.text.includes(`SECRET-CONTENT-OF-STEP-${n}`)).join(",")}]; step1 present=${r.text.includes("SECRET-CONTENT-OF-STEP-1")}`,
  ![2, 3, 4, 5].some((n) => r.text.includes(`SECRET-CONTENT-OF-STEP-${n}`)) && r.text.includes("SECRET-CONTENT-OF-STEP-1"));

// A9 forging while only block 1 is unlocked
await newLog();
const f3 = await callAction(B, jar, "markBlockDone", [fx.e1.lessonId, ids[2]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
const l3 = await newLog();
const afterF3 = await progressRow();
rec("A9a", "Forge: mark block 3 done while block 1 active (skips block 2)", "Rejected server-side, progress unchanged", `HTTP ${f3.status}; server error="${lastErr(l3)}"; completedBlockIds=${JSON.stringify(afterF3.completedBlockIds)}; index=${afterF3.currentBlockIndex}`,
  f3.status === 500 && /locked/i.test(l3) && afterF3.completedBlockIds.length === 0 && afterF3.currentBlockIndex === 0);
const f5 = await callAction(B, jar, "markBlockDone", [fx.e1.lessonId, ids[4]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
const l5 = await newLog();
const afterF5 = await progressRow();
rec("A9b", "Forge: mark the LAST block done first (jump to completion)", "Rejected, lesson not completed", `HTTP ${f5.status}; server error="${lastErr(l5)}"; completedAt=${afterF5.completedAt}`,
  f5.status === 500 && /locked/i.test(l5) && afterF5.completedAt === null);
const fx2 = await callAction(B, jar, "markBlockDone", [fx.e1.lessonId, fx.e3.blockIds[0]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
const lx2 = await newLog();
rec("A9c", "Forge: block id from a different lesson", "Rejected (Block not found)", `HTTP ${fx2.status}; server error="${lastErr(lx2)}"`, fx2.status === 500 && /Block not found/.test(lx2));

// B2 next block unlocks only after previous finished
const d1 = await callAction(B, jar, "markBlockDone", [fx.e1.lessonId, ids[0]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
const dRow = await progressRow();
r = await http(B, lessonUrl(), { jar }); bl = blocksFrom(r.text);
rec("B2", "Finishing block 1 unlocks exactly block 2", "states = done,active,locked,locked,locked", `states=${summarise(bl)} (d=done); HTTP ${d1.status}; index=${dRow.currentBlockIndex}; step2 content now present=${r.text.includes("SECRET-CONTENT-OF-STEP-2")}; step3 leaked=${r.text.includes("SECRET-CONTENT-OF-STEP-3")}`,
  summarise(bl) === "dalll" && r.text.includes("SECRET-CONTENT-OF-STEP-2") && !r.text.includes("SECRET-CONTENT-OF-STEP-3"));

// A9d: skip-ahead again now that block 2 is active (block 3 still locked)
await newLog();
const f3b = await callAction(B, jar, "markBlockDone", [fx.e1.lessonId, ids[2]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
const l3b = await newLog();
rec("A9d", "Forge: mark block 3 done while block 2 is the active step", "Rejected", `HTTP ${f3b.status}; server error="${lastErr(l3b)}"`, f3b.status === 500 && /locked/i.test(l3b));

// idempotent re-mark of a finished block
const again = await callAction(B, jar, "markBlockDone", [fx.e1.lessonId, ids[0]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
const rowAgain = await progressRow();
rec("B2b", "Re-marking an already-finished block does not move progress", "index stays 1, no duplicate ids", `HTTP ${again.status}; index=${rowAgain.currentBlockIndex}; ids=${JSON.stringify(rowAgain.completedBlockIds.length)}`, again.status === 200 && rowAgain.currentBlockIndex === 1 && rowAgain.completedBlockIds.length === 1);

// B3 progress survives refresh and sign-out/in
await callAction(B, jar, "markBlockDone", [fx.e1.lessonId, ids[1]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
r = await http(B, lessonUrl(), { jar }); const beforeRefresh = summarise(blocksFrom(r.text));
r = await http(B, lessonUrl(), { jar }); const afterRefresh = summarise(blocksFrom(r.text));
await callAction(B, jar, "logout", [], {});
const gone = await http(B, "/facilitator", { jar });
({ jar } = await loginViaForm(B, "moksh@school.nz", process.env.SEED_PASSWORD));
r = await http(B, lessonUrl(), { jar }); const afterRelogin = summarise(blocksFrom(r.text));
rec("B3", "Progress survives page refresh", "same states after reload", `before=${beforeRefresh} after=${afterRefresh}`, beforeRefresh === afterRefresh && beforeRefresh === "ddall");
rec("B3b", "Progress survives sign-out and sign-in (new session)", "same states after logout+login; logged-out request is redirected", `after relogin=${afterRelogin}; logged-out GET /facilitator => ${gone.status} ${gone.location}`, afterRelogin === "ddall" && gone.status === 307);

// B4 completion screen is not reachable early
const early = await http(B, lessonUrl() + "/complete", { jar });
rec("B4", "Completion page not reachable before the lesson is finished", "redirect back into the lesson", `GET /complete => ${early.status} ${early.location?.split("/").slice(-2).join("/")}`, early.status === 307 && early.location?.includes(fx.e1.lessonId) && !early.location.endsWith("complete"));

// B5 finish and full unlock
for (const i of [2, 3]) await callAction(B, jar, "markBlockDone", [fx.e1.lessonId, ids[i]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
const last = await callAction(B, jar, "markBlockDone", [fx.e1.lessonId, ids[4]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
const done = await progressRow();
r = await http(B, lessonUrl(), { jar }); bl = blocksFrom(r.text);
const comp = await http(B, lessonUrl() + "/complete", { jar });
rec("B5", "Finishing the last block completes the lesson and unlocks everything", "completedAt set; no block locked; all content present; /complete returns 200", `completedAt=${done.completedAt?.toISOString()}; states=${summarise(bl)}; contents present=${[1, 2, 3, 4, 5].filter((n) => r.text.includes(`SECRET-CONTENT-OF-STEP-${n}`)).length}/5; /complete=${comp.status}`,
  !!done.completedAt && !summarise(bl).includes("l") && [1, 2, 3, 4, 5].every((n) => r.text.includes(`SECRET-CONTENT-OF-STEP-${n}`)) && comp.status === 200);
const idxBefore = done.currentBlockIndex;
await callAction(B, jar, "markBlockDone", [fx.e1.lessonId, ids[1]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
const idxAfter = (await progressRow()).currentBlockIndex;
rec("B5b", "After completion, revisiting a step does not regress progress", "completedAt retained, index unchanged", `index ${idxBefore} -> ${idxAfter}; completedAt kept=${!!(await progressRow()).completedAt}`, idxAfter === idxBefore);

// Extra: admin edits a lesson while a facilitator is mid-way (blocks are positional)
const e7 = await prisma.lesson.create({ data: { name: "ZZ-EVAL Mid-edit Lesson", subjectId: fx.ids.G1_MATHS, status: "PUBLISHED", durationMinutes: 5 } });
const e7b = [];
for (let i = 0; i < 5; i++) e7b.push(await prisma.block.create({ data: { lessonId: e7.id, type: "NOTE", title: `Mid ${i + 1}`, order: i, content: { instructions: `MIDEDIT-${i + 1}` } } }));
save("fixtures-e7.json", { lessonId: e7.id, blockIds: e7b.map((b) => b.id) });
const u7 = lessonUrl(e7.id);
await http(B, u7, { jar }); // creates progress at index 0
await callAction(B, jar, "markBlockDone", [e7.id, e7b[0].id], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: e7.id });
await callAction(B, jar, "markBlockDone", [e7.id, e7b[1].id], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: e7.id }); // now active = block 3 (index 2)
const adminJar = (await loginViaForm(B, "gill@school.nz", process.env.SEED_PASSWORD)).jar;
await callAction(B, adminJar, "deleteBlock", [e7b[0].id, e7.id], { id: e7.id }); // admin deletes an already-finished first block
r = await http(B, u7, { jar }); const mid = blocksFrom(r.text);
const prog7 = await prisma.lessonProgress.findUnique({ where: { facilitatorId_lessonId: { facilitatorId: mokshId, lessonId: e7.id } } });
const neverDone = mid.filter((b) => !prog7.completedBlockIds.includes(b.id) && b.state === "done");
rec("B6", "Admin deletes a finished block mid-lesson: facilitator must not skip an unfinished step", "every step shown as 'done' was actually completed", `states=${summarise(mid)}; steps shown done but never completed by this facilitator: ${neverDone.map((b) => b.title).join(", ") || "none"}; currentBlockIndex=${prog7.currentBlockIndex} now points at "${mid.find((b) => b.order === prog7.currentBlockIndex)?.title}"`,
  neverDone.length === 0, "Progress is stored as a position (currentBlockIndex) plus a set of ids; deleting/reordering blocks renumbers positions but not stored progress.");

save("b-flow.json", results);
console.log(`\n${results.filter((x) => x.pass).length}/${results.length} passed`);
await prisma.$disconnect();
