import { useMutation, useQueryClient } from '@tanstack/react-query';

import apiClient from '@/services/api-client';

// Interfaces based on the API documentation
export interface SelfOrderAddItemsRequest {
    orderId: number;
    items: Array<{
        productId?: number;
        variantId?: number;
        comboId?: number;
        quantity: number;
        notes?: string;
        attributeCombination?: string;
    }>;
}

export interface SelfOrderItem {
    id: number;
    productId: number;
    productName: string;
    variantId?: number;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    attributeCombination?: string;
    itemStatus: string;
    isCombo: boolean;
    comboId?: number;
    comboName?: string;
}

export interface SelfOrderTable {
    id: number;
    tableId: number;
    tableName: string;
    isPrimary: boolean;
    notes?: string;
}

export interface SelfOrderResponse {
    id: number;
    orderNumber: string;
    orderStatus: string;
    orderType: string;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    subtotal: number;
    total: number;
    items: SelfOrderItem[];
    tables: SelfOrderTable[];
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// API function
const addItemsToOrder = async (
    data: SelfOrderAddItemsRequest
): Promise<SelfOrderResponse> => {
    const response = await apiClient.post<ApiResponse<SelfOrderResponse>>(
        '/api/self-order/add-items',
        data
    );

    if (!response.data.success) {
        throw new Error(
            response.data.message || 'Failed to add items to order'
        );
    }

    return response.data.data;
};

// Hook
export const useAddItemsToOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addItemsToOrder,
        onSuccess: (data) => {
            // Invalidate related queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['pos-order', data.id] });
            queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
        },
    });
};
