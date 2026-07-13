"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth-actions";

const NAV_ITEMS = [
  { href: "/facilitator", label: "Dashboard", icon: "🏠" },
  { href: "/facilitator/messages", label: "Chat with admin", icon: "💬", badgeKey: "unreadMessageCount" },
  { href: "/facilitator/notifications", label: "Notifications", icon: "🔔", badgeKey: "unreadNotificationCount" },
] as const;

// Not built yet — shown so the sidebar matches the final shape from the
// mockup, but greyed out and inert instead of linking to a 404.
const SOON_ITEMS = [{ label: "Progress history", icon: "📈" }];

export function FacilitatorSidebar({
  userName,
  unreadMessageCount = 0,
  unreadNotificationCount = 0,
}: {
  userName: string;
  unreadMessageCount?: number;
  unreadNotificationCount?: number;
}) {
  const badges: Record<string, number> = { unreadMessageCount, unreadNotificationCount };
  const pathname = usePathname();
  const initials =
    userName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-[3px] border-r border-line bg-bg-2 p-4 pt-6">
      <div className="flex items-center gap-2.5 px-2.5 pb-[22px] pt-1.5 text-lg font-bold tracking-tight">
        <div className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-clay text-base text-white">
          📚
        </div>
        StudyBuddy
      </div>

      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/facilitator"
            ? pathname === "/facilitator"
            : pathname.startsWith(item.href);
        const badge = "badgeKey" in item ? badges[item.badgeKey] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14.5px] font-medium transition-colors ${
              active
                ? "bg-surface font-semibold text-ink shadow-paper"
                : "text-muted hover:bg-[rgba(190,130,100,0.09)] hover:text-ink"
            }`}
          >
            <span className="w-5 text-center text-base">{item.icon}</span>
            {item.label}
            {badge > 0 && (
              <span className="ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-full bg-clay px-1 text-[10.5px] font-bold text-white">
                {badge}
              </span>
            )}
          </Link>
        );
      })}

      {SOON_ITEMS.map((item) => (
        <div
          key={item.label}
          title="Coming in a later session"
          className="flex cursor-not-allowed items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14.5px] font-medium text-muted/50"
        >
          <span className="w-5 text-center text-base">{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div className="flex-1" />

      <div className="mt-2 border-t border-line pt-2.5">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-full bg-sage text-[13px] font-semibold text-white">
            {initials}
          </div>
          <div className="text-[13px] leading-tight">
            {userName}
            <br />
            <small className="text-[11.5px] text-muted">Facilitator</small>
          </div>
        </div>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-muted hover:bg-[rgba(190,130,100,0.09)] hover:text-ink">
            <span className="w-5 text-center">↩︎</span>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
