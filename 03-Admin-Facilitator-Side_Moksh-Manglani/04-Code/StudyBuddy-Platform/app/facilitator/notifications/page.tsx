import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NotificationsView } from "./_components/NotificationsView";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">Notifications</h1>
        <p className="mt-1 text-[14.5px] text-muted">
          {notifications.filter((n) => !n.read).length} unread
        </p>
      </div>

      <NotificationsView notifications={notifications} />
    </>
  );
}
