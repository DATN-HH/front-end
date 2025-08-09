import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Enums
export enum POSTableStatus {
    AVAILABLE = 'AVAILABLE',
    OCCUPIED = 'OCCUPIED',
    OCCUPIED_BY_ORDER = 'OCCUPIED_BY_ORDER',
    OCCUPIED_BY_BOOKING = 'OCCUPIED_BY_BOOKING',
    UPCOMING_BOOKING = 'UPCOMING_BOOKING',
}

export enum OccupancyType {
    POS_ORDER = 'POS_ORDER',
    BOOKING_TABLE = 'BOOKING_TABLE',
    UPCOMING_BOOKING = 'UPCOMING_BOOKING',
}

// Request Types
export interface POSTableStatusRequest {
    floorId: number;
}

// Response Types
export interface POSTableInfo {
    tableId: number;
    tableName: string;
    capacity: number;
    xratio: number;
    yratio: number;
    widthRatio: number;
    heightRatio: number;
    tableShape: 'RECTANGLE' | 'CIRCLE' | 'SQUARE' | 'ROUND';
    tableTypeId: number;
    tableTypeName: string;
    currentStatus: POSTableStatus;
    estimatedAvailableTime?: string;
}

export interface POSTableStatusResponse {
    floorId: number;
    floorName: string;
    checkTime: string;
    durationHours: number;
    totalTables: number;
    availableTablesCount: number;
    occupiedTablesCount: number;
    availabilityPercentage: number;
    tables: POSTableInfo[];
}

export interface OccupancyDetails {
    occupationType: OccupancyType;
    orderId?: number;
    orderNumber?: string;
    bookingId?: number;
    customerName: string;
    customerPhone: string;
    startTime: string;
    estimatedEndTime?: string;
    endTime?: string;
    orderStatus?: string;
    bookingStatus?: string;
    notes?: string;
}

export interface POSTableOccupancyInfo extends POSTableInfo {
    occupancyDetails?: OccupancyDetails;
}

export interface POSTableOccupancyResponse {
    floorId: number;
    floorName: string;
    checkTime: string;
    tables: POSTableOccupancyInfo[];
}

// API Functions
export const posTableStatusService = {
    // Check table status for POS operations
    async checkTableStatus(
        request: POSTableStatusRequest
    ): Promise<BaseResponse<POSTableStatusResponse>> {
        try {
            const response = await apiClient.post(
                '/pos/table-status/check',
                request
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message ||
                    'Failed to check POS table status'
            );
        }
    },

    // Get detailed table occupancy information
    async getTableOccupancy(
        request: POSTableStatusRequest
    ): Promise<BaseResponse<POSTableOccupancyResponse>> {
        try {
            const response = await apiClient.post(
                '/pos/table-status/occupancy',
                request
            );
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message ||
                    'Failed to get table occupancy information'
            );
        }
    },
};

// React Query Hooks
export function usePOSTableStatus(floorId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['pos-table-status', floorId],
        queryFn: () => posTableStatusService.checkTableStatus({ floorId }),
        enabled: enabled && !!floorId,
        staleTime: 3000, // 3 seconds - data is fresh for 3 seconds
        refetchInterval: 5000, // Refetch every 5 seconds
        refetchIntervalInBackground: false, // Only poll when tab is active
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

export function usePOSTableOccupancy(floorId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['pos-table-occupancy', floorId],
        queryFn: () => posTableStatusService.getTableOccupancy({ floorId }),
        enabled: enabled && !!floorId,
        staleTime: 3000, // 3 seconds - data is fresh for 3 seconds
        refetchInterval: 5000, // Refetch every 5 seconds
        refetchIntervalInBackground: false, // Only poll when tab is active
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Helper functions
export function isTableAvailable(status: POSTableStatus): boolean {
    return status === POSTableStatus.AVAILABLE;
}

export function isTableOccupied(status: POSTableStatus): boolean {
    return [
        POSTableStatus.OCCUPIED,
        POSTableStatus.OCCUPIED_BY_ORDER,
        POSTableStatus.OCCUPIED_BY_BOOKING,
    ].includes(status);
}

export function shouldDisableTable(status: POSTableStatus): boolean {
    return [
        POSTableStatus.OCCUPIED,
        POSTableStatus.OCCUPIED_BY_ORDER,
        POSTableStatus.OCCUPIED_BY_BOOKING,
        POSTableStatus.UPCOMING_BOOKING,
    ].includes(status);
}

export function getTableStatusColor(status: POSTableStatus): string {
    switch (status) {
        case POSTableStatus.AVAILABLE:
            return '#10b981'; // green-500
        case POSTableStatus.OCCUPIED:
        case POSTableStatus.OCCUPIED_BY_ORDER:
            return '#ef4444'; // red-500
        case POSTableStatus.OCCUPIED_BY_BOOKING:
            return '#f59e0b'; // amber-500
        case POSTableStatus.UPCOMING_BOOKING:
            return '#3b82f6'; // blue-500
        default:
            return '#6b7280'; // gray-500
    }
}

export function getTableStatusText(status: POSTableStatus): string {
    switch (status) {
        case POSTableStatus.AVAILABLE:
            return 'Available';
        case POSTableStatus.OCCUPIED:
            return 'Occupied';
        case POSTableStatus.OCCUPIED_BY_ORDER:
            return 'Occupied by Order';
        case POSTableStatus.OCCUPIED_BY_BOOKING:
            return 'Occupied by Booking';
        case POSTableStatus.UPCOMING_BOOKING:
            return 'Upcoming Booking';
        default:
            return 'Unknown';
    }
}

export function getOccupancyTypeText(type: OccupancyType): string {
    switch (type) {
        case OccupancyType.POS_ORDER:
            return 'POS Order';
        case OccupancyType.BOOKING_TABLE:
            return 'Table Booking';
        case OccupancyType.UPCOMING_BOOKING:
            return 'Upcoming Booking';
        default:
            return 'Unknown';
    }
}
