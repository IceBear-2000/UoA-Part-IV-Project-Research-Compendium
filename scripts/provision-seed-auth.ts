// One-off setup script: creates real, pre-confirmed Supabase Auth accounts
// for the people already sitting in our Prisma User table from prisma/seed.ts,
// and links each one's authId. This bypasses the public sign-up flow's email
// confirmation + domain checks — appropriate here since these are demo
// accounts, not real self-registrations. Run with: npx tsx scripts/provision-seed-auth.ts
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../lib/prisma";

const DEMO_PASSWORD = "StudyBuddy123!";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureAuthUser(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });

  if (!error) return data.user;

  // Already provisioned from a previous run — look up their existing id.
  if (error.message.toLowerCase().includes("already been registered")) {
    const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    const existing = list.users.find((u) => u.email === email);
    if (!existing) throw new Error(`Could not find existing auth user for ${email}`);
    return existing;
  }

  throw error;
}

async function main() {
  const seededUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });

  if (seededUsers.length === 0) {
    console.log("No users found — run `npx prisma db seed` first.");
    return;
  }

  for (const dbUser of seededUsers) {
    const authUser = await ensureAuthUser(dbUser.email);
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { authId: authUser.id },
    });
    console.log(`✔ ${dbUser.role.padEnd(11)} ${dbUser.email}`);
  }

  console.log(`\nAll set. Sign in at /login with any of the emails above and password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
