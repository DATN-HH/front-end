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
    comboName?: string;
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
    tables?: POSOrderTable[]; // New field from API response
    status: POSOrderStatus;
    orderStatus?: string; // New field from API response
    orderType?: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY'; // New field from API response
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

// New interface for create-or-update API v2
export interface POSOrderCreateOrUpdateRequest {
    orderId?: number; // Optional: for updating existing order
    items: {
        orderItemId?: number | null; // Optional: for updating specific existing items (renamed from posOrderItemId)
        productId?: number; // Required if product item
        variantId?: number | null; // Required if variant item
        comboId?: number | null; // Required if combo item
        quantity: number; // Required: positive integer
        notes?: string; // Optional: item notes
        attributeCombination?: string; // Optional: variant display
    }[];
    tableIds?: number[]; // Optional: list of table IDs (can be empty for takeout)
    customerName?: string; // Optional: customer information
    customerPhone?: string; // Optional: customer phone
    notes?: string; // Optional: order notes
    orderType?: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY'; // Optional: DINE_IN (default), TAKEOUT, DELIVERY
}

export interface POSOrderTable {
    id: number;
    tableId: number;
    tableName: string;
    isPrimary: boolean;
    notes: string | null;
}

export interface POSOrderCreateOrUpdateResponse {
    id: number;
    orderNumber: string;
    tables: POSOrderTable[];
    status: string;
    orderStatus: string;
    orderType: string;
    items: {
        id: number;
        productId: number | null;
        productName: string | null;
        variantId: number | null;
        variantName: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        notes: string | null;
        attributeCombination: string | null;
        itemStatus: string;
        isCombo: boolean;
        foodComboId: number | null;
        comboName: string | null;
        promotionPrice: number | null;
    }[];
    subtotal: number;
    tax: number;
    total: number;
    customerName: string | null;
    customerPhone: string | null;
    notes: string | null;
    payments: any[];
    createdAt: string;
    updatedAt: string | null;
    createdBy: string;
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

const getPOSOrders = async (
    status?: POSOrderStatus,
    orderType?: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY'
): Promise<POSOrder[]> => {
    const params: any = {};
    if (status) params.orderStatus = status;
    if (orderType) params.orderType = orderType;

    const response = await apiClient.get<POSApiResponse<POSOrder[]>>(
        '/api/pos/orders',
        { params }
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

// Create or Update POS Order API function
const createOrUpdatePOSOrder = async (
    data: POSOrderCreateOrUpdateRequest
): Promise<POSOrderCreateOrUpdateResponse> => {
    const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: POSOrderCreateOrUpdateResponse;
    }>('/api/pos/orders/create-or-update', data);

    if (!response.data.success) {
        throw new Error(
            response.data.message || 'Failed to create/update order'
        );
    }

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

export const usePOSOrders = (
    status?: POSOrderStatus,
    orderType?: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY'
) => {
    return useQuery({
        queryKey: ['pos-orders', status, orderType],
        queryFn: () => getPOSOrders(status, orderType),
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

export const useCreateOrUpdatePOSOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrUpdatePOSOrder,
        onSuccess: (data) => {
            // Invalidate orders queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['pos-order', data.id] });
            queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
        },
    });
};
