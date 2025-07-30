import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { FoodComboResponse } from '@/api/v1/menu/food-combos';
import type { MenuProduct, MenuVariant } from '@/api/v1/menu/menu-products';
import {
    PriceCalculationRequest,
    PriceCalculationResponse,
} from '@/api/v1/menu/price-calculation';
import type {
    CartItem,
    ProductCartItem,
    ProductVariantCartItem,
    FoodComboCartItem,
} from '@/lib/types';
import { apiClient } from '@/services/api-client';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    // API price calculation state
    apiResponse: PriceCalculationResponse | null;
    isCalculating: boolean;
}

interface CartActions {
    // Basic actions
    addProduct: (
        product: MenuProduct,
        options?: {
            quantity?: number;
            notes?: string;
            customizations?: string[];
        }
    ) => void;
    addProductVariant: (
        product: MenuProduct,
        variant: MenuVariant,
        options?: {
            quantity?: number;
            notes?: string;
            customizations?: string[];
        }
    ) => void;
    addFoodCombo: (
        combo: FoodComboResponse,
        options?: {
            quantity?: number;
            notes?: string;
            customizations?: string[];
        }
    ) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    setCartOpen: (open: boolean) => void;

    // Computed values
    getTotalItems: () => number;
    getTotalPrice: () => number;

    // Price calculation
    calculatePrices: () => Promise<void>;
    getDisplayItems: () => any[];
}

type CartStore = CartState & CartActions;

// Helper function to generate unique cart item ID
function generateCartItemId(
    type: string,
    id: number,
    variantId?: number,
    notes?: string,
    customizations?: string[]
): string {
    const baseId = variantId ? `${type}-${id}-${variantId}` : `${type}-${id}`;
    const notesHash = notes
        ? `-notes-${notes.replace(/\s+/g, '-').toLowerCase()}`
        : '';
    const customHash = customizations?.length
        ? `-custom-${customizations.join('-').replace(/\s+/g, '-').toLowerCase()}`
        : '';
    return `${baseId}${notesHash}${customHash}`;
}

// Helper function to find existing cart item
function findExistingCartItem(
    items: CartItem[],
    type: string,
    id: number,
    variantId?: number,
    notes?: string,
    customizations?: string[]
): CartItem | undefined {
    const targetId = generateCartItemId(
        type,
        id,
        variantId,
        notes,
        customizations
    );
    return items.find((item) => item.id === targetId);
}

// Price calculation API call
const calculatePrice = async (
    request: PriceCalculationRequest
): Promise<PriceCalculationResponse> => {
    const response = await apiClient.post<{
        success: boolean;
        payload: PriceCalculationResponse;
    }>('/menu/price/calculate', request);
    return response.data.payload;
};

// Debounce function
let calculationTimeout: NodeJS.Timeout | null = null;

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            // Initial state
            items: [],
            isOpen: false,
            apiResponse: null,
            isCalculating: false,

            // Actions
            addProduct: (product, options = {}) => {
                const { quantity = 1, notes, customizations } = options;

                set((state) => {
                    const existingItem = findExistingCartItem(
                        state.items,
                        'product',
                        product.id,
                        undefined,
                        notes,
                        customizations
                    );

                    if (existingItem) {
                        const newState = {
                            items: state.items.map((item) =>
                                item.id === existingItem.id
                                    ? {
                                          ...item,
                                          quantity: item.quantity + quantity,
                                      }
                                    : item
                            ),
                        };
                        // Trigger price calculation after state update
                        setTimeout(() => get().calculatePrices(), 50);
                        return newState;
                    }

                    const newItem: ProductCartItem = {
                        id: generateCartItemId(
                            'product',
                            product.id,
                            undefined,
                            notes,
                            customizations
                        ),
                        type: 'product',
                        productId: product.id,
                        name: product.name,
                        description: product.description,
                        image: product.image,
                        price: 0, // Price will be calculated by API
                        quantity,
                        notes,
                        customizations,
                    };

                    const newState = {
                        items: [...state.items, newItem],
                    };
                    // Trigger price calculation after state update
                    setTimeout(() => get().calculatePrices(), 50);
                    return newState;
                });
            },

            addProductVariant: (product, variant, options = {}) => {
                const { quantity = 1, notes, customizations } = options;

                set((state) => {
                    const existingItem = findExistingCartItem(
                        state.items,
                        'product_variant',
                        product.id,
                        variant.id,
                        notes,
                        customizations
                    );

                    if (existingItem) {
                        const newState = {
                            items: state.items.map((item) =>
                                item.id === existingItem.id
                                    ? {
                                          ...item,
                                          quantity: item.quantity + quantity,
                                      }
                                    : item
                            ),
                        };
                        // Trigger price calculation after state update
                        setTimeout(() => get().calculatePrices(), 50);
                        return newState;
                    }

                    const newItem: ProductVariantCartItem = {
                        id: generateCartItemId(
                            'product_variant',
                            product.id,
                            variant.id,
                            notes,
                            customizations
                        ),
                        type: 'product_variant',
                        productId: product.id,
                        variantId: variant.id,
                        name: `${product.name} (${variant.name})`,
                        variantName: variant.name,
                        baseProductName: product.name,
                        description: product.description,
                        image: product.image,
                        price: 0, // Price will be calculated by API
                        quantity,
                        notes,
                        customizations,
                    };

                    const newState = {
                        items: [...state.items, newItem],
                    };
                    // Trigger price calculation after state update
                    setTimeout(() => get().calculatePrices(), 50);
                    return newState;
                });
            },

            addFoodCombo: (combo, options = {}) => {
                const { quantity = 1, notes, customizations } = options;

                set((state) => {
                    const existingItem = findExistingCartItem(
                        state.items,
                        'food_combo',
                        combo.id,
                        undefined,
                        notes,
                        customizations
                    );

                    if (existingItem) {
                        const newState = {
                            items: state.items.map((item) =>
                                item.id === existingItem.id
                                    ? {
                                          ...item,
                                          quantity: item.quantity + quantity,
                                      }
                                    : item
                            ),
                        };
                        // Trigger price calculation after state update
                        setTimeout(() => get().calculatePrices(), 50);
                        return newState;
                    }

                    const newItem: FoodComboCartItem = {
                        id: generateCartItemId(
                            'food_combo',
                            combo.id,
                            undefined,
                            notes,
                            customizations
                        ),
                        type: 'food_combo',
                        comboId: combo.id,
                        name: combo.name,
                        description: combo.description,
                        image: combo.image,
                        price: 0, // Price will be calculated by API
                        quantity,
                        notes,
                        customizations,
                        itemsCount: combo.itemsCount,
                        comboItems: combo.comboItems.map((item) => ({
                            productId: item.productId,
                            productName: item.productName,
                            quantity: item.quantity,
                        })),
                    };

                    const newState = {
                        items: [...state.items, newItem],
                    };
                    // Trigger price calculation after state update
                    setTimeout(() => get().calculatePrices(), 50);
                    return newState;
                });
            },

            removeItem: (itemId) => {
                set((state) => {
                    const newState = {
                        items: state.items.filter((item) => item.id !== itemId),
                    };
                    // Trigger price calculation after state update
                    setTimeout(() => get().calculatePrices(), 50);
                    return newState;
                });
            },

            updateQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }

                set((state) => {
                    const newState = {
                        items: state.items.map((item) =>
                            item.id === itemId ? { ...item, quantity } : item
                        ),
                    };
                    // Trigger price calculation after state update
                    setTimeout(() => get().calculatePrices(), 50);
                    return newState;
                });
            },

            clearCart: () => {
                set({ items: [], apiResponse: null });
            },

            toggleCart: () => {
                set((state) => ({ isOpen: !state.isOpen }));
            },

            setCartOpen: (open) => {
                set({ isOpen: open });
            },

            // Price calculation function
            calculatePrices: async () => {
                const { items } = get();

                if (items.length === 0) {
                    set({ apiResponse: null, isCalculating: false });
                    return;
                }

                // Clear existing timeout
                if (calculationTimeout) {
                    clearTimeout(calculationTimeout);
                }

                // Debounce API calls
                calculationTimeout = setTimeout(async () => {
                    set({ isCalculating: true });

                    try {
                        // Group items by type for API request
                        const request: PriceCalculationRequest = {
                            foodCombo: [],
                            productVariant: [],
                            product: [],
                        };

                        items.forEach((item) => {
                            const apiItem = {
                                id: 0,
                                note: item.notes || '',
                                quantity: item.quantity,
                            };

                            switch (item.type) {
                                case 'food_combo':
                                    apiItem.id = (
                                        item as FoodComboCartItem
                                    ).comboId;
                                    request.foodCombo.push(apiItem);
                                    break;
                                case 'product_variant':
                                    apiItem.id = (
                                        item as ProductVariantCartItem
                                    ).variantId;
                                    request.productVariant.push(apiItem);
                                    break;
                                case 'product':
                                    apiItem.id = (
                                        item as ProductCartItem
                                    ).productId;
                                    request.product.push(apiItem);
                                    break;
                            }
                        });

                        const apiResponse = await calculatePrice(request);
                        set({ apiResponse, isCalculating: false });
                    } catch (error) {
                        console.error('Price calculation failed:', error);
                        set({ isCalculating: false });
                        // Keep current apiResponse on error
                    }
                }, 200); // Reduced debounce time for better UX
            },

            // Get display items from API response or fallback to local items
            getDisplayItems: () => {
                const { apiResponse, items } = get();

                if (!apiResponse) return items;

                const allItems = [
                    ...apiResponse.foodCombo.map((item) => ({
                        ...item,
                        type: 'food_combo' as const,
                        name:
                            items.find(
                                (localItem) =>
                                    localItem.type === 'food_combo' &&
                                    (localItem as FoodComboCartItem).comboId ===
                                        item.id &&
                                    (localItem.notes || '') ===
                                        (item.note || '')
                            )?.name || `Combo #${item.id}`,
                    })),
                    ...apiResponse.productVariant.map((item) => ({
                        ...item,
                        type: 'product_variant' as const,
                        name:
                            items.find(
                                (localItem) =>
                                    localItem.type === 'product_variant' &&
                                    (localItem as ProductVariantCartItem)
                                        .variantId === item.id &&
                                    (localItem.notes || '') ===
                                        (item.note || '')
                            )?.name || `Variant #${item.id}`,
                    })),
                    ...apiResponse.product.map((item) => ({
                        ...item,
                        type: 'product' as const,
                        name:
                            items.find(
                                (localItem) =>
                                    localItem.type === 'product' &&
                                    (localItem as ProductCartItem).productId ===
                                        item.id &&
                                    (localItem.notes || '') ===
                                        (item.note || '')
                            )?.name || `Product #${item.id}`,
                    })),
                ];

                return allItems;
            },

            // Computed values
            getTotalItems: () => {
                const { items } = get();
                return items.reduce((sum, item) => sum + item.quantity, 0);
            },

            getTotalPrice: () => {
                const { apiResponse } = get();

                // Only use API response total - no local calculation fallback
                if (apiResponse) {
                    return apiResponse.totalPromotion || apiResponse.total;
                }

                // Return 0 if no API response yet (prices will be calculated by API)
                return 0;
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                items: state.items,
            }), // only persist items, not API response or isCalculating state
        }
    )
);
