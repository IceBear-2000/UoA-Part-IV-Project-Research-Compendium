import type { Metadata } from "next";
import { Karla, Fraunces, Public_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Loaded once, on every page, regardless of active admin theme — each just
// becomes an unused CSS variable until a [data-theme] block below (in
// globals.css) references it. Keeps theme switching instant, no reload.
const karla = Karla({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-karla" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-fraunces" });
const publicSans = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-public-sans" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-source-serif" });

export const metadata: Metadata = {
  title: { default: "StudyBuddy", template: "%s | StudyBuddy" },
  description: "Structured, consistent K–12 lessons for anyone to facilitate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${karla.variable} ${fraunces.variable} ${publicSans.variable} ${sourceSerif.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
