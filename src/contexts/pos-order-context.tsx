'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

import {
    POSOrderItem,
    POSOrderItemModifier,
    POSOrderStatus,
} from '@/api/v1/pos-orders';

// Types
export interface POSOrderState {
    orderId?: number;
    tableId?: number;
    tableName?: string;
    items: POSOrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    status: POSOrderStatus;
}

export type POSOrderAction =
    | { type: 'SET_ORDER'; payload: POSOrderState }
    | { type: 'SET_TABLE'; payload: { tableId: number; tableName: string } }
    | { type: 'ADD_ITEM'; payload: Omit<POSOrderItem, 'id'> }
    | {
          type: 'UPDATE_ITEM';
          payload: { index: number; item: Partial<POSOrderItem> };
      }
    | { type: 'REMOVE_ITEM'; payload: number } // index
    | { type: 'UPDATE_QUANTITY'; payload: { index: number; quantity: number } }
    | { type: 'SET_CUSTOMER'; payload: { name?: string; phone?: string } }
    | { type: 'SET_NOTES'; payload: string }
    | { type: 'SET_STATUS'; payload: POSOrderStatus }
    | { type: 'CLEAR_ORDER' }
    | { type: 'CALCULATE_TOTALS' };

interface POSOrderContextType {
    state: POSOrderState;
    dispatch: React.Dispatch<POSOrderAction>;
    // Helper functions
    addItem: (
        product: any,
        quantity?: number,
        modifiers?: POSOrderItemModifier[],
        notes?: string
    ) => void;
    updateItemQuantity: (index: number, quantity: number) => void;
    removeItem: (index: number) => void;
    setTable: (tableId: number, tableName: string) => void;
    setCustomer: (name?: string, phone?: string) => void;
    clearOrder: () => void;
    getItemCount: () => number;
    getTotalAmount: () => number;
}

// Initial state
const initialState: POSOrderState = {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: POSOrderStatus.DRAFT,
};

// Tax rate (10% as per case study)
const TAX_RATE = 0.1;

// Reducer
function posOrderReducer(
    state: POSOrderState,
    action: POSOrderAction
): POSOrderState {
    switch (action.type) {
        case 'SET_ORDER':
            return action.payload;

        case 'SET_TABLE':
            return {
                ...state,
                tableId: action.payload.tableId,
                tableName: action.payload.tableName,
            };

        case 'ADD_ITEM': {
            const newItem: POSOrderItem = {
                ...action.payload,
                id: Date.now(), // Temporary ID
            };
            const newState = {
                ...state,
                items: [...state.items, newItem],
            };
            return calculateTotals(newState);
        }

        case 'UPDATE_ITEM': {
            const newItems = [...state.items];
            newItems[action.payload.index] = {
                ...newItems[action.payload.index],
                ...action.payload.item,
            };
            const newState = {
                ...state,
                items: newItems,
            };
            return calculateTotals(newState);
        }

        case 'REMOVE_ITEM': {
            const newItems = state.items.filter(
                (_, index) => index !== action.payload
            );
            const newState = {
                ...state,
                items: newItems,
            };
            return calculateTotals(newState);
        }

        case 'UPDATE_QUANTITY': {
            const newItems = [...state.items];
            const item = newItems[action.payload.index];
            if (item) {
                item.quantity = action.payload.quantity;
                item.totalPrice = item.unitPrice * item.quantity;
            }
            const newState = {
                ...state,
                items: newItems,
            };
            return calculateTotals(newState);
        }

        case 'SET_CUSTOMER':
            return {
                ...state,
                customerName: action.payload.name,
                customerPhone: action.payload.phone,
            };

        case 'SET_NOTES':
            return {
                ...state,
                notes: action.payload,
            };

        case 'SET_STATUS':
            return {
                ...state,
                status: action.payload,
            };

        case 'CLEAR_ORDER':
            return initialState;

        case 'CALCULATE_TOTALS':
            return calculateTotals(state);

        default:
            return state;
    }
}

// Helper function to calculate totals
function calculateTotals(state: POSOrderState): POSOrderState {
    const subtotal = state.items.reduce(
        (sum, item) => sum + item.totalPrice,
        0
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return {
        ...state,
        subtotal,
        tax,
        total,
    };
}

// Context
const POSOrderContext = createContext<POSOrderContextType | undefined>(
    undefined
);

// Provider
export function POSOrderProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(posOrderReducer, initialState);

    // Helper functions
    const addItem = (
        product: any,
        quantity: number = 1,
        modifiers: POSOrderItemModifier[] = [],
        notes?: string
    ) => {
        const modifierPrice = modifiers.reduce(
            (sum, mod) => sum + mod.price,
            0
        );
        const unitPrice = product.price + modifierPrice;

        dispatch({
            type: 'ADD_ITEM',
            payload: {
                productId: product.id,
                productName: product.name,
                quantity,
                unitPrice,
                totalPrice: unitPrice * quantity,
                modifiers,
                notes,
            },
        });
    };

    const updateItemQuantity = (index: number, quantity: number) => {
        if (quantity <= 0) {
            dispatch({ type: 'REMOVE_ITEM', payload: index });
        } else {
            dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
        }
    };

    const removeItem = (index: number) => {
        dispatch({ type: 'REMOVE_ITEM', payload: index });
    };

    const setTable = (tableId: number, tableName: string) => {
        dispatch({ type: 'SET_TABLE', payload: { tableId, tableName } });
    };

    const setCustomer = (name?: string, phone?: string) => {
        dispatch({ type: 'SET_CUSTOMER', payload: { name, phone } });
    };

    const clearOrder = () => {
        dispatch({ type: 'CLEAR_ORDER' });
    };

    const getItemCount = () => {
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getTotalAmount = () => {
        return state.total;
    };

    const value: POSOrderContextType = {
        state,
        dispatch,
        addItem,
        updateItemQuantity,
        removeItem,
        setTable,
        setCustomer,
        clearOrder,
        getItemCount,
        getTotalAmount,
    };

    return (
        <POSOrderContext.Provider value={value}>
            {children}
        </POSOrderContext.Provider>
    );
}

// Hook
export function usePOSOrder() {
    const context = useContext(POSOrderContext);
    if (context === undefined) {
        throw new Error('usePOSOrder must be used within a POSOrderProvider');
    }
    return context;
}
