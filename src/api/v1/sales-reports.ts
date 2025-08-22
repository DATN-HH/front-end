import { useQuery } from '@tanstack/react-query';
import qs from 'qs';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Types for Sales Reports API
export interface SalesReportOrder {
    id: number;
    orderNumber: string;
    orderStatus: 'DRAFT' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'ORDERED';
    orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
    paymentType: 'CASH' | 'BANKING' | 'CARD' | 'MOMO' | 'ZALOPAY' | 'VNPAY';
    total: number;
    deposit: number;
    customerName: string;
    customerPhone: string;
    posCreatedAt: string;
    notes: string | null;
    branchId: number;
}

export interface SalesReportOrdersRequest {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    startDate?: string;
    endDate?: string;
    paymentType?: 'CASH' | 'BANKING' | 'CARD' | 'MOMO' | 'ZALOPAY' | 'VNPAY';
    orderType?: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
    orderStatus?: 'DRAFT' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'ORDERED';
    branchId?: number;
    customerPhone?: string;
    customerName?: string;
}

export interface SalesReportOrdersResponse {
    content: SalesReportOrder[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            empty: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        empty: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

// API calls
const getSalesReportOrders = async (
    params: SalesReportOrdersRequest = {}
): Promise<SalesReportOrdersResponse> => {
    const response = await apiClient.get<SalesReportOrdersResponse>(
        '/api/sales-reports/orders',
        {
            params,
            paramsSerializer: (params) =>
                qs.stringify(params, {
                    encode: true,
                    arrayFormat: 'indices',
                }),
        }
    );
    return response.data;
};

// Additional API Types for other endpoints

// Sales Statistics Types
export interface SalesStatisticsRequest {
    startDate: string;
    endDate: string;
    timePeriod?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    orderType?: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
    paymentType?: 'CASH' | 'BANKING' | 'CARD' | 'MOMO' | 'ZALOPAY' | 'VNPAY';
    branchId?: number;
}

export interface TimeSeriesData {
    period: string;
    revenue: number;
    deposits: number;
    orderCount: number;
    averageOrderValue: number;
}

export interface PaymentTypeStats {
    paymentType: string;
    totalAmount: number;
    orderCount: number;
    percentage: number;
}

export interface OrderTypeStats {
    orderType: string;
    totalAmount: number;
    orderCount: number;
    percentage: number;
}

export interface SalesStatisticsResponse {
    startDate: string;
    endDate: string;
    timePeriod: string;
    totalRevenue: number;
    totalDeposits: number;
    actualRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    timeSeriesData: TimeSeriesData[];
    paymentTypeStats: PaymentTypeStats[];
    orderTypeStats: OrderTypeStats[];
}

// Product Statistics Types
export interface TopSellingProduct {
    productId: number;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
    averagePrice: number;
    revenuePercentage: number;
    isCombo: boolean;
    comboId: number | null;
    comboName: string | null;
}

export interface ProductStatisticsResponse {
    startDate: string;
    endDate: string;
    timePeriod: string;
    totalItemsSold: number;
    totalItemRevenue: number;
    uniqueProductCount: number;
    timeSeriesData: Array<{
        period: string;
        totalQuantity: number;
        totalRevenue: number;
        uniqueProducts: number;
    }>;
    topSellingProducts: TopSellingProduct[];
}

// Order Metrics Types
export interface OrderTypeMetrics {
    orderType: string;
    orderCount: number;
    totalRevenue: number;
    averageOrderValue: number;
    orderPercentage: number;
    revenuePercentage: number;
}

export interface OrderMetricsResponse {
    startDate: string;
    endDate: string;
    timePeriod: string;
    totalOrders: number;
    averageOrderValue: number;
    medianOrderValue: number;
    totalRevenue: number;
    orderTypeMetrics: OrderTypeMetrics[];
    timeSeriesData: Array<{
        period: string;
        totalOrders: number;
        averageOrderValue: number;
        totalRevenue: number;
        dineInOrders: number;
        takeoutOrders: number;
        deliveryOrders: number;
    }>;
}

// Order Status Statistics Types
export interface StatusBreakdown {
    orderStatus: string;
    orderCount: number;
    percentage: number;
    description: string;
}

export interface OrderStatusStatisticsResponse {
    startDate: string;
    endDate: string;
    timePeriod: string;
    totalOrders: number;
    statusBreakdown: StatusBreakdown[];
    timeSeriesData: Array<{
        period: string;
        totalOrders: number;
        draftOrders: number;
        preparingOrders: number;
        readyOrders: number;
        completedOrders: number;
        cancelledOrders: number;
    }>;
}

// Peak Hours Statistics Types
export interface HourlyData {
    hour: number;
    hourLabel: string;
    orderCount: number;
    percentage: number;
    isPeakHour: boolean;
}

export interface PeakHoursStatisticsResponse {
    startDate: string;
    endDate: string;
    timePeriod: string;
    totalOrders: number;
    peakHour: number;
    peakHourOrderCount: number;
    hourlyData: HourlyData[];
    dailyData: Array<{
        date: string;
        dayOfWeek: string;
        totalOrders: number;
        peakHour: number;
        peakHourOrderCount: number;
        hourlyBreakdown: HourlyData[];
    }>;
}

// Additional API calls
const getSalesStatistics = async (
    params: SalesStatisticsRequest
): Promise<SalesStatisticsResponse> => {
    const response = await apiClient.get<SalesStatisticsResponse>(
        '/api/sales-reports/sales-statistics',
        {
            params,
            paramsSerializer: (params) =>
                qs.stringify(params, {
                    encode: true,
                    arrayFormat: 'indices',
                }),
        }
    );
    return response.data;
};

const getProductStatistics = async (
    params: SalesStatisticsRequest
): Promise<ProductStatisticsResponse> => {
    const response = await apiClient.get<ProductStatisticsResponse>(
        '/api/sales-reports/product-statistics',
        {
            params,
            paramsSerializer: (params) =>
                qs.stringify(params, {
                    encode: true,
                    arrayFormat: 'indices',
                }),
        }
    );
    return response.data;
};

const getOrderMetrics = async (
    params: SalesStatisticsRequest
): Promise<OrderMetricsResponse> => {
    const response = await apiClient.get<OrderMetricsResponse>(
        '/api/sales-reports/order-metrics',
        {
            params,
            paramsSerializer: (params) =>
                qs.stringify(params, {
                    encode: true,
                    arrayFormat: 'indices',
                }),
        }
    );
    return response.data;
};

const getOrderStatusStatistics = async (
    params: SalesStatisticsRequest
): Promise<OrderStatusStatisticsResponse> => {
    const response = await apiClient.get<OrderStatusStatisticsResponse>(
        '/api/sales-reports/order-status-statistics',
        {
            params,
            paramsSerializer: (params) =>
                qs.stringify(params, {
                    encode: true,
                    arrayFormat: 'indices',
                }),
        }
    );
    return response.data;
};

const getPeakHoursStatistics = async (
    params: SalesStatisticsRequest
): Promise<PeakHoursStatisticsResponse> => {
    const response = await apiClient.get<PeakHoursStatisticsResponse>(
        '/api/sales-reports/peak-hours-statistics',
        {
            params,
            paramsSerializer: (params) =>
                qs.stringify(params, {
                    encode: true,
                    arrayFormat: 'indices',
                }),
        }
    );
    return response.data;
};

// React Query Hooks
export const useSalesReportOrders = (params: SalesReportOrdersRequest) => {
    return useQuery({
        queryKey: ['sales-report-orders', params],
        queryFn: () => getSalesReportOrders(params),
        staleTime: 30000, // 30 seconds
    });
};

export const useSalesStatistics = (params: SalesStatisticsRequest) => {
    return useQuery({
        queryKey: ['sales-statistics', params],
        queryFn: () => getSalesStatistics(params),
        staleTime: 30000, // 30 seconds
        enabled: !!params.startDate && !!params.endDate,
    });
};

export const useProductStatistics = (params: SalesStatisticsRequest) => {
    return useQuery({
        queryKey: ['product-statistics', params],
        queryFn: () => getProductStatistics(params),
        staleTime: 30000, // 30 seconds
        enabled: !!params.startDate && !!params.endDate,
    });
};

export const useOrderMetrics = (params: SalesStatisticsRequest) => {
    return useQuery({
        queryKey: ['order-metrics', params],
        queryFn: () => getOrderMetrics(params),
        staleTime: 30000, // 30 seconds
        enabled: !!params.startDate && !!params.endDate,
    });
};

export const useOrderStatusStatistics = (params: SalesStatisticsRequest) => {
    return useQuery({
        queryKey: ['order-status-statistics', params],
        queryFn: () => getOrderStatusStatistics(params),
        staleTime: 30000, // 30 seconds
        enabled: !!params.startDate && !!params.endDate,
    });
};

export const usePeakHoursStatistics = (params: SalesStatisticsRequest) => {
    return useQuery({
        queryKey: ['peak-hours-statistics', params],
        queryFn: () => getPeakHoursStatistics(params),
        staleTime: 30000, // 30 seconds
        enabled: !!params.startDate && !!params.endDate,
    });
};
