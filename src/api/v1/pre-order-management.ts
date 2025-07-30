import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse, BaseListRequest } from '.';

// Request Types
export interface AdminCreatePreOrderRequest {
    type: 'dine-in' | 'takeaway';
    branchId: number;
    bookingTableId?: number;
    time: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    paymentType: 'cash' | 'banking';
    notes?: string;
    orderItems: {
        foodCombo: PreOrderItem[];
        productVariant: PreOrderItem[];
        product: PreOrderItem[];
    };
}

export interface PreOrderItem {
    id: number;
    note?: string;
    quantity: number;
}

// Response Types
export interface PreOrderListItem {
    id: number;
    type: 'dine-in' | 'takeaway';
    branchId: number;
    branchName: string;
    bookingTableId?: number;
    tableName?: string;
    time: string;
    customerName: string;
    customerPhone: string;
    notes?: string;
    totalDeposit: number;
    expireTime: string;
    bookingStatus: 'BOOKED' | 'DEPOSIT_PAID' | 'CANCELLED' | 'COMPLETED';
    createdAt: string;
    updatedAt: string;
    totalItems: number;
    totalAmount: number;
}

export interface PreOrderListResponse {
    page: number;
    size: number;
    total: number;
    data: PreOrderListItem[];
}

export interface PreOrderDetailResponse extends PreOrderListItem {
    foodCombos: PreOrderDetailItem[];
    products: PreOrderDetailItem[];
    productVariants: PreOrderDetailItem[];
}

export interface PreOrderDetailItem {
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

export interface AdminCreatePreOrderResponse {
    preOrderId: number;
    type: 'dine-in' | 'takeaway';
    branchId: number;
    bookingTableId?: number;
    time: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    paymentType: 'cash' | 'banking';
    notes?: string;
    bookingStatus: 'BOOKED' | 'DEPOSIT_PAID';
    totalDeposit: number;
    expireTime: string;
    createdAt: string;
    orderItemsSummary: AdminOrderItemSummary[];
    totalItems: number;
    totalAmount: number;
    paymentUrl?: string;
    qrCode?: string;
    orderCode?: number;
    emailSent: boolean;
    message: string;
}

export interface AdminOrderItemSummary {
    itemType: 'foodCombo' | 'product' | 'productVariant';
    itemId: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    note?: string;
}

// API calls
const getPreOrderList = async (
    params: BaseListRequest
): Promise<PreOrderListResponse> => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });

    const response = await apiClient.get<BaseResponse<PreOrderListResponse>>(
        `/booking-table/pre-order?${searchParams.toString()}`
    );
    return response.data.payload;
};

const getPreOrderDetail = async (
    id: number
): Promise<PreOrderDetailResponse> => {
    const response = await apiClient.get<BaseResponse<PreOrderDetailResponse>>(
        `/booking-table/pre-order/${id}`
    );
    return response.data.payload;
};

const adminCreatePreOrder = async (
    request: AdminCreatePreOrderRequest
): Promise<AdminCreatePreOrderResponse> => {
    const response = await apiClient.post<
        BaseResponse<AdminCreatePreOrderResponse>
    >('/booking-table/pre-order/admin/create', request);
    return response.data.payload;
};

// Hooks
export const usePreOrderList = (params: BaseListRequest) => {
    return useQuery({
        queryKey: ['preOrderList', params],
        queryFn: () => getPreOrderList(params),
        staleTime: 30000, // 30 seconds
    });
};

export const usePreOrderDetail = (id: number) => {
    return useQuery({
        queryKey: ['preOrderDetail', id],
        queryFn: () => getPreOrderDetail(id),
        enabled: !!id,
    });
};

export const useAdminCreatePreOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminCreatePreOrder,
        onSuccess: () => {
            // Invalidate pre-order list to refresh data
            queryClient.invalidateQueries({ queryKey: ['preOrderList'] });
        },
    });
};
