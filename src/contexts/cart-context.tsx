'use client';

import type React from 'react';
import { createContext, useContext, useReducer, type ReactNode } from 'react';

import type { FoodComboResponse } from '@/api/v1/menu/food-combos';
import type { MenuProduct, MenuVariant } from '@/api/v1/menu/menu-products';
import type {
    CartItem,
    ProductCartItem,
    ProductVariantCartItem,
    FoodComboCartItem,
    MenuItem,
} from '@/lib/types';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

type CartAction =
    | {
          type: 'ADD_PRODUCT';
          payload: {
              product: MenuProduct;
              quantity?: number;
              notes?: string;
              customizations?: string[];
          };
      }
    | {
          type: 'ADD_PRODUCT_VARIANT';
          payload: {
              product: MenuProduct;
              variant: MenuVariant;
              quantity?: number;
              notes?: string;
              customizations?: string[];
          };
      }
    | {
          type: 'ADD_FOOD_COMBO';
          payload: {
              combo: FoodComboResponse;
              quantity?: number;
              notes?: string;
              customizations?: string[];
          };
      }
    | {
          type: 'ADD_ITEM'; // Legacy support
          payload: {
              menuItem: MenuItem;
              notes?: string;
              customizations?: string[];
          };
      }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_CART' };

const CartContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
} | null>(null);

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

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_PRODUCT': {
            const {
                product,
                quantity = 1,
                notes,
                customizations,
            } = action.payload;

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
                    ...state,
                    items: state.items.map((item) =>
                        item.id === existingItem.id
                            ? { ...item, quantity: item.quantity + quantity }
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
                ...state,
                items: [...state.items, newItem],
            };
        }

        case 'ADD_PRODUCT_VARIANT': {
            const {
                product,
                variant,
                quantity = 1,
                notes,
                customizations,
            } = action.payload;

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
                    ...state,
                    items: state.items.map((item) =>
                        item.id === existingItem.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    ),
                };
            }

            // Calculate variant price
            const variantPrice =
                variant.effectivePrice || variant.price || product.price || 0;

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
                ...state,
                items: [...state.items, newItem],
            };
        }

        case 'ADD_FOOD_COMBO': {
            const {
                combo,
                quantity = 1,
                notes,
                customizations,
            } = action.payload;

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
                    ...state,
                    items: state.items.map((item) =>
                        item.id === existingItem.id
                            ? { ...item, quantity: item.quantity + quantity }
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
                ...state,
                items: [...state.items, newItem],
            };
        }

        case 'ADD_ITEM': {
            // Legacy support for old MenuItem interface
            const existingItem = state.items.find(
                (item) =>
                    item.name === action.payload.menuItem.name &&
                    item.notes === action.payload.notes
            );

            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map((item) =>
                        item.id === existingItem.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }

            const newItem: ProductCartItem = {
                id: `legacy-${action.payload.menuItem.id}-${Date.now()}`,
                type: 'product',
                productId: parseInt(action.payload.menuItem.id),
                name: action.payload.menuItem.name,
                description: action.payload.menuItem.description,
                image: action.payload.menuItem.image,
                price: action.payload.menuItem.price,
                quantity: 1,
                notes: action.payload.notes,
                customizations: action.payload.customizations,
            };

            return {
                ...state,
                items: [...state.items, newItem],
            };
        }

        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter((item) => item.id !== action.payload),
            };

        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items
                    .map((item) =>
                        item.id === action.payload.id
                            ? { ...item, quantity: action.payload.quantity }
                            : item
                    )
                    .filter((item) => item.quantity > 0),
            };

        case 'CLEAR_CART':
            return {
                ...state,
                items: [],
            };

        case 'TOGGLE_CART':
            return {
                ...state,
                isOpen: !state.isOpen,
            };

        default:
            return state;
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [],
        isOpen: false,
    });

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }

    // Helper functions for easier cart management
    const addProduct = (
        product: MenuProduct,
        options?: {
            quantity?: number;
            notes?: string;
            customizations?: string[];
        }
    ) => {
        context.dispatch({
            type: 'ADD_PRODUCT',
            payload: {
                product,
                quantity: options?.quantity || 1,
                notes: options?.notes,
                customizations: options?.customizations,
            },
        });
    };

    const addProductVariant = (
        product: MenuProduct,
        variant: MenuVariant,
        options?: {
            quantity?: number;
            notes?: string;
            customizations?: string[];
        }
    ) => {
        context.dispatch({
            type: 'ADD_PRODUCT_VARIANT',
            payload: {
                product,
                variant,
                quantity: options?.quantity || 1,
                notes: options?.notes,
                customizations: options?.customizations,
            },
        });
    };

    const addFoodCombo = (
        combo: FoodComboResponse,
        options?: {
            quantity?: number;
            notes?: string;
            customizations?: string[];
        }
    ) => {
        context.dispatch({
            type: 'ADD_FOOD_COMBO',
            payload: {
                combo,
                quantity: options?.quantity || 1,
                notes: options?.notes,
                customizations: options?.customizations,
            },
        });
    };

    const removeItem = (itemId: string) => {
        context.dispatch({
            type: 'REMOVE_ITEM',
            payload: itemId,
        });
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        context.dispatch({
            type: 'UPDATE_QUANTITY',
            payload: { id: itemId, quantity },
        });
    };

    const clearCart = () => {
        context.dispatch({ type: 'CLEAR_CART' });
    };

    const toggleCart = () => {
        context.dispatch({ type: 'TOGGLE_CART' });
    };

    // Calculate totals
    const totalItems = context.state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );
    const totalPrice = context.state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return {
        ...context,
        // Helper functions
        addProduct,
        addProductVariant,
        addFoodCombo,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        // Computed values
        totalItems,
        totalPrice,
    };
}
