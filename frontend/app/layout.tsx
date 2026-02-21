import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grabbit | 50%+ OFF Deals on Gaming, Fashion, Beauty & Tech",
  description: "Grab it before it's gone! Curated deals with 50%+ discounts on gaming, fashion, beauty, tech, and toys. Updated every 6 hours from Reddit, Steam, and more.",
  keywords: ["deals", "discounts", "gaming", "fashion", "beauty", "tech", "toys", "50% off", "sales", "grabbit"],
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
