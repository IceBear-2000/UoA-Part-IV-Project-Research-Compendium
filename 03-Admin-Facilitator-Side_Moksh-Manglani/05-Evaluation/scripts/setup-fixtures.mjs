// Creates clearly-named evaluation fixtures (prefix "ZZ-EVAL") directly in the DB/storage, then records IDs
// in eval/raw/fixtures.json so eval/cleanup.mjs can remove exactly these rows and nothing else.
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "./db.mjs";
import { SUPABASE_URL, SERVICE_KEY, ROOT } from "./env.mjs";
import { save } from "./lib.mjs";

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const G1 = "cmrfsja930009tdbzkefp6pp0"; // NCERT Grade 1 (Moksh + May assigned)
const subj = async (classId, name) => (await prisma.subject.findFirst({ where: { classId, name } })).id;
const classByName = async (name) => (await prisma.class.findFirst({ where: { name } })).id;

const G1_MATHS = await subj(G1, "Maths");
const g4 = await classByName("NCERT Grade 4");
const G4_MATHS = await subj(g4, "Maths");     // May assigned, Moksh NOT assigned
const G4_ENGLISH = await subj(g4, "English"); // May assigned to the class but NOT this subject

async function mkLesson(subjectId, name, status, blocks) {
  const lesson = await prisma.lesson.create({ data: { name, subjectId, status, durationMinutes: 10, description: "evaluation fixture" } });
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    out.push(await prisma.block.create({ data: { lessonId: lesson.id, type: b.type ?? "NOTE", title: b.title ?? `Step ${i + 1}`, order: i, content: b.content ?? { instructions: `SECRET-CONTENT-OF-STEP-${i + 1}` } } }));
  }
  return { lesson, blocks: out };
}

const fx = { created: [], files: [] };

// E1 flow lesson: 5 blocks, block 4 is a READING with a private file (A8)
const e1 = await mkLesson(G1_MATHS, "ZZ-EVAL Flow Lesson", "PUBLISHED", [
  { title: "Step 1" }, { title: "Step 2" }, { title: "Step 3" },
  { type: "READING", title: "Step 4 reading+file", content: { instructions: "SECRET-CONTENT-OF-STEP-4", filePath: null, fileName: "a8-test.pdf" } },
  { title: "Step 5" },
]);
const filePath = `${e1.blocks[3].id}/eval-${Date.now()}-a8-test.pdf`;
const up = await sb.storage.from("block-resources").upload(filePath, fs.readFileSync(`${ROOT}/eval/fixtures/a8-test.pdf`), { contentType: "application/pdf", upsert: true });
if (up.error) throw up.error;
await prisma.block.update({ where: { id: e1.blocks[3].id }, data: { content: { instructions: "SECRET-CONTENT-OF-STEP-4", filePath, fileName: "a8-test.pdf" } } });
fx.files.push(filePath);

const e2 = await mkLesson(G1_MATHS, "ZZ-EVAL Draft Lesson", "DRAFT", [{ title: "Draft step 1" }, { title: "Draft step 2" }]);
const e3 = await mkLesson(G4_MATHS, "ZZ-EVAL Unassigned-class Lesson (for Moksh)", "PUBLISHED", [{ title: "S1" }, { title: "S2" }]);
const e4 = await mkLesson(G4_ENGLISH, "ZZ-EVAL Unassigned-subject Lesson (for May)", "PUBLISHED", [{ title: "S1" }, { title: "S2" }]);
const e5 = await mkLesson(G1_MATHS, "ZZ-EVAL Perf Lesson 25 steps", "PUBLISHED", Array.from({ length: 25 }, (_, i) => ({ title: `Perf step ${i + 1}` })));
const e6 = await mkLesson(G1_MATHS, "ZZ-EVAL Admin-write Lesson", "DRAFT", [{ title: "Existing block" }]);

Object.assign(fx, {
  ids: { G1, G1_MATHS, G4_MATHS, G4_ENGLISH, g4 },
  e1: { lessonId: e1.lesson.id, blockIds: e1.blocks.map((b) => b.id), filePath },
  e2: { lessonId: e2.lesson.id, blockIds: e2.blocks.map((b) => b.id) },
  e3: { lessonId: e3.lesson.id, blockIds: e3.blocks.map((b) => b.id) },
  e4: { lessonId: e4.lesson.id, blockIds: e4.blocks.map((b) => b.id) },
  e5: { lessonId: e5.lesson.id, blockIds: e5.blocks.map((b) => b.id) },
  e6: { lessonId: e6.lesson.id, blockIds: e6.blocks.map((b) => b.id) },
});
save("fixtures.json", fx);
console.log(JSON.stringify(fx.ids), Object.keys(fx).filter((k) => k.startsWith("e")).map((k) => k + "=" + fx[k].lessonId).join(" "));
await prisma.$disconnect();
