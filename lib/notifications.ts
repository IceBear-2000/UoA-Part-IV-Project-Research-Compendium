import { prisma } from "@/lib/prisma";

export async function createNotification({
  userId,
  fromUserId,
  body,
  link,
}: {
  userId: string;
  fromUserId?: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: { userId, fromUserId: fromUserId ?? null, body, link: link ?? null },
  });
}

export function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

// Message notifications specifically (fromUserId set) — used for the "Chat
// with admin" / "Messages" nav badge, distinct from the general Notifications
// inbox badge which counts everything.
export function getUnreadMessageCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false, fromUserId: { not: null } },
  });
}
