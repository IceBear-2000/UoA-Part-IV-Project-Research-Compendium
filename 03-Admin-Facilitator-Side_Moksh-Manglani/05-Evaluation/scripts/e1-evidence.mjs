// Evidence gathering for the heuristic review (section E).
import fs from "node:fs";
import { prisma } from "./db.mjs";
import { loginViaForm, http, save } from "./lib.mjs";
const B = "http://localhost:3002";
const fx = JSON.parse(fs.readFileSync("eval/raw/fixtures.json", "utf8"));
const ev = {};

// 1. published lessons with no blocks, and video problems
const published = await prisma.lesson.findMany({ where: { status: "PUBLISHED", name: { not: { startsWith: "ZZ-EVAL" } } }, include: { blocks: true, subject: { include: { class: true } } } });
ev.publishedLessons = published.length;
ev.publishedZeroBlocks = published.filter((l) => l.blocks.length === 0).map((l) => `${l.subject.class.name} | ${l.subject.name} | ${l.name}`);
const embeddable = (u) => { try { const x = new URL(u); const h = x.hostname.replace(/^www\.|^m\./, ""); if (["youtube.com", "youtube-nocookie.com"].includes(h)) return x.pathname === "/watch" && !!x.searchParams.get("v") || /^\/(shorts|embed)\//.test(x.pathname); if (h === "youtu.be") return x.pathname.length > 1; if (h === "vimeo.com") return /^\/\d+/.test(x.pathname); if (h === "player.vimeo.com") return true; return /\.(mp4|webm|ogg)(\?|$)/i.test(x.pathname); } catch { return false; } };
const videoBlocks = published.flatMap((l) => l.blocks.filter((b) => b.type === "VIDEO").map((b) => ({ l, url: b.content?.url ?? "" })));
ev.videoBlocksInPublishedLessons = videoBlocks.length;
ev.videoNotPlayable = videoBlocks.filter((v) => !embeddable(v.url)).length;
ev.videoEmptyUrl = videoBlocks.filter((v) => !v.url).length;
ev.lessonsWhoseFirstBlockIsAnUnplayableVideo = published.filter((l) => { const b = [...l.blocks].sort((a, c) => a.order - c.order)[0]; return b?.type === "VIDEO" && !embeddable(b.content?.url ?? ""); }).length;
ev.byClassUnplayable = {};
for (const v of videoBlocks) { const k = v.l.subject.class.name; ev.byClassUnplayable[k] ??= { video: 0, unplayable: 0 }; ev.byClassUnplayable[k].video++; if (!embeddable(v.url)) ev.byClassUnplayable[k].unplayable++; }

// 2. what a facilitator sees for an unplayable video (Moksh, Grade 1 Maths "Mango Treat", first block = playlist link)
const jar = (await loginViaForm(B, "moksh@school.nz", process.env.SEED_PASSWORD)).jar;
const mango = published.find((l) => l.name.startsWith("Mango Treat"));
const page = await http(B, `/facilitator/classes/${mango.subject.classId}/subjects/${mango.subjectId}/lessons/${mango.id}`, { jar });
const flat = page.text.replace(/\\"/g, '"');
ev.playerForPlaylistLesson = { status: page.status, firstBlockUrl: (flat.match(/"type":"VIDEO","title":"[^"]*","order":0,"state":"active","content":\{"url":"([^"]+)"/) || [])[1] ?? "(not found)" };

// 3. facilitator lesson list status badge for a lesson this facilitator has COMPLETED (fixture e1 completed in section B)
const list = await http(B, `/facilitator/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}`, { jar });
const i = list.text.indexOf("ZZ-EVAL Flow Lesson");
ev.facilitatorListBadgeForCompletedLesson = { lessonFoundInList: i >= 0, textAround: list.text.slice(i, i + 700).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160), notStartedBadgeCount: (list.text.match(/Not started/g) || []).length };
const prog = await prisma.lessonProgress.findMany({ where: { lessonId: fx.e1.lessonId } });
ev.facilitatorListBadgeForCompletedLesson.dbSaysCompleted = prog.some((p) => p.completedAt);

// 4. page titles
ev.titles = {};
const adminJar = (await loginViaForm(B, "gill@school.nz", process.env.SEED_PASSWORD)).jar;
for (const [p, j] of [["/login", null], ["/about", null], ["/signup", null], ["/admin", adminJar], ["/admin/classes", adminJar], ["/admin/lessons", adminJar], ["/admin/settings", adminJar], ["/facilitator", jar], ["/facilitator/messages", jar]]) { const r = await http(B, p, { jar: j }); ev.titles[p] = (r.text.match(/<title>([^<]*)<\/title>/) || [])[1] ?? "(none)"; }

// 5. 404 and error/loading files
const nf = await http(B, "/facilitator/classes/does-not-exist", { jar });
ev.notFound = { status: nf.status, text: nf.text.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200), hasAppNotFoundFile: fs.existsSync("app/not-found.tsx"), errorTsx: fs.readdirSync("app", { recursive: true }).filter((f) => /(^|\/)(error|loading|global-error)\.tsx$/.test(f)) };

// 6. label association on the login form
const login = await http(B, "/login");
ev.loginLabels = { labels: (login.text.match(/<label[^>]*>/g) || []).length, labelsWithFor: (login.text.match(/<label[^>]*\bfor=/g) || []).length, inputsWithId: (login.text.match(/<input[^>]*\bid=/g) || []).length, inputsTotal: (login.text.match(/<input[^>]*>/g) || []).length, hasAutocomplete: /autocomplete=/.test(login.text) };

// 7. redacted server-action error (what the browser receives when an action throws in production)
const wrongPw = await (await import("./lib.mjs")).callAction(B, adminJar, "changePassword", [{ currentPassword: "wrong-password", newPassword: "ZzEvalNew-Pass-9" }], {});
ev.productionErrorBody = wrongPw.text.slice(0, 160);

// 8. do the Settings-menu "Project docs" links open for a stranger?
const docs = fs.readFileSync("app/admin/_components/SettingsMenu.tsx", "utf8").match(/https:\/\/claude\.ai\/[^"']+/g) ?? [];
ev.projectDocs = [];
for (const u of docs) { const r = await fetch(u, { redirect: "manual" }); ev.projectDocs.push({ url: u.slice(0, 60), status: r.status, location: r.headers.get("location")?.slice(0, 60) ?? null }); }

save("e1-evidence.json", ev);
console.log(JSON.stringify(ev, null, 1));
await prisma.$disconnect();
