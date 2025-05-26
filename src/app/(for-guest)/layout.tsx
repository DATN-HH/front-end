import type React from 'react';
import Providers from '../providers';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/cart-context';
import { Navigation } from '@/components/common/navigation';
import { Footer } from '@/components/common/footer';
import { FloatingCartButton } from '@/components/common/floating-cart-button';

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