// Removes ONLY evaluation fixtures: lessons whose name starts with "ZZ-EVAL" (plus their progress/blocks/files),
// test classes/requests/users created by the harness (names/emails prefixed "zz-eval").
import { createClient } from "@supabase/supabase-js";
import { prisma } from "./db.mjs";
import { SUPABASE_URL, SERVICE_KEY } from "./env.mjs";
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const lessons = await prisma.lesson.findMany({ where: { name: { startsWith: "ZZ-EVAL" } }, include: { blocks: true } });
const paths = [];
for (const l of lessons) for (const b of l.blocks) { const c = b.content ?? {}; if (typeof c.filePath === "string") paths.push(c.filePath); }
if (paths.length) console.log("storage remove:", paths.length, (await sb.storage.from("block-resources").remove(paths)).error ?? "ok");
const ids = lessons.map((l) => l.id);
console.log("progress deleted:", (await prisma.lessonProgress.deleteMany({ where: { lessonId: { in: ids } } })).count);
console.log("blocks deleted:", (await prisma.block.deleteMany({ where: { lessonId: { in: ids } } })).count);
console.log("lessons deleted:", (await prisma.lesson.deleteMany({ where: { id: { in: ids } } })).count);

const users = await prisma.user.findMany({ where: { email: { startsWith: "zz-eval" } } });
for (const u of users) {
  await prisma.facilitatorAssignment.deleteMany({ where: { facilitatorId: u.id } });
  await prisma.notification.deleteMany({ where: { OR: [{ userId: u.id }, { fromUserId: u.id }] } });
  await prisma.signupRequest.updateMany({ where: { createdUserId: u.id }, data: { createdUserId: null } });
  await prisma.user.delete({ where: { id: u.id } });
  await sb.auth.admin.deleteUser(u.authId);
}
console.log("test users deleted:", users.length);
console.log("test requests deleted:", (await prisma.signupRequest.deleteMany({ where: { email: { startsWith: "zz-eval" } } })).count);
console.log("test classes deleted:", (await prisma.class.deleteMany({ where: { name: { startsWith: "ZZ-EVAL" } } })).count);
await prisma.$disconnect();
