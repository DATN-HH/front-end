'use client';

import { ReactNode } from 'react';

import Providers from '@/app/providers';
import { Toaster } from '@/components/ui/toaster';
import { NotificationProvider } from '@/contexts/notification-context';
import { POSOrderProvider } from '@/contexts/pos-order-context';

interface POSLayoutProps {
    children: ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
    return (
        <Providers>
            <NotificationProvider>
                <POSOrderProvider>
                    <div className="flex h-screen bg-gray-100 overflow-hidden">
                        {/* POS Main Content - Full screen layout */}
                        <div className="flex flex-col flex-1">
                            {children}
                        </div>
                    </div>
                    <Toaster />
                </POSOrderProvider>
            </NotificationProvider>
        </Providers>
    );
}
