"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// Opening the notifications inbox clears everything in it — the standard
// "mark all read on view" pattern, simple and matches how the rest of this
// feature is scoped (no per-row read state needed).
export async function markAllNotificationsRead() {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/facilitator", "layout");
}
