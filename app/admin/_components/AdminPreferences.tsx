"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AdminTheme = "refined" | "studio" | "ledger";
export type NavLayout = "sidebar" | "topnav";

type Ctx = {
  theme: AdminTheme;
  navLayout: NavLayout;
  setTheme: (t: AdminTheme) => void;
  setNavLayout: (n: NavLayout) => void;
};

const AdminPreferencesContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "studybuddy-admin-prefs";

export function AdminPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>("refined");
  const [navLayout, setNavLayoutState] = useState<NavLayout>("sidebar");

  // Reads the saved preference after mount — this is a per-browser UI
  // preference, not account data, so localStorage (not the DB) is enough.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Ctx>;
      if (parsed.theme) setThemeState(parsed.theme);
      if (parsed.navLayout) setNavLayoutState(parsed.navLayout);
    } catch {
      // Ignore — defaults already applied.
    }
  }, []);

  function persist(next: { theme: AdminTheme; navLayout: NavLayout }) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private browsing etc. — preference just won't survive a reload.
    }
  }

  function setTheme(t: AdminTheme) {
    setThemeState(t);
    persist({ theme: t, navLayout });
  }
  function setNavLayout(n: NavLayout) {
    setNavLayoutState(n);
    persist({ theme, navLayout: n });
  }

  return (
    <AdminPreferencesContext.Provider value={{ theme, navLayout, setTheme, setNavLayout }}>
      <div data-theme={theme} className="min-h-screen bg-bg">
        {children}
      </div>
    </AdminPreferencesContext.Provider>
  );
}

export function useAdminPreferences() {
  const ctx = useContext(AdminPreferencesContext);
  if (!ctx) throw new Error("useAdminPreferences must be used within AdminPreferencesProvider");
  return ctx;
}
