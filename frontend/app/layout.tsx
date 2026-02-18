import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grabbit | 50%+ OFF on $50+ Items - Quality Deals Only",
  description: "Grab it before it's gone! Only quality deals: 50%+ OFF on items originally $50 or more. Gaming, fashion, beauty, tech, and toys. No cheap junk. Updated every 6 hours.",
  keywords: ["deals", "discounts", "gaming", "fashion", "beauty", "tech", "toys", "50% off", "quality deals", "expensive items", "grabbit"],
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
