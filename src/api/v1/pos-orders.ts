import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Types
export enum POSOrderStatus {
    DRAFT = 'DRAFT',
    ORDERED = 'ORDERED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum POSPaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    VIETQR = 'VIETQR',
    PAYOS = 'PAYOS',
    CUSTOMER_ACCOUNT = 'CUSTOMER_ACCOUNT',
}

export enum POSPaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    REFUNDED = 'REFUNDED',
    CANCELLED = 'CANCELLED',
}

export interface POSOrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    modifiers?: POSOrderItemModifier[];
    itemStatus?: string; // RECEIVED, PREPARING, READY, COMPLETED
    isCombo?: boolean;
    variantId?: number;
    attributeCombination?: string;
}

export interface POSOrderItemModifier {
    id: number;
    name: string;
    price: number;
}

export interface POSOrderPayment {
    id: number;
    method: POSPaymentMethod;
    amount: number;
    status: POSPaymentStatus;
    reference?: string;
    createdAt: string;
}

export interface POSOrder {
    id: number;
    orderNumber: string;
    tableId?: number;
    tableName?: string;
    status: POSOrderStatus;
    items: POSOrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    payments: POSOrderPayment[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface POSOrderCreateRequest {
    tableId?: number;
    items: Omit<POSOrderItem, 'id'>[];
    customerName?: string;
    customerPhone?: string;
    notes?: string;
}

export interface POSOrderUpdateRequest {
    id: number;
    tableId?: number;
    items: Omit<POSOrderItem, 'id'>[];
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    status?: POSOrderStatus;
}

export interface POSOrderPaymentRequest {
    orderId: number;
    method: POSPaymentMethod;
    amount: number;
    reference?: string;
}

// API response interface for POS endpoints (different from KDS)
interface POSApiResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}

// API calls
const createPOSOrder = async (
    data: POSOrderCreateRequest
): Promise<POSOrder> => {
    const response = await apiClient.post<any>('/api/pos/orders', data);

    // Handle the backend ApiResponse format: { success, code, message, data }
    // The actual order data is in response.data.data
    let order;

    if (response.data && typeof response.data === 'object') {
        if (response.data.data) {
            // Standard ApiResponse format
            order = response.data.data;
        } else if (response.data.id) {
            // Direct order object
            order = response.data;
        } else {
            throw new Error(
                `Unexpected response format: ${JSON.stringify(response.data)}`
            );
        }
    } else {
        throw new Error(`Invalid response: ${JSON.stringify(response.data)}`);
    }

    // Validate the order object
    if (!order || typeof order !== 'object') {
        throw new Error(`Invalid order object: ${JSON.stringify(order)}`);
    }

    if (!order.id) {
        throw new Error(`Order missing ID: ${JSON.stringify(order)}`);
    }

    return order as POSOrder;
};

const updatePOSOrder = async (
    data: POSOrderUpdateRequest
): Promise<POSOrder> => {
    const response = await apiClient.put<POSApiResponse<POSOrder>>(
        `/api/pos/orders/${data.id}`,
        data
    );
    return response.data.data;
};

const getPOSOrder = async (id: number): Promise<POSOrder> => {
    const response = await apiClient.get<POSApiResponse<POSOrder>>(
        `/api/pos/orders/${id}`
    );
    return response.data.data;
};

const getPOSOrders = async (status?: POSOrderStatus): Promise<POSOrder[]> => {
    const response = await apiClient.get<POSApiResponse<POSOrder[]>>(
        '/api/pos/orders',
        { params: { status } }
    );
    return response.data.data;
};

const createPOSOrderPayment = async (
    data: POSOrderPaymentRequest
): Promise<POSOrderPayment> => {
    const response = await apiClient.post<POSApiResponse<POSOrderPayment>>(
        `/api/pos/orders/${data.orderId}/payments`,
        data
    );
    return response.data.data;
};

const sendOrderToKitchen = async (orderId: number): Promise<POSOrder> => {
    const response = await apiClient.post<POSApiResponse<POSOrder>>(
        `/api/pos/orders/${orderId}/send-to-kitchen`
    );
    return response.data.data;
};

const updateOrderItemStatus = async (
    orderId: number,
    itemId: number,
    status: string
): Promise<POSOrder> => {
    const response = await apiClient.patch<POSApiResponse<POSOrder>>(
        `/api/pos/orders/${orderId}/items/${itemId}/status?status=${status}`
    );
    return response.data.data;
};

// VietQR Payment Link Creation
export interface VietQRPaymentResponse {
    orderCode: number;
    amount: number;
    description: string;
    accountNumber: string;
    accountName: string;
    bin: string;
    checkoutUrl: string;
    paymentLinkId: string;
    status: string;
    qrCode: string;
}

const createVietQRPaymentLink = async (
    orderId: number
): Promise<VietQRPaymentResponse> => {
    const response = await apiClient.post<BaseResponse<VietQRPaymentResponse>>(
        `/payment/create-payment-link-for-order/${orderId}`
    );
    return response.data.payload;
};

// Hooks
export const useCreatePOSOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPOSOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
        },
    });
};

export const useUpdatePOSOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePOSOrder,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
            queryClient.invalidateQueries({ queryKey: ['pos-order', data.id] });
        },
    });
};

export const usePOSOrder = (id: number) => {
    return useQuery({
        queryKey: ['pos-order', id],
        queryFn: () => getPOSOrder(id),
        enabled: !!id,
    });
};

export const usePOSOrders = (status?: POSOrderStatus) => {
    return useQuery({
        queryKey: ['pos-orders', status],
        queryFn: () => getPOSOrders(status),
    });
};

export const useCreatePOSOrderPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPOSOrderPayment,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['pos-order', variables.orderId],
            });
        },
    });
};

export const useSendOrderToKitchen = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sendOrderToKitchen,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['pos-order', data.id] });
        },
    });
};

export const useUpdateOrderItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            itemId,
            status,
        }: {
            orderId: number;
            itemId: number;
            status: string;
        }) => updateOrderItemStatus(orderId, itemId, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['pos-order', data.id] });
            queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
        },
    });
};

export const useCreateVietQRPaymentLink = () => {
    return useMutation({
        mutationFn: createVietQRPaymentLink,
    });
};
