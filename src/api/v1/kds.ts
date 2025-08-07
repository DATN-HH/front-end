import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

// Types based on new API documentation
export interface KdsItem {
    id: number;
    orderId: number;
    orderNumber: string;
    tableNumbers?: string;
    productId: number;
    productName: string;
    variantId?: number;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    attributeCombination?: string;
    itemStatus:
        | 'RECEIVED'
        | 'SEND_TO_KITCHEN'
        | 'COOKING'
        | 'READY_TO_SERVE'
        | 'COMPLETED';
    orderCreatedAt: string;
    itemCreatedAt: string;
    itemUpdatedAt: string;
    priority?: number;
    estimateTime?: number;
    waitingTimeMinutes: number;
    isCombo: boolean;
    foodComboId?: number;
    comboName?: string;
    comboItems?: KdsComboItem[];
    orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
    customerName?: string;
    customerPhone?: string;
    branchId: number;
    assignedUserId?: number;
    assignedUserName?: string;
}

export interface KdsComboItem {
    productId: number;
    productName: string;
    quantity: number;
    notes?: string;
    estimateTime?: number;
}

export interface KdsStatistics {
    sendToKitchenCount: number;
    cookingCount: number;
    readyToServeCount: number;
    completedTodayCount: number;
    averageWaitingTime: number;
}

export interface ActiveStaffResponse {
    staffId: number;
    fullName: string;
    email: string;
    phoneNumber?: string;
    roles: (
        | 'KITCHEN'
        | 'WAITER'
        | 'HOST'
        | 'CASHIER'
        | 'MANAGER'
        | 'ACCOUNTANT'
        | 'EMPLOYEE'
    )[];
    shiftId: number;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    shiftDate: string;
    assignedUserId: number;
    assignedUserName: string;
    branchId: number;
    branchName: string;
}

export interface ActiveStaffListResponse {
    role:
        | 'KITCHEN'
        | 'WAITER'
        | 'HOST'
        | 'CASHIER'
        | 'MANAGER'
        | 'ACCOUNTANT'
        | 'EMPLOYEE';
    roleName: string;
    staff: ActiveStaffResponse[];
    totalStaff: number;
    branchId: number;
    branchName: string;
}

// Request interfaces
export interface KdsItemsRequest {
    statuses?: string;
    date?: string;
    orderType?: string;
    tableNumber?: string;
    includeCompleted?: boolean;
    limit?: number;
    sortByPriority?: boolean;
}

export interface UpdateStatusRequest {
    itemId: number;
    newStatus: 'COOKING' | 'READY_TO_SERVE' | 'COMPLETED';
    notes?: string;
    assignedUserId?: number;
}

export interface ActiveStaffRequest {
    role:
        | 'KITCHEN'
        | 'WAITER'
        | 'HOST'
        | 'CASHIER'
        | 'MANAGER'
        | 'ACCOUNTANT'
        | 'EMPLOYEE';
}

export interface StatisticsRequest {
    date?: string;
}

// Response interfaces
export interface KdsItemsResponse {
    success: boolean;
    code: number;
    message: string;
    data: {
        items: KdsItem[];
        totalItems: number;
        statistics: KdsStatistics;
    };
}

export interface UpdateStatusResponse {
    success: boolean;
    code: number;
    message: string;
    data: KdsItem;
}

export interface SendToKitchenResponse {
    success: boolean;
    code: number;
    message: string;
    data: KdsItem[];
}

export interface StatisticsResponse {
    success: boolean;
    code: number;
    message: string;
    data: KdsStatistics;
}

// API functions
const getKdsItems = async (
    params: KdsItemsRequest
): Promise<KdsItemsResponse['data']> => {
    const response = await apiClient.get<KdsItemsResponse>('/api/kds/items', {
        params,
    });
    return response.data.data;
};

const updateItemStatus = async (
    data: UpdateStatusRequest
): Promise<KdsItem> => {
    const response = await apiClient.put<UpdateStatusResponse>(
        '/api/kds/items/status',
        data
    );
    return response.data.data;
};

const sendOrderToKitchen = async (orderId: number): Promise<KdsItem[]> => {
    const response = await apiClient.put<SendToKitchenResponse>(
        `/api/kds/orders/${orderId}/send-to-kitchen`
    );
    return response.data.data;
};

const getKdsStatistics = async (
    params: StatisticsRequest
): Promise<KdsStatistics> => {
    const response = await apiClient.get<StatisticsResponse>(
        '/api/kds/statistics',
        { params }
    );
    return response.data.data;
};

const getActiveStaff = async (
    params: ActiveStaffRequest
): Promise<ActiveStaffListResponse> => {
    const response = await apiClient.get<{
        success: boolean;
        code: number;
        message: string;
        data: ActiveStaffListResponse;
    }>('/api/kds/active-staff', { params });
    return response.data.data;
};

// React Query hooks
export const useKdsItems = (params: KdsItemsRequest) => {
    return useQuery({
        queryKey: ['kds-items', params],
        queryFn: () => getKdsItems(params),
        refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    });
};

export const useKdsStatistics = (params: StatisticsRequest = {}) => {
    return useQuery({
        queryKey: ['kds-statistics', params],
        queryFn: () => getKdsStatistics(params),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

export const useActiveStaff = (role: ActiveStaffRequest['role']) => {
    return useQuery({
        queryKey: ['active-staff', role],
        queryFn: () => getActiveStaff({ role }),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useUpdateItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateItemStatus,
        onSuccess: () => {
            // Invalidate and refetch KDS items
            queryClient.invalidateQueries({ queryKey: ['kds-items'] });
            queryClient.invalidateQueries({ queryKey: ['kds-statistics'] });
        },
    });
};

export const useSendOrderToKitchen = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sendOrderToKitchen,
        onSuccess: () => {
            // Invalidate and refetch KDS items and POS orders
            queryClient.invalidateQueries({ queryKey: ['kds-items'] });
            queryClient.invalidateQueries({ queryKey: ['kds-statistics'] });
            queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
        },
    });
};
