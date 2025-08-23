import { apiClient } from '@/services/api-client';

// Types for delivery order
export interface CreateDeliveryOrderRequest {
    foodCombo: {
        id: number;
        tempId: string;
        note: string;
        quantity: number;
    }[];
    productVariant: {
        id: number;
        tempId: string;
        note: string;
        quantity: number;
    }[];
    product: {
        id: number;
        tempId: string;
        note: string;
        quantity: number;
    }[];
    address: string;
    branchId: number;
    note: string;
    phone: string;
    name: string;
}

export interface DeliveryOrderItem {
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes: string;
    itemStatus: string;
    isCombo: boolean;
    foodComboId?: number;
    comboName?: string;
}

export interface DeliveryOrder {
    id: number;
    orderNumber: string;
    orderStatus: string;
    orderType: string;
    branchId: number;
    subtotal: number;
    tax: number;
    total: number;
    shippingFee: number;
    address: string;
    customerName: string;
    customerPhone: string;
    notes: string;
    items: DeliveryOrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateDeliveryOrderResponse {
    success: boolean;
    message: string;
    data: DeliveryOrder;
}

export interface PaymentLinkData {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: number;
    currency: string;
    paymentLinkId: string;
    status: string;
    checkoutUrl: string;
    qrCode: string;
}

export interface CreatePaymentLinkResponse {
    success: boolean;
    code: number;
    message: string;
    payload: PaymentLinkData;
}

export interface OrderStatus {
    id: number;
    orderNumber: string;
    orderStatus: string;
    orderType: string;
}

export interface OrderStatusResponse {
    success: boolean;
    message: string;
    data: OrderStatus;
}

// API functions
export const createDeliveryOrder = async (
    request: CreateDeliveryOrderRequest
): Promise<CreateDeliveryOrderResponse> => {
    const response = await apiClient.post<CreateDeliveryOrderResponse>(
        '/api/pos/orders/create-delivery',
        request
    );
    return response.data;
};

export const createPaymentLink = async (
    orderId: number
): Promise<CreatePaymentLinkResponse> => {
    const response = await apiClient.post<CreatePaymentLinkResponse>(
        `/payment/create-payment-link-for-delivery/${orderId}`
    );
    return response.data;
};

export const checkOrderStatus = async (
    orderId: number
): Promise<OrderStatusResponse> => {
    const response = await apiClient.get<OrderStatusResponse>(
        `/api/pos/orders/${orderId}/status`
    );
    return response.data;
};
