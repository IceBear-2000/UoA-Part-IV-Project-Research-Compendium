import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SettingsView } from "./_components/SettingsView";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const organisation = await prisma.organisation.findUnique({
    where: { id: user.organisationId },
    select: { name: true },
  });

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-[14.5px] text-muted">Manage your account and organisation</p>
      </div>

      <SettingsView
        name={user.name}
        email={user.email}
        organisationName={organisation?.name ?? ""}
      />
    </>
  );
}
