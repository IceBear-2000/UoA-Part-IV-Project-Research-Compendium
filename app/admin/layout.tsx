import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadMessageCount } from "@/lib/notifications";
import { SignupRequestStatus } from "@prisma/client";
import { AdminSidebar } from "./_components/AdminSidebar";

// Server-side gate: a facilitator can never render anything under /admin,
// even by typing the URL directly — this check runs before any child page.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user!.role !== "ADMIN") redirect("/facilitator");

  const [pendingRequestCount, unreadMessageCount] = await Promise.all([
    prisma.signupRequest.count({ where: { status: SignupRequestStatus.PENDING } }),
    getUnreadMessageCount(user!.id),
  ]);

  return (
    <div className="grid min-h-screen grid-cols-[244px_1fr]">
      <AdminSidebar
        userName={user!.name}
        pendingRequestCount={pendingRequestCount}
        unreadMessageCount={unreadMessageCount}
      />
      <main className="max-w-[1180px] px-11 pb-[70px] pt-[34px]">{children}</main>
    </div>
  );
}
