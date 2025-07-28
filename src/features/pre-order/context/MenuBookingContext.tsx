'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface MenuBookingItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    type: 'product' | 'variant' | 'combo';
    productId?: number;
    variantId?: number;
    comboId?: number;
}

interface MenuBookingContextType {
    items: MenuBookingItem[];
    addItem: (item: Omit<MenuBookingItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearItems: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const MenuBookingContext = createContext<MenuBookingContextType | undefined>(
    undefined
);

export function MenuBookingProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<MenuBookingItem[]>([]);

    const addItem = (newItem: Omit<MenuBookingItem, 'id'>) => {
        const id = `${newItem.type}-${newItem.productId || newItem.variantId || newItem.comboId}-${Date.now()}`;
        setItems((prev) => [...prev, { ...newItem, id }]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearItems = () => {
        setItems([]);
    };

    const getTotalItems = () => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    return (
        <MenuBookingContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearItems,
                getTotalItems,
                getTotalPrice,
            }}
        >
            {children}
        </MenuBookingContext.Provider>
    );
}

export function useMenuBooking() {
    const context = useContext(MenuBookingContext);
    if (context === undefined) {
        throw new Error(
            'useMenuBooking must be used within a MenuBookingProvider'
        );
    }
    return context;
}
