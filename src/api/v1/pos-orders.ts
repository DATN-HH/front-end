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

// API calls
const createPOSOrder = async (data: POSOrderCreateRequest): Promise<POSOrder> => {
    const response = await apiClient.post<BaseResponse<POSOrder>>(
        '/api/pos/orders',
        data
    );
    return response.data.payload;
};

const updatePOSOrder = async (data: POSOrderUpdateRequest): Promise<POSOrder> => {
    const response = await apiClient.put<BaseResponse<POSOrder>>(
        `/api/pos/orders/${data.id}`,
        data
    );
    return response.data.payload;
};

const getPOSOrder = async (id: number): Promise<POSOrder> => {
    const response = await apiClient.get<BaseResponse<POSOrder>>(
        `/api/pos/orders/${id}`
    );
    return response.data.payload;
};

const getPOSOrders = async (status?: POSOrderStatus): Promise<POSOrder[]> => {
    const response = await apiClient.get<BaseResponse<POSOrder[]>>(
        '/api/pos/orders',
        { params: { status } }
    );
    return response.data.payload;
};

const createPOSOrderPayment = async (data: POSOrderPaymentRequest): Promise<POSOrderPayment> => {
    const response = await apiClient.post<BaseResponse<POSOrderPayment>>(
        `/api/pos/orders/${data.orderId}/payments`,
        data
    );
    return response.data.payload;
};

const sendOrderToKitchen = async (orderId: number): Promise<POSOrder> => {
    const response = await apiClient.post<BaseResponse<POSOrder>>(
        `/api/pos/orders/${orderId}/send-to-kitchen`
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
            queryClient.invalidateQueries({ queryKey: ['pos-order', variables.orderId] });
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
