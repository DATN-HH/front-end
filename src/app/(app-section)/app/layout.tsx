import type React from 'react';
import type { Metadata } from 'next';
import Providers from '../../providers';
import Sidebar from '@/components/common/SideBar/SideBar';
import Header from '@/components/common/header';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
    title: 'Menu+ Personnel Management',
    description: 'Personnel management system for restaurants',
};

export default function AdminPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
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
    );
}