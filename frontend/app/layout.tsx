import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grabbit | 50%+ OFF on $50+ Items - Nationwide Online Deals",
  description: "Grab it before it's gone! Quality nationwide online deals: 50%+ OFF on items $50+. Gaming, fashion, beauty, tech, and toys. No local/in-store only. No cheap junk. Updated every 6 hours.",
  keywords: ["deals", "discounts", "gaming", "fashion", "beauty", "tech", "toys", "50% off", "quality deals", "online deals", "nationwide", "grabbit"],
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
