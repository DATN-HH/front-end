import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { TableShape } from './tables';

import { BaseResponse } from '.';

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

// API Functions
export const tableStatusService = {
  // Get floor tables status
  async getFloorTablesStatus(
    request: FloorTablesRequest
  ): Promise<BaseResponse<FloorTablesResponse>> {
    try {
      const response = await apiClient.post('/table-status/floor', request);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch floor tables status'
      );
    }
  },
};

// // React Query Hooks
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
