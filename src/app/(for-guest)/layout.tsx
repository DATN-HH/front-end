import type React from 'react';

import Providers from '@/app/providers';
import { FloatingCartButton } from '@/components/common/floating-cart-button';
import { Footer } from '@/components/common/footer';
import { Navigation } from '@/components/common/navigation';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/cart-context';

export default function MainSiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Providers>
            <CartProvider>
                <Navigation />
                <main className="min-h-screen">{children}</main>
                <Footer />
                <FloatingCartButton />
            </CartProvider>
            <Toaster />
        </Providers>
    );
}
