// "Not configured" state: same build, ANTHROPIC_API_KEY blanked (port 3003).
import fs from "node:fs";
import { loginViaForm, callAction, save } from "./lib.mjs";
const B = "http://localhost:3003";
const fx = JSON.parse(fs.readFileSync("eval/raw/d-fixtures.json", "utf8"));
const f = fx.find((x) => x.n === "D04");
const adminJar = (await loginViaForm(B, "gill@school.nz", process.env.SEED_PASSWORD)).jar;
const a = await callAction(B, adminJar, "analyzeLessonContent", [f.lessonId], { id: f.lessonId });
const g = await callAction(B, adminJar, "generateWorksheetDraft", [{ summary: "x", questionTypes: ["mcq"], specialInstructions: "" }], { id: f.lessonId });
const grab = (t) => (t.match(/"(summary|warnings|error)".{0,260}/) || [t.slice(0, 200)])[0];
console.log("analyze  HTTP", a.status, "->", grab(a.text));
console.log("generate HTTP", g.status, "->", grab(g.text));
save("d5-nokey.json", { analyze: { status: a.status, body: grab(a.text) }, generate: { status: g.status, body: grab(g.text) } });
