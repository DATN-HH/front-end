import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Types
export enum KDSOrderStatus {
    RECEIVED = 'RECEIVED',
    PREPARING = 'PREPARING', 
    READY = 'READY',
    COMPLETED = 'COMPLETED',
}

export enum KDSItemStatus {
    RECEIVED = 'RECEIVED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    SERVED = 'SERVED',
}

export interface KDSOrderItem {
    id: string;
    productId: number;
    productName: string;
    variantId?: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    modifiers?: string[];
    status: KDSItemStatus;
    estimatedTime?: number; // minutes
    startedAt?: string;
    completedAt?: string;
}

export interface KDSOrder {
    id: number;
    orderNumber: string;
    tableId?: number;
    tableName?: string;
    status: KDSOrderStatus;
    items: KDSOrderItem[];
    customerName?: string;
    notes?: string;
    orderTime: string;
    estimatedTime: number; // minutes
    priority: 'normal' | 'urgent';
    staffName?: string;
    branchId: number;
    createdAt: string;
    updatedAt: string;
}

export interface KDSOrdersRequest {
    branchId?: number;
    status?: KDSOrderStatus;
    limit?: number;
    offset?: number;
}

export interface KDSOrderItemUpdateRequest {
    orderId: number;
    itemId: string;
    status: KDSItemStatus;
}

export interface KDSOrderStatusUpdateRequest {
    orderId: number;
    status: KDSOrderStatus;
}

export interface KDSOrderCreateRequest {
    orderNumber: string;
    tableId?: number;
    tableName?: string;
    customerName?: string;
    notes?: string;
    estimatedTime: number;
    priority: 'normal' | 'urgent';
    staffName?: string;
    branchId: number;
    items: {
        id: string;
        productId: number;
        productName: string;
        variantId?: number;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        notes?: string;
        modifiers?: string[];
    }[];
}

export interface KDSBranch {
    id: number;
    name: string;
    address: string;
    activeOrders: number;
    pendingOrders: number;
    staff: number;
    status: 'online' | 'offline';
}

// API calls
const getKDSOrders = async (params: KDSOrdersRequest): Promise<KDSOrder[]> => {
    const response = await apiClient.get<BaseResponse<KDSOrder[]>>(
        '/api/kds/orders',
        { params }
    );
    return response.data.payload;
};

const updateKDSOrderItemStatus = async (
    data: KDSOrderItemUpdateRequest
): Promise<KDSOrder> => {
    const response = await apiClient.put<BaseResponse<KDSOrder>>(
        `/api/kds/orders/${data.orderId}/items/${data.itemId}/status`,
        { status: data.status }
    );
    return response.data.payload;
};

const updateKDSOrderStatus = async (
    data: KDSOrderStatusUpdateRequest
): Promise<KDSOrder> => {
    const response = await apiClient.put<BaseResponse<KDSOrder>>(
        `/api/kds/orders/${data.orderId}/status`,
        { status: data.status }
    );
    return response.data.payload;
};

const getKDSBranches = async (): Promise<KDSBranch[]> => {
    const response = await apiClient.get<BaseResponse<KDSBranch[]>>(
        '/api/kds/branches'
    );
    return response.data.payload;
};

const getKDSOrdersByBranch = async (branchId: number): Promise<KDSOrder[]> => {
    const response = await apiClient.get<BaseResponse<KDSOrder[]>>(
        `/api/kds/branches/${branchId}/orders`
    );
    return response.data.payload;
};

const createKDSOrder = async (data: KDSOrderCreateRequest): Promise<KDSOrder> => {
    const response = await apiClient.post<BaseResponse<KDSOrder>>(
        '/api/kds/orders',
        data
    );
    return response.data.payload;
};

// React Query hooks
export const useKDSOrders = (params: KDSOrdersRequest) => {
    return useQuery({
        queryKey: ['kds-orders', params],
        queryFn: () => getKDSOrders(params),
        refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    });
};

export const useKDSOrdersByBranch = (branchId: number) => {
    return useQuery({
        queryKey: ['kds-orders', 'branch', branchId],
        queryFn: () => getKDSOrdersByBranch(branchId),
        refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
        enabled: !!branchId,
    });
};

export const useKDSBranches = () => {
    return useQuery({
        queryKey: ['kds-branches'],
        queryFn: getKDSBranches,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useUpdateKDSOrderItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateKDSOrderItemStatus,
        onSuccess: (data, variables) => {
            // Invalidate and refetch KDS orders
            queryClient.invalidateQueries({
                queryKey: ['kds-orders'],
            });
            queryClient.invalidateQueries({
                queryKey: ['kds-orders', 'branch', data.branchId],
            });
        },
    });
};

export const useUpdateKDSOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateKDSOrderStatus,
        onSuccess: (data, variables) => {
            // Invalidate and refetch KDS orders
            queryClient.invalidateQueries({
                queryKey: ['kds-orders'],
            });
            queryClient.invalidateQueries({
                queryKey: ['kds-orders', 'branch', data.branchId],
            });
        },
    });
};

export const useCreateKDSOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createKDSOrder,
        onSuccess: (data, variables) => {
            // Invalidate and refetch KDS orders
            queryClient.invalidateQueries({
                queryKey: ['kds-orders'],
            });
            queryClient.invalidateQueries({
                queryKey: ['kds-orders', 'branch', data.branchId],
            });
        },
    });
};
