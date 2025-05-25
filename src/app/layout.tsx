import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/cart-context';
import { Navigation } from '@/components/common/navigation';
import { Footer } from '@/components/common/footer';
import { FloatingCartButton } from '@/components/common/floating-cart-button';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Menu+',
    description: 'Menu+ authentication system',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <CartProvider>
                        <Navigation />
                        <main className="min-h-screen">{children}</main>
                        <Footer />
                        <FloatingCartButton />
                    </CartProvider>
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}

// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { Providers } from "./providers";
// import { ThemeProvider } from "@/components/theme-provider"

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "OMS - Order Management System",
//   description: "Modern order management system with RBAC",
//   icons: {
//     icon: "/favicon.ico",
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <Providers>
//           <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
//             {children}
//           </ThemeProvider>
//         </Providers>
//       </body>
//     </html>
//   );
// }
