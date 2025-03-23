import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const promptFont = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-prompt",
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DiffCatcher - Modern Code Comparison Tool",
  description: "Compare, visualize, and merge code with syntax highlighting for 20+ programming languages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${promptFont.variable} ${geistMono.variable} font-sans bg-zinc-50 text-zinc-900`}
      >
        {children}
      </body>
    </html>
  );
}
