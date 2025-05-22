import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import Providers from '../providers';
import Sidebar from '@/components/common/sidebar';
import Header from '@/components/common/header';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Menu+ Personnel Management',
    description: 'Personnel management system for restaurants',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <div className="flex flex-col h-screen">
                        {/* Header ở trên cùng */}
                        <Header />

                        {/* Phần còn lại chia làm 2 cột: children (trái) - sidebar (phải) */}
                        <div className="flex flex-1 overflow-hidden">
                            <div className="w-64 border-l border-gray-200">
                                <Sidebar />
                            </div>

                            <main className="flex-1 overflow-auto p-4 md:p-6">
                                {children}
                                <Toaster />
                            </main>
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
