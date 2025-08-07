'use client';
import { ReactNode } from 'react';

import Providers from '@/app/providers';
import { Toaster } from '@/components/ui/toaster';

interface SectionLayoutProps {
    children: ReactNode;
}

export default function SectionLayout({ children }: SectionLayoutProps) {
    return (
        <Providers>
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                {/* KDS Main Content - Full screen layout */}
                <div className="flex flex-col flex-1">{children}</div>
            </div>
            <Toaster />
        </Providers>
    );
}
