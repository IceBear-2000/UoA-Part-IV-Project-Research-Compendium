"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/format";
import { markAllNotificationsRead } from "@/lib/notifications-actions";

type Notification = {
  id: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
};

// Opening this page is the "mark read" action — matches most notification
// inboxes (visiting the list clears it), no per-row bookkeeping needed.
export function NotificationsView({ notifications }: { notifications: Notification[] }) {
  // Guards against firing twice on mount: React 18 StrictMode double-invokes
  // effects in dev, and two near-simultaneous mutating requests can race
  // Supabase's token refresh and drop the session.
  const markedRef = useRef(false);
  useEffect(() => {
    if (!markedRef.current && notifications.some((n) => !n.read)) {
      markedRef.current = true;
      markAllNotificationsRead();
    }
  }, [notifications]);

  if (notifications.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
        No notifications yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {notifications.map((n) => {
        const row = (
          <div
            className={`flex items-start gap-3 rounded-card border border-line p-4 shadow-paper transition-colors ${
              n.read ? "bg-surface" : "bg-clay-soft"
            }`}
          >
            <span
              className={`mt-1.5 h-[7px] w-[7px] flex-shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-clay"}`}
            />
            <div>
              <p className="text-sm">{n.body}</p>
              <p className="mt-1 text-xs text-muted">{timeAgo(n.createdAt)}</p>
            </div>
          </div>
        );

        return n.link ? (
          <Link key={n.id} href={n.link}>
            {row}
          </Link>
        ) : (
          <div key={n.id}>{row}</div>
        );
      })}
    </div>
  );
}
