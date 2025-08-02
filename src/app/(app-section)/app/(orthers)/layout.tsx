'use client';
import { ReactNode, useState } from 'react';

import Providers from '@/app/providers';
import { SectionBreadcrumb } from '@/components/layouts/app-section/breadcrumb';
import { SectionHeader } from '@/components/layouts/app-section/header';
import { SectionSidebar } from '@/components/layouts/app-section/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { NotificationProvider } from '@/contexts/notification-context';

interface SectionLayoutProps {
    children: ReactNode;
}

export default function SectionLayout({ children }: SectionLayoutProps) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <Providers>
            <NotificationProvider>
                <div className="flex h-screen bg-background">
                    {/* Mobile sidebar overlay */}
                    {isMobileSidebarOpen && (
                        <div
                            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <div
                        className={`
                        fixed lg:relative z-50 lg:z-auto transition-transform duration-300 lg:translate-x-0
                        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                    >
                        <SectionSidebar />
                    </div>

                    {/* Main content */}
                    <div className="flex flex-col flex-1 overflow-hidden lg:ml-0">
                        <SectionHeader
                            onMobileSidebarToggle={() =>
                                setIsMobileSidebarOpen(!isMobileSidebarOpen)
                            }
                            isMobileSidebarOpen={isMobileSidebarOpen}
                        />
                        <div className="flex-1 overflow-auto p-4 lg:p-6">
                            <SectionBreadcrumb />
                            <main className="mt-4">{children}</main>
                        </div>
                    </div>
                </div>
                <Toaster />
            </NotificationProvider>
        </Providers>
    );
}
