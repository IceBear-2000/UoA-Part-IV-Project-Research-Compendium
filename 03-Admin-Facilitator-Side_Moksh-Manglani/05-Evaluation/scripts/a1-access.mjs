// Checks A1-A4, A10 and extras X4 (origin check), X7 (messaging isolation). Local production build + prod (unauthenticated only).
import fs from "node:fs";
import { prisma } from "./db.mjs";
import { loginViaForm, http, callAction, save } from "./lib.mjs";

const B = "http://localhost:3002";
const PROD = "https://study-buddy-uoa-project.vercel.app";
const fx = JSON.parse(fs.readFileSync("eval/raw/fixtures.json", "utf8"));
const LOG = "/tmp/eval-server.log";
const USAGE = "eval/raw/anthropic-usage.jsonl";
const results = [];
const rec = (id, check, expected, actual, pass, evidence = "") => { results.push({ id, check, expected, actual, pass, evidence }); console.log(pass ? "PASS" : "FAIL", id, "-", check, "=>", actual); };

let logOffset = fs.statSync(LOG).size;
const newLog = async () => { await new Promise((r) => setTimeout(r, 250)); const buf = fs.readFileSync(LOG); const t = buf.subarray(logOffset).toString("utf8"); logOffset = buf.length; return t; };
const lastErr = (t) => [...t.matchAll(/^(?:⨯ )?Error: (.+)$/gm)].map((m) => m[1]).pop();
const usageLines = () => (fs.existsSync(USAGE) ? fs.readFileSync(USAGE, "utf8").split("\n").filter(Boolean).length : 0);

const org = await prisma.organisation.findFirst();
const moksh = await prisma.user.findUnique({ where: { email: "moksh@school.nz" } });
const may = await prisma.user.findUnique({ where: { email: "may@school.nz" } });
const gill = await prisma.user.findUnique({ where: { email: "gill@school.nz" } });

const adminRoutes = ["/admin", "/admin/classes", `/admin/classes/${fx.ids.G1}`, `/admin/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}`, "/admin/facilitators", "/admin/lessons", `/admin/lessons/${fx.e6.lessonId}`, `/admin/lessons/${fx.e6.lessonId}/worksheet-generator`, "/admin/lessons/new", "/admin/messages", "/admin/requests", "/admin/settings"];
const facRoutes = ["/facilitator", `/facilitator/classes/${fx.ids.G1}`, `/facilitator/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}`, `/facilitator/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}/lessons/${fx.e1.lessonId}`, `/facilitator/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}/lessons/${fx.e1.lessonId}/complete`, "/facilitator/messages", "/facilitator/notifications", "/dashboard"];

// ---------------- A1 unauthenticated redirects ----------------
for (const [name, base] of [["local prod build", B], ["live production (syd1)", PROD]]) {
  const rows = [];
  for (const p of [...adminRoutes, ...facRoutes]) {
    const r = await http(base, p);
    rows.push({ p, status: r.status, loc: r.location });
  }
  const bad = rows.filter((x) => !(x.status === 307 && /\/login$/.test(x.loc ?? "")));
  rec("A1", `Unauthenticated GET of every /admin/*, /facilitator/*, /dashboard route [${name}]`, "all redirect to /login (307), no page content", `${rows.length - bad.length}/${rows.length} redirect to /login; non-conforming: ${bad.map((b) => `${b.p}=>${b.status}`).join(", ") || "none"}`, bad.length === 0, rows.map((x) => `${x.p} -> ${x.status} ${x.loc}`).join("\n"));
}
// unauthenticated forged action (admin action, no cookie)
const beforeClasses = await prisma.class.count();
const unauth = await callAction(B, null, "createClass", ["ZZ-EVAL-unauth-forged"], {});
const afterClasses = await prisma.class.count();
rec("A1b", "Unauthenticated forged Server Action (createClass) with no cookie", "blocked before the action runs; no class created", `HTTP ${unauth.status} -> ${unauth.location}; classes ${beforeClasses} -> ${afterClasses}`, unauth.status === 307 && beforeClasses === afterClasses);

// ---------------- sessions ----------------
const adminJar = (await loginViaForm(B, "gill@school.nz", process.env.SEED_PASSWORD)).jar;
const mokshJar = (await loginViaForm(B, "moksh@school.nz", process.env.SEED_PASSWORD)).jar;
const mayJar = (await loginViaForm(B, "may@school.nz", process.env.SEED_PASSWORD)).jar;


// ---------------- A2b + A10: forged admin Server Actions as a facilitator ----------------
const fakeApprove = await prisma.signupRequest.create({ data: { name: "ZZ-EVAL Forge Approve", email: "zz-eval-forge-approve@example.com", organisationId: org.id } });
const fakeReject = await prisma.signupRequest.create({ data: { name: "ZZ-EVAL Forge Reject", email: "zz-eval-forge-reject@example.com", organisationId: org.id } });
const baseline = {
  classes: await prisma.class.count(), subjects: await prisma.subject.count(),
  e6blocks: await prisma.block.count({ where: { lessonId: fx.e6.lessonId } }), e6status: (await prisma.lesson.findUnique({ where: { id: fx.e6.lessonId } })).status,
  e6block0title: (await prisma.block.findUnique({ where: { id: fx.e6.blockIds[0] } })).title,
  asg: await prisma.facilitatorAssignment.count({ where: { facilitatorId: moksh.id } }),
  mokshName: moksh.name, orgName: org.name, usage: usageLines(),
};
const cp = { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, id: fx.e6.lessonId, lessonId: fx.e6.lessonId };
const forged = [
  ["createClass", ["ZZ-EVAL-forged-class"], {}],
  ["createSubject", [fx.ids.G1, "ZZ-EVAL-forged-subject"], {}],
  ["syncClassAssignments", [moksh.id, fx.ids.g4, [fx.ids.G4_MATHS]], {}],
  ["addBlock", [fx.e6.lessonId, "NOTE"], cp],
  ["updateBlock", [fx.e6.blockIds[0], fx.e6.lessonId, { title: "HACKED", facilitatorNote: null, content: { instructions: "HACKED" } }], cp],
  ["deleteBlock", ["zz-nonexistent-block", fx.e6.lessonId], cp],
  ["reorderBlocks", [fx.e6.lessonId, [fx.e6.blockIds[0]]], cp],
  ["removeBlockFile", [fx.e6.lessonId, "zz-nonexistent-block"], cp],
  ["getBlockFilePreviewUrl", [fx.e1.filePath], cp],
  ["togglePublish", [fx.e6.lessonId, "PUBLISHED"], cp],
  ["analyzeLessonContent", [fx.e6.lessonId], cp],
  ["generateWorksheetDraft", [{ summary: "Plants need water.", questionTypes: ["mcq"], specialInstructions: "" }], cp],
  ["finalizeWorksheetBlock", [fx.e6.lessonId, { title: "x", studentInstructions: "x", questions: [{ type: "short_answer", prompt: "q", answer: "a" }] }], cp],
  ["approveRequest", [fakeApprove.id, []], {}],
  ["rejectRequest", [fakeReject.id, "forged"], {}],
  ["updateProfile", ["ZZ-HACKED-NAME"], {}],
  ["changePassword", [{ currentPassword: process.env.SEED_PASSWORD, newPassword: "ZzEvalHacked-1" }], {}],
  ["updateOrganisationName", ["ZZ-HACKED-ORG"], {}],
  ["removeClassBanner", [fx.ids.G1], { classId: fx.ids.G1 }],
];
const forgedRows = [];
for (const [name, args, repl] of forged) {
  await newLog();
  const res = await callAction(B, mokshJar, name, args, repl);
  const l = await newLog();
  forgedRows.push({ name, status: res.status, guard: lastErr(l), leakedUrl: /token=|signedURL|supabase\.co\/storage/.test(res.text) });
}
const after = {
  classes: await prisma.class.count(), subjects: await prisma.subject.count(),
  e6blocks: await prisma.block.count({ where: { lessonId: fx.e6.lessonId } }), e6status: (await prisma.lesson.findUnique({ where: { id: fx.e6.lessonId } })).status,
  e6block0title: (await prisma.block.findUnique({ where: { id: fx.e6.blockIds[0] } })).title,
  asg: await prisma.facilitatorAssignment.count({ where: { facilitatorId: moksh.id } }),
  mokshName: (await prisma.user.findUnique({ where: { id: moksh.id } })).name, orgName: (await prisma.organisation.findFirst()).name, usage: usageLines(),
};
const approveStatus = (await prisma.signupRequest.findUnique({ where: { id: fakeApprove.id } })).status;
const rejectStatus = (await prisma.signupRequest.findUnique({ where: { id: fakeReject.id } })).status;
const stillOldPw = (await loginViaForm(B, "moksh@school.nz", process.env.SEED_PASSWORD)).ok;
const unguarded = forgedRows.filter((x) => x.guard !== "Unauthorized" || x.status === 200);
const effects = JSON.stringify(baseline) === JSON.stringify(after) && approveStatus === "PENDING" && rejectStatus === "PENDING" && stillOldPw;
rec("A2b", `Forged admin Server Actions sent with a facilitator session (${forged.length} actions, raw POST with Next-Action header)`,
  "every call rejected with 'Unauthorized' (server log) and no data changed",
  `${forged.length - unguarded.length}/${forged.length} rejected with "Unauthorized"; unguarded: ${unguarded.map((u) => u.name).join(", ") || "none"}; data unchanged (classes, subjects, blocks, publish status, block title, Moksh's assignments, names, org name): ${JSON.stringify(baseline) === JSON.stringify(after)}; fake requests still PENDING: ${approveStatus}/${rejectStatus}; Moksh's password unchanged: ${stillOldPw}`,
  unguarded.length === 0 && effects, forgedRows.map((x) => `${x.name}: HTTP ${x.status}, server error="${x.guard}"`).join("\n"));
const worksheetNames = ["analyzeLessonContent", "generateWorksheetDraft", "finalizeWorksheetBlock"];
const wsRows = forgedRows.filter((x) => worksheetNames.includes(x.name));
rec("A10", "Worksheet generator endpoints (analyze, generate, finalize) called by a non-admin", "rejected; no Anthropic API call made; no block created", `${wsRows.map((w) => `${w.name}: HTTP ${w.status} "${w.guard}"`).join("; ")}; Anthropic calls logged during test: ${after.usage - baseline.usage}; blocks in test lesson ${baseline.e6blocks} -> ${after.e6blocks}`,
  wsRows.every((w) => w.guard === "Unauthorized") && after.usage === baseline.usage && after.e6blocks === baseline.e6blocks);
// worksheet generator with NO session at all
const uA = usageLines();
const anon = await callAction(B, null, "generateWorksheetDraft", [{ summary: "x", questionTypes: ["mcq"], specialInstructions: "" }], { id: fx.e6.lessonId });
rec("A10b", "Worksheet generator action with no session at all", "redirected to /login, no API call", `HTTP ${anon.status} -> ${anon.location}; Anthropic calls: ${usageLines() - uA}`, anon.status === 307 && usageLines() === uA);

// admin positive control (proves the forged requests above were well-formed, so rejections are due to the role check)
await newLog();
const ctrl = await callAction(B, adminJar, "addBlock", [fx.e6.lessonId, "NOTE"], cp);
const ctrlBlocks = await prisma.block.count({ where: { lessonId: fx.e6.lessonId } });
rec("A2c", "Positive control: the same forged-request format with an ADMIN session", "accepted and executes (proves the facilitator rejections are role-based, not malformed requests)", `HTTP ${ctrl.status}; blocks ${after.e6blocks} -> ${ctrlBlocks}`, ctrl.status === 200 && ctrlBlocks === after.e6blocks + 1);

// ---------------- A3 not-granted lessons ----------------
{
  const cases = [
    ["Moksh -> lesson in a class he is NOT assigned to (Grade 4 Maths), correct URL", mokshJar, `/facilitator/classes/${fx.ids.g4}/subjects/${fx.ids.G4_MATHS}/lessons/${fx.e3.lessonId}`],
    ["Moksh -> that class's subject list", mokshJar, `/facilitator/classes/${fx.ids.g4}`],
    ["Moksh -> that subject's lesson list", mokshJar, `/facilitator/classes/${fx.ids.g4}/subjects/${fx.ids.G4_MATHS}`],
    ["Moksh -> URL-guess: his OWN class+subject path but the other class's lesson id", mokshJar, `/facilitator/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}/lessons/${fx.e3.lessonId}`],
    ["Moksh -> completion page of a lesson he is not assigned to", mokshJar, `/facilitator/classes/${fx.ids.g4}/subjects/${fx.ids.G4_MATHS}/lessons/${fx.e3.lessonId}/complete`],
    ["May -> class she IS assigned to, subject she is NOT (Grade 4 English), correct URL", mayJar, `/facilitator/classes/${fx.ids.g4}/subjects/${fx.ids.G4_ENGLISH}/lessons/${fx.e4.lessonId}`],
    ["May -> that subject's lesson list", mayJar, `/facilitator/classes/${fx.ids.g4}/subjects/${fx.ids.G4_ENGLISH}`],
    ["May -> URL-guess: her granted Grade 4 Maths path with the English lesson id", mayJar, `/facilitator/classes/${fx.ids.g4}/subjects/${fx.ids.G4_MATHS}/lessons/${fx.e4.lessonId}`],
  ];
  const rows = [];
  for (const [label, jar, p] of cases) { const r = await http(B, p, { jar }); rows.push({ label, status: r.status, leaked: /ZZ-EVAL/.test(r.text) && /SECRET|S1|S2/.test(r.text) && r.status === 200 }); }
  const bad = rows.filter((x) => x.status !== 404);
  rec("A3", "Facilitator opens a lesson/class/subject they were not granted (incl. guessing the URL)", "404 for every case, nothing leaked", `${rows.length - bad.length}/${rows.length} returned 404; non-conforming: ${bad.map((b) => `${b.label}=>${b.status}`).join("; ") || "none"}`, bad.length === 0, rows.map((x) => `${x.label}: HTTP ${x.status}`).join("\n"));
  await newLog();
  const fm = await callAction(B, mokshJar, "markBlockDone", [fx.e3.lessonId, fx.e3.blockIds[0]], { classId: fx.ids.g4, subjectId: fx.ids.G4_MATHS, lessonId: fx.e3.lessonId });
  const fl = await newLog();
  const fm2 = await callAction(B, mayJar, "markBlockDone", [fx.e4.lessonId, fx.e4.blockIds[0]], { classId: fx.ids.g4, subjectId: fx.ids.G4_ENGLISH, lessonId: fx.e4.lessonId });
  const fl2 = await newLog();
  const progCount = await prisma.lessonProgress.count({ where: { lessonId: { in: [fx.e3.lessonId, fx.e4.lessonId] } } });
  rec("A3b", "Forged markBlockDone on a lesson the facilitator was not granted (class not granted / subject not granted)", "rejected 'Not assigned to this lesson'; no progress row created", `Moksh: HTTP ${fm.status} "${lastErr(fl)}"; May: HTTP ${fm2.status} "${lastErr(fl2)}"; progress rows created: ${progCount}`, lastErr(fl) === "Not assigned to this lesson" && lastErr(fl2) === "Not assigned to this lesson" && progCount === 0);
  const ctrlPos = await http(B, `/facilitator/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}/lessons/${fx.e1.lessonId}`, { jar: mokshJar });
  rec("A3c", "Positive control: Moksh opens a lesson in his own granted subject", "200", `HTTP ${ctrlPos.status}`, ctrlPos.status === 200);
}

// ---------------- A4 drafts ----------------
{
  const url = `/facilitator/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}/lessons/${fx.e2.lessonId}`;
  const open = await http(B, url, { jar: mokshJar });
  const complete = await http(B, url + "/complete", { jar: mokshJar });
  const list = await http(B, `/facilitator/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}`, { jar: mokshJar });
  await newLog();
  const fm = await callAction(B, mokshJar, "markBlockDone", [fx.e2.lessonId, fx.e2.blockIds[0]], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e2.lessonId });
  const fl = await newLog();
  const prog = await prisma.lessonProgress.count({ where: { lessonId: fx.e2.lessonId } });
  rec("A4", "Draft lesson in a facilitator's own granted subject: open by URL, see in list, mark a step done", "404 on open + complete; absent from the lesson list; markBlockDone rejected; no progress row", `open=${open.status}; complete=${complete.status}; listed in subject list=${list.text.includes("ZZ-EVAL Draft Lesson")}; markBlockDone HTTP ${fm.status} "${lastErr(fl)}"; progress rows=${prog}`,
    open.status === 404 && complete.status === 404 && !list.text.includes("ZZ-EVAL Draft Lesson") && lastErr(fl) === "Lesson not found" && prog === 0);
  // positive control: publish -> visible; then unpublish again
  await callAction(B, adminJar, "togglePublish", [fx.e2.lessonId, "PUBLISHED"], { id: fx.e2.lessonId });
  const nowOpen = await http(B, url, { jar: mokshJar });
  const nowList = await http(B, `/facilitator/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}`, { jar: mokshJar });
  await callAction(B, adminJar, "togglePublish", [fx.e2.lessonId, "DRAFT"], { id: fx.e2.lessonId });
  await prisma.lessonProgress.deleteMany({ where: { lessonId: fx.e2.lessonId } });
  const hiddenAgain = await http(B, url, { jar: mokshJar });
  rec("A4b", "Positive control: admin publishes the draft, then unpublishes it", "visible+openable only while PUBLISHED", `published: open=${nowOpen.status}, in list=${nowList.text.includes("ZZ-EVAL Draft Lesson")}; unpublished again: open=${hiddenAgain.status}`, nowOpen.status === 200 && nowList.text.includes("ZZ-EVAL Draft Lesson") && hiddenAgain.status === 404);
}

// ---------------- X4 cross-origin forged action ----------------
{
  const before = await prisma.block.count({ where: { lessonId: fx.e6.lessonId } });
  await newLog();
  const r = await callAction(B, adminJar, "addBlock", [fx.e6.lessonId, "NOTE"], cp, { origin: "https://evil.example" });
  const l = await newLog();
  const afterN = await prisma.block.count({ where: { lessonId: fx.e6.lessonId } });
  rec("X4", "CSRF: valid admin session cookie, Server Action POST with Origin: https://evil.example", "rejected by the framework's origin check; no block added", `HTTP ${r.status}; blocks ${before} -> ${afterN}; log="${(l.match(/Invalid Server Actions request|x-forwarded-host[^\n]*/) || ["(none)"])[0]}"`, afterN === before);
}

// ---------------- X7 messaging isolation ----------------
{
  const before = await prisma.message.count();
  await newLog();
  const r = await callAction(B, mokshJar, "sendMessageAction", [may.id, "ZZ-EVAL facilitator-to-facilitator"], { classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS, lessonId: fx.e1.lessonId });
  const l = await newLog();
  const afterN = await prisma.message.count();
  rec("X7", "Facilitator tries to message another facilitator (and so read/pollute a non-admin thread)", "rejected; no message stored", `HTTP ${r.status}; server error="${lastErr(l)}"; messages ${before} -> ${afterN}`, afterN === before);
}

save("a1-access.json", results);
await prisma.signupRequest.deleteMany({ where: { id: { in: [fakeApprove.id, fakeReject.id] } } });
console.log(`\n${results.filter((x) => x.pass).length}/${results.length} passed`);
await prisma.$disconnect();
