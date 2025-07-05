'use client';

import { ReactNode } from 'react';
import Providers from '@/app/providers';
import { Toaster } from '@/components/ui/toaster';

interface PosLayoutProps {
    children: ReactNode;
}

export default function PosLayout({ children }: PosLayoutProps) {
    return (
        <Providers>
            <div className="min-h-screen">
                {children}
            </div>
            <Toaster />
        </Providers>
    );
}