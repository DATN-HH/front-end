import type React from 'react';

import Providers from '@/app/providers';
import { Footer } from '@/components/common/footer';
import { Navigation } from '@/components/common/navigation';
import { Toaster } from '@/components/ui/toaster';

export default function MainSiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Providers>
            <Navigation />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster />
        </Providers>
    );
}
