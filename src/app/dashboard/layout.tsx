import type React from 'react';
import Sidebar from '@/components/common/sidebar';
import Header from '@/components/common/header';
import { Toaster } from '@/components/ui/toaster';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col h-screen">
            {/* Header at the top */}
            <Header />

            {/* Main content area with sidebar and content */}
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
    );
} 