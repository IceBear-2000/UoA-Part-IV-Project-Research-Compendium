// Checks A5 (unapproved sign-in), A6 (invite links), A7 (password change), A8 (file privacy / signed-link expiry).
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "./db.mjs";
import { SUPABASE_URL, ANON_KEY, SERVICE_KEY } from "./env.mjs";
import { loginViaForm, http, callAction, postForm, save } from "./lib.mjs";

const B = "http://localhost:3002";
const fx = JSON.parse(fs.readFileSync("eval/raw/fixtures.json", "utf8"));
const LOG = "/tmp/eval-server.log";
const results = [];
const rec = (id, check, expected, actual, pass, evidence = "") => { results.push({ id, check, expected, actual, pass, evidence }); console.log(pass ? "PASS" : "FAIL", id, "-", check, "=>", actual); };
let logOffset = fs.statSync(LOG).size;
const newLog = async () => { await new Promise((r) => setTimeout(r, 250)); const buf = fs.readFileSync(LOG); const t = buf.subarray(logOffset).toString("utf8"); logOffset = buf.length; return t; };
const lastErr = (t) => [...t.matchAll(/^(?:⨯ )?Error: (.+)$/gm)].map((m) => m[1]).pop();
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const authUser = async (email) => (await sb.auth.admin.listUsers({ page: 1, perPage: 500 })).data.users.find((u) => u.email === email);
const org = await prisma.organisation.findFirst();
const adminJar = (await loginViaForm(B, "gill@school.nz", process.env.SEED_PASSWORD)).jar;

// ---------------- A5: signed up but not approved ----------------
const unEmail = "zz-eval-unapproved@example.com";
const sub = await postForm(B, "/signup", { name: "ZZ-EVAL Unapproved", email: unEmail, requestedClassNote: "eval" });
const reqRow = await prisma.signupRequest.findFirst({ where: { email: unEmail } });
const hadAuth = await authUser(unEmail);
const attempts = [];
for (const pw of ["password", process.env.SEED_PASSWORD, "ZZ-EVAL-guess-1", ""]) { const r = await loginViaForm(B, unEmail, pw); attempts.push({ pw: pw || "(empty)", ok: r.ok, to: r.res.location }); }
rec("A5", "Person who requested access but has not been approved tries to sign in", "request stored as PENDING, no auth account exists, every sign-in attempt rejected",
  `signup redirect=${sub.location}; request status=${reqRow?.status}; Supabase auth user exists=${!!hadAuth}; sign-in attempts (4 passwords) succeeded=${attempts.filter((a) => a.ok).length}/4, all redirected to ${[...new Set(attempts.map((a) => a.to))].join(" | ")}`,
  reqRow?.status === "PENDING" && !hadAuth && attempts.every((a) => !a.ok));

// ---------------- A6: invite links ----------------
const invEmail = "zz-eval-invite@example.com";
const invReq = await prisma.signupRequest.create({ data: { name: "ZZ-EVAL Invitee", email: invEmail, organisationId: org.id } });
const appr = await callAction(B, adminJar, "approveRequest", [invReq.id, [{ classId: fx.ids.G1, subjectId: fx.ids.G1_MATHS }]], {});
const linkMatch = appr.text.match(/"inviteLink":"([^"]+)"/);
const link = linkMatch ? JSON.parse(`"${linkMatch[1]}"`) : null;
const invUser = await prisma.user.findUnique({ where: { email: invEmail } });
const unconfirmed = await authUser(invEmail);
rec("A6-setup", "Admin approves a request (as the real flow does)", "unconfirmed Supabase user + facilitator row + invite link; email send disabled for the test", `HTTP ${appr.status}; app user=${invUser?.role}; auth user confirmed=${!!unconfirmed?.email_confirmed_at}; link host=${link ? new URL(link).host : "none"}`, !!link && invUser?.role === "FACILITATOR");

const preAct = [];
for (const pw of ["password", process.env.SEED_PASSWORD, link ? new URL(link).searchParams.get("token") ?? "x" : "x"]) { const r = await loginViaForm(B, invEmail, pw); preAct.push(r.ok); }
rec("A5b", "Approved person who has NOT yet opened the invite link tries to sign in (guessed passwords + the link's own token as password)", "rejected (no password exists yet)", `succeeded=${preAct.filter(Boolean).length}/3`, preAct.every((x) => !x));

// tampered link first (must not consume the real token)
const u = new URL(link);
const tok = u.searchParams.get("token");
u.searchParams.set("token", tok.slice(0, -1) + (tok.slice(-1) === "a" ? "b" : "a"));
const tam = await fetch(u.toString(), { redirect: "manual" });
const tamLoc = tam.headers.get("location") ?? "";
rec("A6a", "Tampered invite link (last character of the token changed)", "rejected, no session tokens issued", `HTTP ${tam.status}; ${tamLoc.includes("access_token") ? "ISSUED TOKENS" : "no tokens"}; ${decodeURIComponent((tamLoc.match(/error_description=([^&]+)/) || [, ""])[1]).replace(/\+/g, " ") || tam.status}`, !tamLoc.includes("access_token"));

// first genuine use
const first = await fetch(link, { redirect: "manual" });
const firstLoc = first.headers.get("location") ?? "";
const frag = new URLSearchParams(firstLoc.split("#")[1] ?? "");
rec("A6b", "Genuine invite link used once", "issues a session (access + refresh token) and redirects to /auth/confirm", `HTTP ${first.status}; redirect host/path=${firstLoc.split("#")[0]}; access_token issued=${frag.has("access_token")}; refresh_token issued=${frag.has("refresh_token")}`, frag.has("access_token") && frag.has("refresh_token"));

// reuse
const reuse = await fetch(link, { redirect: "manual" });
const reuseLoc = reuse.headers.get("location") ?? "";
rec("A6c", "Same invite link used a second time", "rejected (single-use)", `HTTP ${reuse.status}; ${reuseLoc.includes("access_token") ? "ISSUED TOKENS AGAIN" : "no tokens"}; ${decodeURIComponent((reuseLoc.match(/error_description=([^&]+)/) || [, ""])[1]).replace(/\+/g, " ")}`, !reuseLoc.includes("access_token"));
rec("A6d", "Expired invite link", "rejected after expiry", "NOT RUN: Supabase invite-link lifetime is a project auth setting that cannot be read with the keys available here, and waiting out an unknown lifetime was not practical. The app's /auth/confirm page and /set-password show 'This link has expired or already been used' for expired/invalid links (code review).", null);

// activate with the tokens exactly as /auth/confirm does client-side, set the first password
const client = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
await client.auth.setSession({ access_token: frag.get("access_token"), refresh_token: frag.get("refresh_token") });
const setFirst = await client.auth.updateUser({ password: "ZzEval-First-Pw-1" });
const afterAct = await loginViaForm(B, invEmail, "ZzEval-First-Pw-1");
rec("A5c", "After using the invite link and setting a password, the approved facilitator can sign in", "sign-in succeeds and lands on /dashboard", `updateUser error=${setFirst.error?.message ?? "none"}; sign-in ok=${afterAct.ok}`, !setFirst.error && afterAct.ok);

// ---------------- A7: password change ----------------
async function adminChange(cur, next) { await newLog(); const r = await callAction(B, adminJar, "changePassword", [{ currentPassword: cur, newPassword: next }], {}); const l = await newLog(); return { r, msg: lastErr(l) }; }
const wrong = await adminChange("definitely-wrong", "ZzEvalNew-Pass-9");
const empty = await adminChange("", "ZzEvalNew-Pass-9");
const short = await adminChange(process.env.SEED_PASSWORD, "abc");
const stillOld = (await loginViaForm(B, "gill@school.nz", process.env.SEED_PASSWORD)).ok;
const newWorks = (await loginViaForm(B, "gill@school.nz", "ZzEvalNew-Pass-9")).ok;
rec("A7", "Admin changes password without the correct current password (wrong / empty / too-short new)", "each rejected; password unchanged", `wrong current -> HTTP ${wrong.r.status} "${wrong.msg}"; empty current -> "${empty.msg}"; new password 3 chars -> "${short.msg}"; old password still signs in=${stillOld}; attempted new password signs in=${newWorks}`,
  wrong.msg === "Current password is incorrect." && empty.msg === "Enter your current password." && /at least 6/.test(short.msg) && stillOld && !newWorks);
const mid = await http(B, "/set-password", { jar: new (await import("./lib.mjs")).Jar() });
rec("A7c", "Visiting /set-password with no session", "shows 'Link expired', no form", `HTTP ${mid.status}; form shown=${mid.text.includes("Set your password")}; says link expired=${mid.text.includes("Link expired")}`, !mid.text.includes("Set your password") && mid.text.includes("Link expired"));

// ---------------- A8: file privacy and signed links ----------------
const bucket = "block-resources";
const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fx.e1.filePath}`;
const pub = await fetch(publicUrl);
const anonAuth = await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/${bucket}/${fx.e1.filePath}`, { headers: { apikey: ANON_KEY, authorization: `Bearer ${ANON_KEY}` } });
const anonList = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, { method: "POST", headers: { apikey: ANON_KEY, authorization: `Bearer ${ANON_KEY}`, "content-type": "application/json" }, body: JSON.stringify({ prefix: "", limit: 5 }) });
const anonListBody = await anonList.text();
const bucketInfo = (await sb.storage.getBucket(bucket)).data;
rec("A8", "Uploaded worksheet/workbook file requested without a signed link (public URL, anon-key authenticated URL, anon bucket listing)", "none of them returns the file; bucket is private", `public URL -> HTTP ${pub.status}; authenticated URL with anon key -> HTTP ${anonAuth.status}; list with anon key -> HTTP ${anonList.status} ${anonListBody.slice(0, 60)}; bucket.public=${bucketInfo?.public}`, pub.status >= 400 && anonAuth.status >= 400 && bucketInfo?.public === false);

// signed link as the app issues it to a facilitator who has reached the block (Moksh finished fixture lesson in section B)
const mokshJar = (await loginViaForm(B, "moksh@school.nz", process.env.SEED_PASSWORD)).jar;
const page = await http(B, `/facilitator/classes/${fx.ids.G1}/subjects/${fx.ids.G1_MATHS}/lessons/${fx.e1.lessonId}`, { jar: mokshJar });
const flat = page.text.replace(/\\u0026/g, "&").replace(/\\"/g, '"');
const sm = flat.match(/"signedFileUrl":"([^"]+)"/);
const signed = sm ? sm[1] : null;
let appSignedInfo = "no signed URL found in page";
let appSignedOk = false;
if (signed) {
  const jwt = new URL(signed).searchParams.get("token");
  const pl = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
  const get = await fetch(signed);
  const bytes = (await get.arrayBuffer()).byteLength;
  appSignedOk = get.status === 200 && get.headers.get("content-type")?.includes("pdf");
  appSignedInfo = `app-issued link: HTTP ${get.status} ${get.headers.get("content-type")} ${bytes} bytes; lifetime exp-iat=${pl.exp - pl.iat}s (code: createSignedUrl(path, 3600))`;
  rec("A8b", "Signed link the app issues to the facilitator", "works, expires (1 hour in code)", appSignedInfo, appSignedOk && pl.exp - pl.iat === 3600);
} else rec("A8b", "Signed link the app issues to the facilitator", "works, expires", appSignedInfo, false);

// expiry demonstration with a short-lived link on the same object
const short3 = (await sb.storage.from(bucket).createSignedUrl(fx.e1.filePath, 3)).data.signedUrl;
const t0 = await fetch(short3); const s0 = t0.status; await t0.arrayBuffer();
await new Promise((r) => setTimeout(r, 6000));
const t1 = await fetch(short3); const s1 = t1.status; const b1 = (await t1.text()).slice(0, 120);
rec("A8d", "Signed link after it expires (3-second link created on the same file to demonstrate the mechanism; the app's own links use 3600 s)", "200 while valid, rejected once expired", `at t=0s HTTP ${s0}; at t=6s HTTP ${s1} ${b1}`, s0 === 200 && s1 >= 400);

save("a2-auth.json", results);
console.log(`\n${results.filter((x) => x.pass === true).length}/${results.filter((x) => x.pass !== null).length} passed`);
// cleanup of users created here happens in eval/cleanup.mjs (emails start with zz-eval)
await prisma.$disconnect();
