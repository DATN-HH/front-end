import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Request Types
export interface PreOrderItem {
    id: number;
    note?: string;
    quantity: number;
}

export interface PreOrderRequest {
    type: 'dine-in' | 'takeaway';
    branchId: number;
    bookingTableId?: number; // Optional - only for dine-in
    time: string; // ISO format: yyyy-MM-ddTHH:mm:ss
    customerName: string;
    customerPhone: string;
    notes?: string;
    orderItems: {
        foodCombo: PreOrderItem[];
        productVariant: PreOrderItem[];
        product: PreOrderItem[];
    };
}

// Response Types
export interface PreOrderResponseItem {
    id: number;
    itemId: number;
    itemName: string;
    quantity: number;
    price: number;
    promotionPrice: number | null;
    total: number;
    totalPromotion: number | null;
    note?: string;
}

export interface PreOrderResponse {
    id: number;
    type: 'dine-in' | 'takeaway';
    branchId: number;
    bookingTableId?: number;
    time: string;
    customerName: string;
    customerPhone: string;
    notes?: string;
    totalDeposit: number;
    expireTime: string;
    bookingStatus: string;
    createdAt: string;
    foodCombos: PreOrderResponseItem[];
    products: PreOrderResponseItem[];
    productVariants: PreOrderResponseItem[];
}

// API calls
const createPreOrder = async (
    request: PreOrderRequest
): Promise<PreOrderResponse> => {
    const response = await apiClient.post<BaseResponse<PreOrderResponse>>(
        '/booking-table/pre-order',
        request
    );
    return response.data.payload;
};

// Hooks
export const useCreatePreOrder = () => {
    return useMutation({
        mutationFn: createPreOrder,
    });
};
