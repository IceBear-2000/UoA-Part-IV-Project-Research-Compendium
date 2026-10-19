import fs from "node:fs";
const rows = JSON.parse(fs.readFileSync("eval/raw/video-fix-proposal.json", "utf8"));
// Hand review of the automatic matches (done by reading every title): these are poor matches, treated as "needs video".
const REJECT = new Set(["Sharing News", "Retelling a Story", "Looking After Our Environment", "Writing a Recount", "Fluent Reading — Chapter Books", "Writing a Narrative", "Numbers to 1000 — Place Value", "Reading Between the Lines", "Numbers to 10,000", "Fractions and Decimals", "Angles and Shape Properties", "Probability — Likely and Unlikely", "Electricity — Simple Circuits"]);
const WEAK = new Set(["Comparing Size", "Reading for Meaning", "Addition and Subtraction Strategies", "Forces and Motion", "Grammar in Context — Tenses and Sentence Types", "Multi-digit Multiplication and Division", "Life Cycles", "Shapes All Around"]);
const mins = (l) => { if (!l) return 0; const p = l.split(":").map(Number); return p.length === 3 ? p[0] * 60 + p[1] : p[0]; };
const out = rows.map((r) => {
  const p = r.proposal;
  let status = "NEEDS VIDEO", note = "";
  if (p?.embed && !REJECT.has(r.lesson)) {
    status = WEAK.has(r.lesson) ? "REVIEW" : "PROPOSED";
    if (mins(p.length) >= 45) note = `long chapter video (${p.length})`;
    if (r.lesson === "Shapes All Around") note = "chapter 2 (What is Long? What is Round?) is the nearest chapter";
    if (["Addition and Subtraction Strategies", "Forces and Motion"].includes(r.lesson)) note = "same video is proposed for another lesson";
    if (r.lesson === "Multi-digit Multiplication and Division") note = "covers multiplication only";
    if (r.lesson === "Comparing Size") note = "aimed at 2nd grade, about length";
    if (!p.captions) note += (note ? "; " : "") + "no captions (worksheet generator cannot read it)";
  }
  return { ...r, status, note };
});
fs.writeFileSync("eval/raw/video-fix-final.json", JSON.stringify(out, null, 2));
const cnt = (f) => out.filter(f).length;
const md = [];
md.push("# Seeded lessons whose video cannot play: proposed fixes", "", `Generated ${new Date().toISOString().slice(0, 10)}. **Nothing in the database has been changed.** ${out.length} video blocks in published lessons cannot play in the app's player.`, "");
md.push("| Result | Count |", "|---|---|", `| PROPOSED (specific embeddable video found, matches the lesson) | ${cnt((r) => r.status === "PROPOSED")} |`, `| REVIEW (found, but a weaker match) | ${cnt((r) => r.status === "REVIEW")} |`, `| NEEDS VIDEO (no good match found; I would flag it) | ${cnt((r) => r.status === "NEEDS VIDEO")} |`, "");
md.push("Current links: " + ["playlist", "channel", "placeholder", "empty"].map((k) => `${cnt((r) => r.kind === k)} ${k}`).join(", ") + ". Every proposal was checked as embeddable (YouTube oEmbed). The app now plays playlist links by itself (first video plays), so the playlist lessons already work; the proposals below replace them with the exact chapter.", "");
md.push("| Status | Class | Subject | Lesson | Current link | Proposed video | Channel | Length | Captions | Note |", "|---|---|---|---|---|---|---|---|---|---|");
for (const r of out) {
  const p = r.proposal;
  const ok = r.status !== "NEEDS VIDEO";
  md.push(`| ${r.status} | ${r.cls} | ${r.subject} | ${r.lesson} | ${r.kind} | ${ok ? `[${p.title.replace(/\|/g, "/").slice(0, 80)}](${p.url})` : "none"} | ${ok ? p.channel : ""} | ${ok ? p.length : ""} | ${ok ? (p.captions ? "yes" : "no") : ""} | ${r.note} |`);
}
fs.writeFileSync("eval/video-fix-proposal.md", md.join("\n") + "\n");
console.log(md.slice(0, 9).join("\n"));
const csv = ["status,class,subject,lesson,lessonId,blockId,currentUrl,proposedUrl,proposedTitle,channel,length,captions,note", ...out.map((r) => [r.status, r.cls, r.subject, r.lesson, r.lessonId, r.blockId, r.url, r.status !== "NEEDS VIDEO" ? r.proposal.url : "", r.status !== "NEEDS VIDEO" ? r.proposal.title : "", r.status !== "NEEDS VIDEO" ? r.proposal.channel : "", r.status !== "NEEDS VIDEO" ? r.proposal.length : "", r.status !== "NEEDS VIDEO" ? r.proposal.captions : "", r.note].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))];
fs.writeFileSync("eval/video-fix-proposal.csv", csv.join("\n") + "\n");
