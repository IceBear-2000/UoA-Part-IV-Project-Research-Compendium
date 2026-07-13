import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        clay: "var(--clay)",
        "clay-soft": "var(--clay-soft)",
        "clay-line": "var(--clay-line)",
        sage: "var(--sage)",
        "sage-soft": "var(--sage-soft)",
        blue: "var(--blue)",
        "blue-soft": "var(--blue-soft)",
        gold: "var(--gold)",
        "gold-soft": "var(--gold-soft)",
        rose: "var(--rose)",
        "rose-soft": "var(--rose-soft)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Inter",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "14px",
        pill: "10px",
        input: "9px",
      },
      boxShadow: {
        paper: "0 1px 0 rgba(51,48,42,.03), 0 1px 3px rgba(51,48,42,.05)",
        "paper-2": "0 1px 0 rgba(51,48,42,.03), 0 4px 10px rgba(51,48,42,.06)",
      },
    },
  },
  plugins: [],
};
export default config;
