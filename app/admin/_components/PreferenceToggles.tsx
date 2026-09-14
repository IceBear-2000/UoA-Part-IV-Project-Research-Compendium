"use client";

import { useAdminPreferences, type AdminTheme, type NavLayout } from "./AdminPreferences";

const THEMES: { value: AdminTheme; label: string }[] = [
  { value: "refined", label: "Warm" },
  { value: "studio", label: "Studio" },
  { value: "ledger", label: "Ledger" },
];

const NAV_LAYOUTS: { value: NavLayout; label: string }[] = [
  { value: "sidebar", label: "Sidebar" },
  { value: "topnav", label: "Top bar" },
];

export function PreferenceToggles() {
  const { theme, navLayout, setTheme, setNavLayout } = useAdminPreferences();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 px-0.5 text-[11px] font-semibold text-muted">Navigation</p>
        <div className="flex rounded-pill bg-bg-2 p-[3px]">
          {NAV_LAYOUTS.map((n) => (
            <button
              key={n.value}
              type="button"
              onClick={() => setNavLayout(n.value)}
              aria-pressed={navLayout === n.value}
              className={`flex-1 rounded-pill px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                navLayout === n.value ? "bg-surface text-ink shadow-paper" : "text-muted"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 px-0.5 text-[11px] font-semibold text-muted">Theme</p>
        <div className="flex rounded-pill bg-bg-2 p-[3px]">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTheme(t.value)}
              aria-pressed={theme === t.value}
              className={`flex-1 rounded-pill px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                theme === t.value ? "bg-clay text-white" : "text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
