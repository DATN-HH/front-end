import { useMutation, useQuery } from '@tanstack/react-query';

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

export interface OrderItemSummary {
    itemType: 'foodCombo' | string;
    itemId: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    note: string;
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

// ===== NEW PRE-ORDER PAYMENT API =====
export interface PreOrderStatusResponse {
    bookingStatus:
        | 'PENDING'
        | 'BOOKED'
        | 'DEPOSIT_PAID'
        | 'CANCELLED'
        | 'COMPLETED';
}

const getPreOrderStatus = async (
    preOrderId: number
): Promise<BaseResponse<PreOrderStatusResponse>> => {
    const response = await apiClient.get(
        `/booking-table/pre-order/status/${preOrderId}`
    );
    return response.data;
};

export const usePreOrderStatus = (
    preOrderId: number,
    enabled: boolean = true,
    refetchInterval: number = 5000
) => {
    return useQuery({
        queryKey: ['pre-order-status', preOrderId],
        queryFn: () => getPreOrderStatus(preOrderId),
        enabled: enabled && !!preOrderId,
        refetchInterval,
    });
};

// ===== CASH PAYMENT API =====
export interface PreOrderCashPaymentRequest {
    preOrderId: number;
    requiredAmount: number;
    givenAmount: number;
}

export interface PreOrderCashPaymentResponse {
    preOrderId: number;
    bookingStatus: string;
    message: string;
    requiredAmount: number;
    givenAmount: number;
    changeAmount: number;
}

const processPreOrderCashPayment = async (
    request: PreOrderCashPaymentRequest
): Promise<BaseResponse<PreOrderCashPaymentResponse>> => {
    const response = await apiClient.post(
        '/booking-table/pre-order/cash-payment',
        request
    );
    return response.data;
};

export const usePreOrderCashPayment = () => {
    return useMutation({
        mutationFn: processPreOrderCashPayment,
        onError: (error: unknown) => {
            console.error('Cash payment processing failed:', error);
        },
    });
};
