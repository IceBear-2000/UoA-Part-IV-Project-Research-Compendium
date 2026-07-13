import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadCount, getUnreadMessageCount } from "@/lib/notifications";
import { FacilitatorSidebar } from "./_components/FacilitatorSidebar";

// Server-side gate: an admin can never render anything under /facilitator,
// even by typing the URL directly — this check runs before any child page.
export default async function FacilitatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user!.role !== "FACILITATOR") redirect("/admin");

  const [unreadMessageCount, unreadNotificationCount] = await Promise.all([
    getUnreadMessageCount(user!.id),
    getUnreadCount(user!.id),
  ]);

  return (
    <div className="grid min-h-screen grid-cols-[244px_1fr]">
      <FacilitatorSidebar
        userName={user!.name}
        unreadMessageCount={unreadMessageCount}
        unreadNotificationCount={unreadNotificationCount}
      />
      <main className="max-w-[1180px] px-11 pb-[70px] pt-[34px]">{children}</main>
    </div>
  );
}
