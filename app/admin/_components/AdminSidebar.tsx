"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth-actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "🏠" },
  { href: "/admin/requests", label: "Requests", icon: "📥", badgeKey: "pendingRequestCount" },
  { href: "/admin/classes", label: "Classes", icon: "🏫" },
  { href: "/admin/lessons", label: "Lessons", icon: "🧩" },
  { href: "/admin/facilitators", label: "Facilitators", icon: "👥" },
  { href: "/admin/messages", label: "Messages", icon: "💬", badgeKey: "unreadMessageCount" },
] as const;

export function AdminSidebar({
  userName,
  pendingRequestCount = 0,
  unreadMessageCount = 0,
}: {
  userName: string;
  pendingRequestCount?: number;
  unreadMessageCount?: number;
}) {
  const badges: Record<string, number> = { pendingRequestCount, unreadMessageCount };
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
          item.href === "/admin"
            ? pathname === "/admin"
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

      <div className="flex-1" />

      <div className="mt-2 border-t border-line pt-2.5">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 transition-colors hover:bg-[rgba(190,130,100,0.09)] ${
            pathname.startsWith("/admin/settings") ? "bg-surface shadow-paper" : ""
          }`}
        >
          <div className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-full bg-clay text-[13px] font-semibold text-white">
            {initials}
          </div>
          <div className="text-[13px] leading-tight">
            {userName}
            <br />
            <small className="text-[11.5px] text-muted">Coordinator · Settings</small>
          </div>
        </Link>
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
