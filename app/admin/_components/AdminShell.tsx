"use client";

import { AdminPreferencesProvider, useAdminPreferences } from "./AdminPreferences";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopNav } from "./AdminTopNav";
import { SettingsMenu } from "./SettingsMenu";

type ShellProps = {
  userName: string;
  pendingRequestCount: number;
  unreadMessageCount: number;
  children: React.ReactNode;
};

function ShellInner({ userName, pendingRequestCount, unreadMessageCount, children }: ShellProps) {
  const { navLayout } = useAdminPreferences();

  if (navLayout === "topnav") {
    return (
      <>
        <AdminTopNav
          userName={userName}
          pendingRequestCount={pendingRequestCount}
          unreadMessageCount={unreadMessageCount}
        />
        <main className="mx-auto w-full max-w-[1180px] px-11 pb-[70px] pt-[34px]">{children}</main>
      </>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-[244px_1fr]">
      <AdminSidebar
        userName={userName}
        pendingRequestCount={pendingRequestCount}
        unreadMessageCount={unreadMessageCount}
      />
      <main className="mx-auto w-full max-w-[1180px] px-11 pb-[70px] pt-[34px]">
        <div className="mb-6 flex justify-end">
          <SettingsMenu />
        </div>
        {children}
      </main>
    </div>
  );
}

export function AdminShell(props: ShellProps) {
  return (
    <AdminPreferencesProvider>
      <ShellInner {...props}>{props.children}</ShellInner>
    </AdminPreferencesProvider>
  );
}
