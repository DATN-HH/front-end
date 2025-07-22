'use client';

import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';

export function FloatingCartButton() {
    const { state } = useCart();
    const router = useRouter();

    const totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );
    const totalPrice = state.items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
    );

    if (totalItems === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button
                onClick={() => router.push('/cart')}
                className="rounded-full h-14 w-14 shadow-lg relative"
                size="lg"
            >
                <ShoppingCart className="h-6 w-6" />
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs">
                    {totalItems}
                </Badge>
            </Button>
            <div className="absolute -top-12 right-0 bg-black text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                ${totalPrice.toFixed(2)}
            </div>
        </div>
    );
}
