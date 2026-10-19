import "server-only";
import JSZip from "jszip";
import { BlockType } from "@prisma/client";
import { BLOCK_META } from "@/lib/block-meta";

// Spreadsheet lesson plan: one row per block. Columns (header row required, any order):
//   type      Video, Workbook, Activity, Worksheet, Reading, Quiz, Discussion, Break or Note
//   title     shown to the facilitator (defaults to the type name)
//   content   a URL (Video, Worksheet), a page range such as 12-13 (Workbook), or instructions (the rest)
//   duration  minutes (optional)
// Accepts .csv (comma, semicolon or tab separated) and .xlsx (first sheet).

export const MAX_PLAN_ROWS = 100;
export const MAX_PLAN_BYTES = 1024 * 1024;

export type PlanBlock = {
  type: BlockType;
  title: string;
  content: Record<string, unknown>;
  facilitatorNote: string | null;
  minutes: number | null;
};
export type PlanResult = { blocks: PlanBlock[]; errors: string[] };

const HEADER_ALIASES: Record<"type" | "title" | "content" | "duration", string[]> = {
  type: ["type", "block type", "block"],
  title: ["title", "name", "step"],
  content: ["content", "url", "link", "instructions", "details", "description", "notes"],
  duration: ["duration", "minutes", "mins", "time", "duration minutes"],
};

const TYPE_BY_NAME = new Map<string, BlockType>(
  (Object.keys(BLOCK_META) as BlockType[]).flatMap((t) => [
    [t.toLowerCase(), t] as const,
    [BLOCK_META[t].label.toLowerCase(), t] as const,
  ]),
);

function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", ";", "\t"]
    .map((d) => ({ d, n: firstLine.split(d).length }))
    .sort((a, b) => b.n - a.n)[0].d;

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const unescapeXml = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");

const textOf = (xml: string) =>
  unescapeXml(Array.from(xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)).map((m) => m[1]).join(""));

function columnIndex(ref: string): number {
  const letters = ref.replace(/[0-9]/g, "");
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

async function parseXlsx(buffer: Buffer): Promise<string[][]> {
  const zip = await JSZip.loadAsync(buffer);

  const sharedXml = (await zip.file("xl/sharedStrings.xml")?.async("string")) ?? "";
  const shared = Array.from(sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)).map((m) => textOf(m[1]));

  // First sheet in the workbook, resolved through the relationships file.
  let sheetPath = "xl/worksheets/sheet1.xml";
  const workbook = (await zip.file("xl/workbook.xml")?.async("string")) ?? "";
  const rels = (await zip.file("xl/_rels/workbook.xml.rels")?.async("string")) ?? "";
  const rid = workbook.match(/<sheet\b[^>]*\br:id="([^"]+)"/)?.[1];
  if (rid) {
    const rel = Array.from(rels.matchAll(/<Relationship\b[^>]*>/g))
      .map((m) => m[0])
      .find((tag) => tag.includes(`Id="${rid}"`));
    const target = rel?.match(/Target="([^"]+)"/)?.[1];
    if (target) sheetPath = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
  }
  const sheet = await zip.file(sheetPath)?.async("string");
  if (!sheet) throw new Error("Could not find a worksheet in this file.");

  const rows: string[][] = [];
  for (const rowMatch of Array.from(sheet.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g))) {
    const cells: string[] = [];
    for (const c of Array.from(rowMatch[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g))) {
      const attrs = c[1];
      const inner = c[2] ?? "";
      const ref = attrs.match(/\br="([A-Z]+[0-9]+)"/)?.[1];
      if (!ref) continue;
      const t = attrs.match(/\bt="([^"]+)"/)?.[1];
      let value = "";
      if (t === "s") value = shared[Number(inner.match(/<v>([\s\S]*?)<\/v>/)?.[1])] ?? "";
      else if (t === "inlineStr") value = textOf(inner);
      else value = unescapeXml(inner.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "");
      cells[columnIndex(ref)] = value;
    }
    rows.push(Array.from(cells, (v) => v ?? ""));
  }
  return rows;
}

const looksLikeUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());

function toBlock(type: BlockType, title: string, text: string, minutes: number | null): PlanBlock {
  const base = { type, title: title || BLOCK_META[type].label, facilitatorNote: null as string | null, minutes };
  switch (type) {
    case BlockType.VIDEO:
      return { ...base, content: { url: text, durationSeconds: minutes ? minutes * 60 : null } };
    case BlockType.WORKBOOK: {
      const nums = text.match(/\d+/g)?.map(Number) ?? [];
      return { ...base, content: { pageStart: nums[0] ?? null, pageEnd: nums[1] ?? nums[0] ?? null } };
    }
    case BlockType.WORKSHEET:
      return looksLikeUrl(text)
        ? { ...base, content: { fileUrl: text, filePath: null, fileName: null, generatedByAI: false } }
        : { ...base, content: { fileUrl: "", filePath: null, fileName: null, generatedByAI: false }, facilitatorNote: text || null };
    case BlockType.READING:
      return { ...base, content: { instructions: text, filePath: null, fileName: null } };
    default:
      return { ...base, content: { instructions: text } };
  }
}

export async function parseLessonPlan(buffer: Buffer, fileName: string): Promise<PlanResult> {
  const lower = fileName.toLowerCase();
  let table: string[][];
  try {
    if (lower.endsWith(".xlsx")) table = await parseXlsx(buffer);
    else if (lower.endsWith(".csv") || lower.endsWith(".txt")) table = parseCsv(buffer.toString("utf8"));
    else return { blocks: [], errors: ["Please upload a .csv or .xlsx file."] };
  } catch {
    return { blocks: [], errors: ["That file could not be read. Check it is a valid .csv or .xlsx file."] };
  }

  table = table.filter((r) => r.some((c) => c.trim() !== ""));
  if (table.length < 2) return { blocks: [], errors: ["The spreadsheet needs a header row and at least one block row."] };

  const header = table[0].map((h) => h.trim().toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim());
  const col = (key: keyof typeof HEADER_ALIASES) => header.findIndex((h) => HEADER_ALIASES[key].includes(h));
  const iType = col("type"), iTitle = col("title"), iContent = col("content"), iDuration = col("duration");
  if (iType < 0) return { blocks: [], errors: ['The header row needs a "type" column (Video, Activity, Worksheet and so on).'] };
  if (table.length - 1 > MAX_PLAN_ROWS) return { blocks: [], errors: [`Too many rows: the limit is ${MAX_PLAN_ROWS} blocks per lesson.`] };

  const blocks: PlanBlock[] = [];
  const errors: string[] = [];
  table.slice(1).forEach((row, i) => {
    const line = i + 2;
    const typeText = (row[iType] ?? "").trim().toLowerCase();
    const type = TYPE_BY_NAME.get(typeText);
    if (!type) {
      errors.push(`Row ${line}: "${row[iType] ?? ""}" is not a block type.`);
      return;
    }
    const text = (iContent >= 0 ? row[iContent] ?? "" : "").trim();
    const durationRaw = (iDuration >= 0 ? row[iDuration] ?? "" : "").trim();
    const minutes = durationRaw && !Number.isNaN(Number(durationRaw)) ? Math.max(0, Math.round(Number(durationRaw))) : null;
    if (durationRaw && minutes === null) errors.push(`Row ${line}: duration "${durationRaw}" is not a number of minutes.`);
    if (type === BlockType.VIDEO && text && !looksLikeUrl(text)) errors.push(`Row ${line}: a Video needs a web link in the content column.`);
    blocks.push(toBlock(type, (iTitle >= 0 ? row[iTitle] ?? "" : "").trim().slice(0, 120), text, minutes));
  });
  return { blocks, errors };
}
