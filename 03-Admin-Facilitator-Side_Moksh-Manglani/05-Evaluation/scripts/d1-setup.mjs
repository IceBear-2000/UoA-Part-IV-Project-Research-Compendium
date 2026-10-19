// Builds the 15 worksheet-generator test lessons (DRAFT, prefix ZZ-EVAL-Dnn) by cloning the blocks of real lessons
// and attaching authored PDF/DOCX sources where the design calls for them. Records everything in eval/raw/d-fixtures.json.
import fs from "node:fs";
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "./db.mjs";
import { SUPABASE_URL, SERVICE_KEY, ROOT } from "./env.mjs";
import { save } from "./lib.mjs";
import { PASSAGES, longDocument } from "./d-sources.mjs";

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const dir = `${ROOT}/eval/fixtures/d`;
function mkPdf(name, text) { fs.writeFileSync(`${dir}/${name}.txt`, text); execSync(`cupsfilter "${dir}/${name}.txt" > "${dir}/${name}.pdf" 2>/dev/null`); return `${dir}/${name}.pdf`; }
function mkDocx(name, text) { fs.writeFileSync(`${dir}/${name}.txt`, text); execSync(`textutil -convert docx "${dir}/${name}.txt" -output "${dir}/${name}.docx"`); return `${dir}/${name}.docx`; }

const PDF = "application/pdf", DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
// id = real lesson to clone; docs = extra authored sources; replaceVideo = override the VIDEO url; empty = strip all content
const PLAN = [
  { n: "D01", real: "cmujl058d0001js04fo2b3zxp", src: "YouTube with captions (short, 1.1k chars) + worksheet block" },
  { n: "D02", real: "cmu9y1pfu001ntdt1i98bxstx", src: "YouTube with captions (14.9k chars) + reading + activity" },
  { n: "D03", real: "cmu9y1rkv005ltdt1aip0v1kd", src: "YouTube with captions (9.2k chars) + reading + activity" },
  { n: "D04", real: "cmrjsq1pd000jl304ncbes58f", src: "YouTube with captions (6.0k chars) + worksheet + break" },
  { n: "D05", real: "cmu9yskns002btdbo9rdi4tan".replace("cmu9yskns002btdbo9rdi4tan", "cmu9ysl0w002ztdbou2q2f3w6"), src: "YouTube with captions (38.6k chars, long transcript) + reading + activity" },
  { n: "D06", real: "cmu9y1rcd0055tdt11gt2jzqj", replaceVideo: "https://www.youtube.com/watch?v=73O60ymw9D4", src: "YouTube WITHOUT captions (transcripts disabled) + reading + activity" },
  { n: "D07", real: "cmu9y1onw0009tdt1j8xfp5bs", docs: [["pdf", "P07_numbers_1_to_9"]], src: "PDF (authored) + playlist link (unreadable) + reading + activity" },
  { n: "D08", real: "cmu9ysm11004ntdbohtx9k6wd", docs: [["docx", "P08_counting_ordering_20"]], src: "DOCX (authored) + channel link (unreadable) + reading + activity" },
  { n: "D09", real: "cmu9ysmrt0061tdbocclvzma7", docs: [["pdf", "P09_living_nonliving"]], src: "PDF (authored) + channel link (unreadable) + reading + activity" },
  { n: "D10", real: "cmu9ysob0008ttdbobmknj884", src: "As seeded: channel link (unreadable) + reading + activity text only" },
  { n: "D11", real: "cmu9ysoow009jtdbopwyxk8w4", empty: true, src: "EMPTY lesson (one blank note block)" },
  { n: "D12", real: "cmu9ysq0800c3tdboq4xg7k9f", docs: [["docx", "P12_fractions"]], src: "DOCX (authored) + channel link (unreadable) + reading + activity" },
  { n: "D13", real: "cmu9ysqdg00cttdbofdyqsmwd", docs: [["pdf", "P13_life_cycles"]], src: "PDF (authored) + channel link (unreadable) + reading + activity" },
  { n: "D14", real: "cmu9ysrxf00fttdbosv5nwjcp", longDoc: true, src: "VERY LONG DOCX (~226k chars; the lesson topic is in the last part) placed first + reading + activity" },
  { n: "D15", real: "cmu9yssbi00gjtdboqma8gns0".replace("cmu9yssbi00gjtdboqma8gns0", "cmu9yss7400gbtdboneguqv42"), docs: [["pdf", "P15a_water_cycle_1"], ["docx", "P15b_water_cycle_2"]], src: "TWO documents (PDF + DOCX, authored) + channel link + reading + activity" },
];

const out = [];
for (const p of PLAN) {
  const real = await prisma.lesson.findUnique({ where: { id: p.real }, include: { blocks: { orderBy: { order: "asc" } }, subject: { include: { class: true } } } });
  const lesson = await prisma.lesson.create({ data: { name: `ZZ-EVAL-${p.n} ${real.name}`, subjectId: real.subjectId, status: "DRAFT", description: real.description, learningObjectives: real.learningObjectives, durationMinutes: real.durationMinutes } });
  const blocks = [];
  let order = 0;
  const add = async (type, title, content, note = null) => { const b = await prisma.block.create({ data: { lessonId: lesson.id, type, title, order: order++, content, facilitatorNote: note } }); blocks.push(b); return b; };
  const docBlocks = [];
  const addDocs = async () => {
    for (const [kind, key] of p.docs ?? []) {
      const file = kind === "pdf" ? mkPdf(`${p.n}-${key}`, PASSAGES[key]) : mkDocx(`${p.n}-${key}`, PASSAGES[key]);
      const b = await add("READING", `Source document (${kind.toUpperCase()})`, { instructions: "", filePath: null, fileName: `${key}.${kind}` });
      const path = `${b.id}/eval-${key}.${kind}`;
      const up = await sb.storage.from("block-resources").upload(path, fs.readFileSync(file), { contentType: kind === "pdf" ? PDF : DOCX, upsert: true });
      if (up.error) throw up.error;
      await prisma.block.update({ where: { id: b.id }, data: { content: { instructions: "", filePath: path, fileName: `${key}.${kind}` } } });
      docBlocks.push(path);
    }
    if (p.longDoc) {
      const file = mkDocx(`${p.n}-long`, longDocument());
      const b = await add("READING", "Very long source (DOCX)", { instructions: "", filePath: null, fileName: "long.docx" });
      const path = `${b.id}/eval-long.docx`;
      const up = await sb.storage.from("block-resources").upload(path, fs.readFileSync(file), { contentType: DOCX, upsert: true });
      if (up.error) throw up.error;
      await prisma.block.update({ where: { id: b.id }, data: { content: { instructions: "", filePath: path, fileName: "long.docx" } } });
      docBlocks.push(path);
    }
  };
  if (p.empty) {
    await add("NOTE", "Blank", { instructions: "" });
  } else {
    if (p.longDoc) await addDocs(); // long source goes first so truncation can only cut later material
    for (const rb of real.blocks) {
      let content = rb.content;
      if (rb.type === "VIDEO" && p.replaceVideo) content = { ...content, url: p.replaceVideo };
      await add(rb.type, rb.title, content, rb.facilitatorNote);
    }
    if (!p.longDoc) await addDocs();
  }
  out.push({ n: p.n, lessonId: lesson.id, real: real.name, cls: real.subject.class.name, subject: real.subject.name, curriculum: real.subject.class.curriculum, src: p.src, blockCount: blocks.length, docPaths: docBlocks });
  console.log(p.n, real.subject.class.name, "|", real.subject.name, "|", real.name, "|", p.src);
}
save("d-fixtures.json", out);
await prisma.$disconnect();
