import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

// Looks up who's currently signed in (via Supabase) and returns their
// matching row from our own User table, which is where role lives.
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.user.findUnique({ where: { authId: user.id } });
}

// Every server action that isn't public should call this first — route-level
// protection (middleware + layout) only guards page navigation, not the
// server actions themselves, which are independently callable.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}
