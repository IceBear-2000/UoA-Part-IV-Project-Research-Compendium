"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Inbox, School, BookOpen, Users, MessageSquare, LogOut } from "lucide-react";
import { logout } from "@/lib/auth-actions";
import { SettingsMenu } from "./SettingsMenu";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/requests", label: "Requests", icon: Inbox, badgeKey: "pendingRequestCount" },
  { href: "/admin/classes", label: "Classes", icon: School },
  { href: "/admin/lessons", label: "Lessons", icon: BookOpen },
  { href: "/admin/facilitators", label: "Facilitators", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, badgeKey: "unreadMessageCount" },
] as const;

export function AdminTopNav({
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
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="flex items-center gap-5 px-6 py-3">
        <div className="flex items-center gap-2.5 text-[15px] font-bold tracking-tight font-heading">
          <div className="grid h-7 w-7 place-items-center rounded-[8px] bg-clay text-sm text-white">
            📚
          </div>
          StudyBuddy
        </div>

        <nav className="flex flex-1 items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const badge = "badgeKey" in item ? badges[item.badgeKey] : 0;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-[9px] px-3 py-2 text-[13.5px] font-medium transition-colors ${
                  active ? "bg-bg-2 font-semibold text-ink" : "text-muted hover:bg-bg-2 hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {item.label}
                {badge > 0 && (
                  <span className="ml-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 border-l border-line pl-4">
          <Link
            href="/admin/settings"
            title={userName}
            className={`grid h-8 w-8 place-items-center rounded-[9px] transition-colors hover:bg-bg-2 ${
              pathname.startsWith("/admin/settings") ? "bg-bg-2" : ""
            }`}
          >
            <div className="grid h-6 w-6 place-items-center rounded-full bg-clay text-[10.5px] font-semibold text-white">
              {initials}
            </div>
          </Link>
          <SettingsMenu />
          <form action={logout}>
            <button
              title="Sign out"
              className="grid h-8 w-8 place-items-center rounded-[9px] text-muted transition-colors hover:bg-bg-2 hover:text-ink"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
