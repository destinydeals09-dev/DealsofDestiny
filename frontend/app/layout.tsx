import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deals of Destiny | Best Electronics & Gaming Deals",
  description: "Your daily source for the hottest deals on electronics and gaming from Best Buy, Newegg, and Steam. Updated daily with massive discounts.",
  keywords: ["deals", "electronics", "gaming", "best buy", "newegg", "steam", "discounts", "sales"],
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
