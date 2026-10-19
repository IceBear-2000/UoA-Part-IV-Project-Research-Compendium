import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { Role } from "@prisma/client";

// Messaging is deliberately only admin <-> facilitator, within the same
// organisation — there's no facilitator-to-facilitator or admin-to-admin
// case in this feature, so that pairing is enforced right here rather than
// left to the UI to get right.
export async function sendMessage({
  senderId,
  receiverId,
  body,
}: {
  senderId: string;
  receiverId: string;
  body: string;
}) {
  const [sender, receiver] = await Promise.all([
    prisma.user.findUnique({ where: { id: senderId } }),
    prisma.user.findUnique({ where: { id: receiverId } }),
  ]);

  if (!sender || !receiver) throw new Error("User not found.");
  if (sender.organisationId !== receiver.organisationId) {
    throw new Error("Cannot message a user outside your organisation.");
  }
  if (sender.role === receiver.role) {
    throw new Error("Messaging is only between admins and facilitators.");
  }

  const message = await prisma.message.create({
    data: { senderId, receiverId, body },
  });

  await createNotification({
    userId: receiverId,
    fromUserId: senderId,
    body: `New message from ${sender.name}`,
    link: receiver.role === Role.ADMIN ? `/admin/messages?with=${senderId}` : "/facilitator/messages",
  });

  return message;
}

export function getThreadMessages(userAId: string, userBId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userAId, receiverId: userBId },
        { senderId: userBId, receiverId: userAId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
}

// Most recent message between two users, for the chat-list preview snippet.
export function getLastMessage(userAId: string, userBId: string) {
  return prisma.message.findFirst({
    where: {
      OR: [
        { senderId: userAId, receiverId: userBId },
        { senderId: userBId, receiverId: userAId },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}

// Shared by both the admin and facilitator messages pages — same shape of
// "who can I message" list, just a different source for `people` per role.
export async function buildThreadPartners(
  viewerId: string,
  people: { id: string; name: string; subtitle: string }[],
) {
  return Promise.all(
    people.map(async (p) => {
      const [last, unreadCount] = await Promise.all([
        getLastMessage(viewerId, p.id),
        prisma.notification.count({
          where: { userId: viewerId, fromUserId: p.id, read: false },
        }),
      ]);
      return {
        id: p.id,
        name: p.name,
        subtitle: p.subtitle,
        lastMessageSnippet: last?.body ?? null,
        unread: unreadCount > 0,
      };
    }),
  );
}
