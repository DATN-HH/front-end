import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

// Types
export interface PreOrderItem {
    productName: string;
    quantity: number;
    price: number;
    note?: string;
    type: 'PRODUCT' | 'VARIANT' | 'COMBO';
}

export interface PreOrderListResponse {
    id: number;
    type: 'dine-in' | 'takeaway';
    branchId: number;
    time: string;
    customerName: string;
    customerPhone: string;
    notes?: string;
    totalDeposit: number;
    bookingStatus:
        | 'PENDING'
        | 'BOOKED'
        | 'DEPOSIT_PAID'
        | 'CANCELLED'
        | 'COMPLETED';
    createdAt: string;
    items: PreOrderItem[];
}

export interface PreOrderToPosResponse {
    posOrderId: number;
    orderNumber: string;
    preOrderId: number;
    orderType: 'DINE_IN' | 'TAKEOUT';
    totalAmount: number;
    deposit: number;
    remainingAmount: number;
    message: string;
}

export interface MyOrder {
    id: number;
    orderNumber: string;
    createdAt: string;
    orderStatus:
        | 'DRAFT'
        | 'ORDERED'
        | 'PREPARING'
        | 'READY'
        | 'COMPLETED'
        | 'CANCELLED';
    orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
    branchId: number;
    totalAmount: number;
    deposit: number;
    customerName: string;
    customerPhone: string;
    notes?: string;
}

export interface MyOrderListResponse {
    orders: MyOrder[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
}

export interface OrderCancelResponse {
    orderId: number;
    orderNumber: string;
    status: 'CANCELLED';
    message: string;
}

// API Service
class PreOrderPosService {
    private baseURL = '/api/preorder-pos';
    private customerURL = '/api/pos-order/customer';

    // Get branch preorders
    async getBranchPreOrders(
        branchId: number
    ): Promise<PreOrderListResponse[]> {
        const response = await apiClient.get(
            `${this.baseURL}/branch/${branchId}/preorders`
        );

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(
            response.data.message || 'Failed to get branch preorders'
        );
    }

    // Convert preorder to POS order
    async convertPreOrderToPosOrder(
        preOrderId: number
    ): Promise<PreOrderToPosResponse> {
        const response = await apiClient.post(
            `${this.baseURL}/preorder/${preOrderId}/convert-to-pos`
        );

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(
            response.data.message || 'Failed to convert preorder to POS order'
        );
    }

    // Get customer orders
    async getCustomerOrders(
        phoneNumber: string,
        page: number = 0,
        size: number = 10
    ): Promise<MyOrderListResponse> {
        const response = await apiClient.get(`${this.customerURL}/my-orders`, {
            params: { phoneNumber, page, size },
        });

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(
            response.data.message || 'Failed to get customer orders'
        );
    }

    // Cancel order
    async cancelOrder(orderId: number): Promise<OrderCancelResponse> {
        const response = await apiClient.put(
            `${this.customerURL}/order/${orderId}/cancel`
        );

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to cancel order');
    }
}

const preOrderPosService = new PreOrderPosService();

// React Query hooks
export const useBranchPreOrders = (branchId: number | null) => {
    return useQuery({
        queryKey: ['branch-preorders', branchId],
        queryFn: () => preOrderPosService.getBranchPreOrders(branchId!),
        enabled: !!branchId,
    });
};

export const useConvertPreOrderToPos = () => {
    return useMutation({
        mutationFn: (preOrderId: number) =>
            preOrderPosService.convertPreOrderToPosOrder(preOrderId),
    });
};

export const useCustomerOrders = (
    phoneNumber: string | null,
    page: number = 0,
    size: number = 10
) => {
    return useQuery({
        queryKey: ['customer-orders', phoneNumber, page, size],
        queryFn: () =>
            preOrderPosService.getCustomerOrders(phoneNumber!, page, size),
        enabled: !!phoneNumber,
    });
};

export const useCancelOrder = () => {
    return useMutation({
        mutationFn: (orderId: number) =>
            preOrderPosService.cancelOrder(orderId),
    });
};

// Utility functions
export const formatOrderType = (type: string): string => {
    switch (type) {
        case 'dine-in':
        case 'DINE_IN':
            return 'Dine In';
        case 'takeaway':
        case 'TAKEOUT':
            return 'Takeaway';
        case 'DELIVERY':
            return 'Delivery';
        default:
            return type;
    }
};

export const formatOrderStatus = (status: string): string => {
    switch (status) {
        case 'DRAFT':
            return 'Draft';
        case 'ORDERED':
            return 'Ordered';
        case 'PREPARING':
            return 'Preparing';
        case 'READY':
            return 'Ready';
        case 'COMPLETED':
            return 'Completed';
        case 'CANCELLED':
            return 'Cancelled';
        default:
            return status;
    }
};

export const getOrderStatusColor = (status: string): string => {
    switch (status) {
        case 'DRAFT':
            return 'bg-gray-100 text-gray-800';
        case 'ORDERED':
            return 'bg-blue-100 text-blue-800';
        case 'PREPARING':
            return 'bg-yellow-100 text-yellow-800';
        case 'READY':
            return 'bg-green-100 text-green-800';
        case 'COMPLETED':
            return 'bg-green-100 text-green-800';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};
