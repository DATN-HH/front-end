import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css"; // Ensure globals.css is imported
import { cn } from "@/lib/utils"; // Import cn utility

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Menu+ POS",
  description: "Menu+ Point of Sale System",
};

export default function POSLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        {children}
      </body>
    </html>
  );
}
