import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "⚡ GRABIT | Lightning-Fast Deals 50%+ OFF on $50+ Items",
  description: "Lightning-fast deals! Quality nationwide online deals: 50%+ OFF on items $50+. Gaming, fashion, beauty, tech, home, kitchen, fitness, books, toys & more. Grab it before it's gone! Updated every 6 hours.",
  keywords: ["deals", "discounts", "fast deals", "lightning deals", "gaming", "fashion", "beauty", "tech", "home", "kitchen", "fitness", "books", "toys", "50% off", "quality deals", "online deals", "nationwide", "grabit"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
