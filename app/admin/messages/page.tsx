import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getThreadMessages, buildThreadPartners } from "@/lib/messaging";
import { MessagingThread, type ThreadMessage } from "@/components/MessagingThread";
import { Role } from "@prisma/client";

function assignmentSummary(assignments: { class: { name: string }; subject: { name: string } }[]) {
  if (assignments.length === 0) return "No classes assigned";
  const classes = Array.from(new Set(assignments.map((a) => a.class.name)));
  const subjects = Array.from(new Set(assignments.map((a) => a.subject.name)));
  return `${classes.join(" & ")} · ${subjects.join(", ")}`;
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: { with?: string };
}) {
  const admin = await getCurrentUser();
  if (!admin) return null;

  const facilitators = await prisma.user.findMany({
    where: { organisationId: admin.organisationId, role: Role.FACILITATOR },
    include: { assignments: { include: { class: true, subject: true } } },
    orderBy: { name: "asc" },
  });

  const partners = await buildThreadPartners(
    admin.id,
    facilitators.map((f) => ({ id: f.id, name: f.name, subtitle: assignmentSummary(f.assignments) })),
  );

  const selectedPartnerId = searchParams.with ?? partners[0]?.id ?? null;

  const messages: ThreadMessage[] = selectedPartnerId
    ? (await getThreadMessages(admin.id, selectedPartnerId)).map((m) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      }))
    : [];

  return (
    <MessagingThread
      currentUserId={admin.id}
      title="Messages"
      subtitle="Chat with your facilitators"
      basePath="/admin/messages"
      partners={partners}
      selectedPartnerId={selectedPartnerId}
      messages={messages}
    />
  );
}
