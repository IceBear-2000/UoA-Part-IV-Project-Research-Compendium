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
        bg: "var(--bg-eff)",
        "bg-2": "var(--bg-2-eff)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line-eff)",
        "line-soft": "var(--line-soft)",
        clay: "var(--clay)",
        "clay-hover": "var(--clay-hover)",
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
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"],
      },
      borderRadius: {
        card: "var(--radius-card)",
        pill: "var(--radius-pill)",
        input: "var(--radius-input)",
      },
      boxShadow: {
        paper: "var(--shadow-paper)",
        "paper-2": "var(--shadow-paper-2)",
      },
    },
  },
  plugins: [],
};
export default config;
