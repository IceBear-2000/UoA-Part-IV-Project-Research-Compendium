"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sendMessage } from "@/lib/messaging";

export async function sendMessageAction(receiverId: string, body: string) {
  const user = await requireUser();
  const trimmed = body.trim();
  if (!trimmed) return;

  await sendMessage({ senderId: user.id, receiverId, body: trimmed });

  revalidatePath("/admin", "layout");
  revalidatePath("/facilitator", "layout");
}

// Clears just this one thread's unread notifications, so unread messages
// from a different sender aren't silently marked read along with it.
export async function markThreadRead(otherUserId: string) {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, fromUserId: otherUserId, read: false },
    data: { read: true },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/facilitator", "layout");
}
