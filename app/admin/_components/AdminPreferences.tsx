"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AdminTheme = "refined" | "studio" | "ledger";
export type NavLayout = "sidebar" | "topnav";

type Ctx = {
  theme: AdminTheme;
  navLayout: NavLayout;
  /** Card contrast, 0 (original look) to 100 (strongest). */
  contrast: number;
  setTheme: (t: AdminTheme) => void;
  setNavLayout: (n: NavLayout) => void;
  setContrast: (c: number) => void;
};

const AdminPreferencesContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "studybuddy-admin-prefs";
export const DEFAULT_CONTRAST = 60;

export function AdminPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>("refined");
  const [navLayout, setNavLayoutState] = useState<NavLayout>("sidebar");
  const [contrast, setContrastState] = useState<number>(DEFAULT_CONTRAST);

  // Reads the saved preference after mount — this is a per-browser UI
  // preference, not account data, so localStorage (not the DB) is enough.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Ctx>;
      if (parsed.theme) setThemeState(parsed.theme);
      if (parsed.navLayout) setNavLayoutState(parsed.navLayout);
      if (typeof parsed.contrast === "number") setContrastState(parsed.contrast);
    } catch {
      // Ignore — defaults already applied.
    }
  }, []);

  function persist(next: { theme: AdminTheme; navLayout: NavLayout; contrast: number }) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private browsing etc. — preference just won't survive a reload.
    }
  }

  function setTheme(t: AdminTheme) {
    setThemeState(t);
    persist({ theme: t, navLayout, contrast });
  }
  function setNavLayout(n: NavLayout) {
    setNavLayoutState(n);
    persist({ theme, navLayout: n, contrast });
  }

  function setContrast(c: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(c)));
    setContrastState(clamped);
    persist({ theme, navLayout, contrast: clamped });
  }

  // 100 on the slider is 6% page shading and 20% darker borders.
  const contrastVars = { "--shade": `${contrast * 0.06}%`, "--edge": `${contrast * 0.2}%` } as React.CSSProperties;

  return (
    <AdminPreferencesContext.Provider
      value={{ theme, navLayout, contrast, setTheme, setNavLayout, setContrast }}
    >
      <div data-theme={theme} style={contrastVars} className="min-h-screen bg-bg">
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
