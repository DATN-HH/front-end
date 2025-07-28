import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { FoodComboResponse } from '@/api/v1/menu/food-combos';
import type { MenuProduct, MenuVariant } from '@/api/v1/menu/menu-products';
import { getVariantPrice } from '@/api/v1/menu/menu-products';
import type {
    CartItem,
    ProductCartItem,
    ProductVariantCartItem,
    FoodComboCartItem,
} from '@/lib/types';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
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

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            // Initial state
            items: [],
            isOpen: false,

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
                        return {
                            items: state.items.map((item) =>
                                item.id === existingItem.id
                                    ? {
                                          ...item,
                                          quantity: item.quantity + quantity,
                                      }
                                    : item
                            ),
                        };
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
                        price: product.price || 0,
                        quantity,
                        notes,
                        customizations,
                    };

                    return {
                        items: [...state.items, newItem],
                    };
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
                        return {
                            items: state.items.map((item) =>
                                item.id === existingItem.id
                                    ? {
                                          ...item,
                                          quantity: item.quantity + quantity,
                                      }
                                    : item
                            ),
                        };
                    }

                    // Calculate variant price using the proper function
                    const variantPrice = getVariantPrice(
                        variant,
                        product.price || 0
                    );

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
                        price: variantPrice,
                        quantity,
                        notes,
                        customizations,
                    };

                    return {
                        items: [...state.items, newItem],
                    };
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
                        return {
                            items: state.items.map((item) =>
                                item.id === existingItem.id
                                    ? {
                                          ...item,
                                          quantity: item.quantity + quantity,
                                      }
                                    : item
                            ),
                        };
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
                        price: combo.effectivePrice,
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

                    return {
                        items: [...state.items, newItem],
                    };
                });
            },

            removeItem: (itemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== itemId),
                }));
            },

            updateQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            toggleCart: () => {
                set((state) => ({ isOpen: !state.isOpen }));
            },

            setCartOpen: (open) => {
                set({ isOpen: open });
            },

            // Computed values
            getTotalItems: () => {
                const { items } = get();
                return items.reduce((sum, item) => sum + item.quantity, 0);
            },

            getTotalPrice: () => {
                const { items } = get();
                return items.reduce((sum, item) => {
                    const itemPrice = item.price || 0; // Safe fallback for undefined price
                    return sum + itemPrice * item.quantity;
                }, 0);
            },
        }),
        {
            name: 'cart-storage', // unique name for localStorage key
            storage: createJSONStorage(() => localStorage), // use localStorage
            partialize: (state) => ({
                items: state.items,
            }), // only persist items, not isOpen state
        }
    )
);
