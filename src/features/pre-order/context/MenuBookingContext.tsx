'use client';

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from 'react';

import {
    usePriceCalculation,
    PriceCalculationRequest,
    PriceCalculationResponse,
} from '@/api/v1/menu/price-calculation';

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
    isCalculating: boolean;
    calculatePrices: () => void;
    // API response data for Order Summary
    apiResponse: PriceCalculationResponse | null;
    getItemNameById: (
        id: number,
        type: 'product' | 'variant' | 'combo',
        note?: string
    ) => string;
}

const MenuBookingContext = createContext<MenuBookingContextType | undefined>(
    undefined
);

export function MenuBookingProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<MenuBookingItem[]>([]);
    const [apiResponse, setApiResponse] =
        useState<PriceCalculationResponse | null>(null);
    const priceCalculation = usePriceCalculation();

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
        setApiResponse(null);
    };

    const getTotalItems = () => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getTotalPrice = () => {
        // Use API response total if available
        if (apiResponse) {
            return apiResponse.total;
        }
        // Fallback to local calculation if API not called yet
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const calculatePrices = async () => {
        if (items.length === 0) {
            setApiResponse(null);
            return;
        }

        // Group items by type for API request
        const request: PriceCalculationRequest = {
            foodCombo: [],
            productVariant: [],
            product: [],
        };

        items.forEach((item) => {
            const apiItem = {
                id: item.comboId || item.variantId || item.productId || 0,
                note: item.notes || '',
                quantity: item.quantity,
            };

            switch (item.type) {
                case 'combo':
                    request.foodCombo.push(apiItem);
                    break;
                case 'variant':
                    request.productVariant.push(apiItem);
                    break;
                case 'product':
                    request.product.push(apiItem);
                    break;
            }
        });

        try {
            const response = await priceCalculation.mutateAsync(request);
            if (response.success && response.payload) {
                setApiResponse(response.payload);
            }
        } catch (error) {
            console.error('Price calculation failed:', error);
            // Keep current apiResponse on error
        }
    };

    // Helper function to get item name by matching with local items
    const getItemNameById = (
        id: number,
        type: 'product' | 'variant' | 'combo',
        note?: string
    ) => {
        const localItem = items.find((item) => {
            const itemId = item.comboId || item.variantId || item.productId;
            return (
                itemId === id &&
                item.type === type &&
                (item.notes || '') === (note || '')
            );
        });
        return localItem?.name || `${type} #${id}`;
    };

    // Auto-calculate prices when items change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            calculatePrices();
        }, 500); // Debounce API calls

        return () => clearTimeout(timeoutId);
    }, [items]);

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
                isCalculating: priceCalculation.isPending,
                calculatePrices,
                apiResponse,
                getItemNameById,
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
