'use client';

import type React from 'react';
import { createContext, useContext, useReducer, type ReactNode } from 'react';

import type { CartItem, MenuItem } from '@/lib/types';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

type CartAction =
    | {
          type: 'ADD_ITEM';
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

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.items.find(
                (item) => item.menuItem.id === action.payload.menuItem.id
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

            const newItem: CartItem = {
                id: `${action.payload.menuItem.id}-${Date.now()}`,
                menuItem: action.payload.menuItem,
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
    return context;
}
