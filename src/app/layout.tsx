import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeltaDiff - Modern Code Comparison Tool",
  description: "Compare, visualize differences, and merge code changes with precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-zinc-50 text-zinc-900`}
      >
        {children}
      </body>
    </html>
  );
}
