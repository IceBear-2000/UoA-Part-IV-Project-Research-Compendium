import Link from "next/link";
import { Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SignupRequestStatus } from "@prisma/client";

const DRAFTS_SHOWN = 4;
const UNREAD_SENDERS_SHOWN = 4;

function timeAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export const metadata = { title: "Overview" };

export default async function AdminHome() {
  const admin = await getCurrentUser();
  if (!admin) return null;

  const [pendingRequestCount, draftCount, draftLessons, unreadNotifications] = await Promise.all([
    prisma.signupRequest.count({ where: { status: SignupRequestStatus.PENDING } }),
    prisma.lesson.count({ where: { status: "DRAFT" } }),
    prisma.lesson.findMany({
      where: { status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
      take: DRAFTS_SHOWN,
      include: { subject: { include: { class: true } }, blocks: { select: { id: true } } },
    }),
    prisma.notification.findMany({
      where: { userId: admin.id, read: false, fromUserId: { not: null } },
      orderBy: { createdAt: "desc" },
      include: { fromUser: { select: { id: true, name: true } } },
    }),
  ]);

  // Collapse raw unread notifications into one row per facilitator, since a
  // facilitator can have several unread messages but the dashboard only
  // needs to nudge "reply to this person", not list every notification.
  const unreadBySender = new Map<string, { id: string; name: string; count: number }>();
  for (const n of unreadNotifications) {
    if (!n.fromUser) continue;
    const existing = unreadBySender.get(n.fromUser.id);
    if (existing) existing.count += 1;
    else unreadBySender.set(n.fromUser.id, { id: n.fromUser.id, name: n.fromUser.name, count: 1 });
  }
  const unreadSenders = Array.from(unreadBySender.values());

  const hasDrafts = draftLessons.length > 0;
  const hasUnread = unreadSenders.length > 0;
  const actionPanelCount = (hasDrafts ? 1 : 0) + (hasUnread ? 1 : 0);
  const allCaughtUp = pendingRequestCount === 0 && !hasDrafts && !hasUnread;

  return (
    <>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-bold tracking-tight">Admin overview</h1>
          <p className="mt-1 text-[14.5px] text-muted">Welcome back, {admin.name}</p>
        </div>
        <Link
          href="/admin/lessons/new"
          className="inline-flex items-center gap-2 rounded-input bg-clay px-[17px] py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover"
        >
          ＋ Create lesson
        </Link>
      </div>

      {pendingRequestCount > 0 && (
        <Link
          href="/admin/requests"
          className="mb-6 flex items-center justify-between gap-3 rounded-card border border-clay-line bg-clay-soft px-5 py-3.5 text-sm font-semibold text-[#8c5538] shadow-paper transition-colors hover:bg-[#f3ddd0]"
        >
          <span className="flex items-center gap-2.5">
            <Inbox className="h-[18px] w-[18px]" strokeWidth={2} />
            {pendingRequestCount} facilitator request{pendingRequestCount === 1 ? "" : "s"} waiting
            for review
          </span>
          <span>Review →</span>
        </Link>
      )}

      {allCaughtUp ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          You&apos;re all caught up. No drafts, requests, or unread messages.
        </div>
      ) : (
        <div
          className={
            actionPanelCount === 2 ? "grid grid-cols-2 gap-[18px]" : "flex flex-col gap-[18px]"
          }
        >
          {hasDrafts && (
            <div className="rounded-card border border-line bg-surface p-5 shadow-paper">
              <div className="mb-3.5 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Draft lessons</h2>
                {draftCount > draftLessons.length && (
                  <Link
                    href="/admin/lessons?status=DRAFT"
                    className="text-[12.5px] font-semibold text-clay hover:underline"
                  >
                    View all {draftCount} →
                  </Link>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {draftLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/admin/lessons/${lesson.id}`}
                    className="flex items-center justify-between gap-3 rounded-input px-3 py-2.5 transition-colors hover:bg-bg"
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-[13.5px]">{lesson.name}</strong>
                      <p className="mt-0.5 truncate text-[12px] text-muted">
                        {lesson.subject.class.name} · {lesson.subject.name}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-[11.5px] text-muted">
                      {timeAgo(lesson.updatedAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {hasUnread && (
            <div className="rounded-card border border-line bg-surface p-5 shadow-paper">
              <div className="mb-3.5 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Unread messages</h2>
                {unreadSenders.length > UNREAD_SENDERS_SHOWN && (
                  <Link
                    href="/admin/messages"
                    className="text-[12.5px] font-semibold text-clay hover:underline"
                  >
                    View all →
                  </Link>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {unreadSenders.slice(0, UNREAD_SENDERS_SHOWN).map((sender) => (
                  <Link
                    key={sender.id}
                    href={`/admin/messages?with=${sender.id}`}
                    className="flex items-center justify-between gap-3 rounded-input px-3 py-2.5 transition-colors hover:bg-bg"
                  >
                    <strong className="text-[13.5px]">{sender.name}</strong>
                    <span className="rounded-md bg-clay-soft px-2 py-0.5 text-[11px] font-bold text-[#8c5538]">
                      {sender.count} new
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
