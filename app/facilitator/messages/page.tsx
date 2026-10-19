import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getThreadMessages, buildThreadPartners } from "@/lib/messaging";
import { MessagingThread, type ThreadMessage } from "@/components/MessagingThread";
import { Role } from "@prisma/client";

export const metadata = { title: "Chat with admin" };

export default async function FacilitatorMessagesPage({
  searchParams,
}: {
  searchParams: { with?: string };
}) {
  const facilitator = await getCurrentUser();
  if (!facilitator) return null;

  const admins = await prisma.user.findMany({
    where: { organisationId: facilitator.organisationId, role: Role.ADMIN },
    orderBy: { name: "asc" },
  });

  const partners = await buildThreadPartners(
    facilitator.id,
    admins.map((a) => ({ id: a.id, name: a.name, subtitle: "Coordinator · Admin" })),
  );

  const selectedPartnerId = searchParams.with ?? partners[0]?.id ?? null;

  const messages: ThreadMessage[] = selectedPartnerId
    ? (await getThreadMessages(facilitator.id, selectedPartnerId)).map((m) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      }))
    : [];

  return (
    <MessagingThread
      currentUserId={facilitator.id}
      title="Chat with admin"
      subtitle="Questions about lessons or schedules"
      basePath="/facilitator/messages"
      partners={partners}
      selectedPartnerId={selectedPartnerId}
      messages={messages}
    />
  );
}
