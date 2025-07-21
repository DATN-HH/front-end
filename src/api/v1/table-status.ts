import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { TableShape } from './tables';

// Enums
export enum TableStatus {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    NEEDS_CLEANING = 'NEEDS_CLEANING',
}

export interface FloorTablesRequest {
    floorId: number;
    dateTime: string;
    duration: number; // Duration in hours (1-24)
}

export interface AvailableTable {
    tableId: number;
    tableName: string;
    capacity: number;
    tableShape: TableShape;
    tableType: string;
    currentStatus: TableStatus;
    statusMessage: string;
    xRatio: number; // 0.0 - 1.0 for positioning
    yRatio: number; // 0.0 - 1.0 for positioning
    widthRatio: number; // 0.0 - 1.0 for sizing
    heightRatio: number; // 0.0 - 1.0 for sizing
    estimatedAvailableTime?: string; // ISO datetime string
}

export interface FloorTablesResponse {
    floorId: number;
    floorName: string;
    requestedDateTime: string;
    requestedDurationHours: number; // NEW FIELD from API v2.0
    totalTables: number;
    availableTablesCount: number;
    occupiedTablesCount: number;
    cleaningTablesCount: number;
    availabilityPercentage: number;
    availableTablesList: AvailableTable[];
}

export interface ApiResponse<T> {
    success: boolean;
    code: number;
    message: string;
    payload: T;
    error?: {
        code: number;
        message: string;
        details?: any;
    };
}

// API Functions
export const tableStatusService = {
    //   // Get single table status
    //   async getTableStatus(request: TableStatusRequest): Promise<ApiResponse<TableStatusResponse>> {
    //     try {
    //       const response = await apiClient.post('/table-status/table', request);
    //       return response.data;
    //     } catch (error: any) {
    //       throw new Error(error.response?.data?.message || 'Failed to fetch table status');
    //     }
    //   },

    // Get floor tables status
    async getFloorTablesStatus(
        request: FloorTablesRequest
    ): Promise<ApiResponse<FloorTablesResponse>> {
        try {
            const response = await apiClient.post(
                '/table-status/floor',
                request
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message ||
                    'Failed to fetch floor tables status'
            );
        }
    },

    // GET alternatives (easier for testing) - DISABLED due to API v2.0 changes
    // async getTableStatusGet(tableId: number, dateTime: string): Promise<ApiResponse<TableStatusResponse>> {
    //   try {
    //     const response = await apiClient.get(`/table-status/table/${tableId}`, {
    //       params: { dateTime }
    //     });
    //     return response.data;
    //   } catch (error: any) {
    //     throw new Error(error.response?.data?.message || 'Failed to fetch table status');
    //   }
    // },

    async getFloorTablesStatusGet(
        floorId: number,
        dateTime: string,
        duration: number
    ): Promise<ApiResponse<FloorTablesResponse>> {
        try {
            const response = await apiClient.get(
                `/table-status/floor/${floorId}`,
                {
                    params: { dateTime, duration },
                }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message ||
                    'Failed to fetch floor tables status'
            );
        }
    },
};

// // React Query Hooks
// export function useTableStatus(tableId: number, dateTime: string, enabled: boolean = true) {
//   return useQuery({
//     queryKey: ['table-status', tableId, dateTime],
//     queryFn: () => tableStatusService.getTableStatus({ tableId, dateTime }),
//     enabled: enabled && !!tableId && !!dateTime,
//     staleTime: 5000, // 5 seconds - data is fresh for 5 seconds
//     refetchInterval: 5000, // Refetch every 5 seconds
//     refetchIntervalInBackground: false, // Only poll when tab is active
//   });
// }

export function useFloorTablesStatus(
    floorId: number,
    dateTime: string,
    duration: number,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: ['floor-tables-status', floorId, dateTime, duration],
        queryFn: () =>
            tableStatusService.getFloorTablesStatus({
                floorId,
                dateTime,
                duration,
            }),
        enabled: enabled && !!floorId && !!dateTime && !!duration,
        staleTime: 5000, // 5 seconds - data is fresh for 5 seconds
        refetchInterval: 5000, // Refetch every 5 seconds
        refetchIntervalInBackground: false, // Only poll when tab is active
    });
}

// Utility Functions
export const formatDateTime = (date: Date): string => {
    return date.toISOString().slice(0, 19); // "2024-07-16T14:30:00"
};

export const parseDateTime = (dateTimeString: string): Date => {
    return new Date(dateTimeString);
};

export const getStatusColor = (status: TableStatus): string => {
    switch (status) {
        case TableStatus.AVAILABLE:
            return '#28a745'; // Green
        case TableStatus.OCCUPIED:
            return '#dc3545'; // Red
        case TableStatus.NEEDS_CLEANING:
            return '#ffc107'; // Yellow
        default:
            return '#6c757d'; // Gray
    }
};

export const getStatusLabel = (status: TableStatus): string => {
    switch (status) {
        case TableStatus.AVAILABLE:
            return 'Available';
        case TableStatus.OCCUPIED:
            return 'Occupied';
        case TableStatus.NEEDS_CLEANING:
            return 'Needs Cleaning';
        default:
            return 'Unknown';
    }
};
