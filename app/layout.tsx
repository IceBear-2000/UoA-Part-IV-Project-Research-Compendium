import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyBuddy",
  description: "Structured, consistent K–12 lessons for anyone to facilitate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
