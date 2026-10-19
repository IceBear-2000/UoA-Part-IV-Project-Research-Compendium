"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export async function updateProfile(name: string) {
  const admin = await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required.");

  await prisma.user.update({ where: { id: admin.id }, data: { name: trimmed } });
  revalidatePath("/admin/settings");
}

export async function changePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  const admin = await requireAdmin();
  if (!currentPassword) throw new Error("Enter your current password.");
  if (newPassword.length < 6) throw new Error("New password must be at least 6 characters.");

  // Verify the current password on a throwaway client (no cookies) so this
  // check never touches the admin's actual signed-in session.
  const verifyClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { error: verifyError } = await verifyClient.auth.signInWithPassword({
    email: admin.email,
    password: currentPassword,
  });
  if (verifyError) throw new Error("Current password is incorrect.");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function updateOrganisationName(name: string) {
  const admin = await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Organisation name is required.");

  await prisma.organisation.update({ where: { id: admin.organisationId }, data: { name: trimmed } });
  revalidatePath("/admin/settings");
}
