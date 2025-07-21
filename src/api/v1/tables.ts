import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import { apiClient } from '@/services/api-client';

import { TableTypeResponse } from './table-types';

import { BaseResponse } from '.';

// Enums

export enum TableShape {
  SQUARE = 'SQUARE',
  ROUND = 'ROUND',
  RECTANGLE = 'RECTANGLE',
  OVAL = 'OVAL',
}

// Legacy enum for backward compatibility

export enum TableType {
  STANDARD = 'STANDARD',
  VIP = 'VIP',
  OUTDOOR = 'OUTDOOR',
  PRIVATE = 'PRIVATE',
  COUPLE = 'COUPLE',
  FAMILY = 'FAMILY',
  BUSINESS = 'BUSINESS',
  SMOKING = 'SMOKING',
  NON_SMOKING = 'NON_SMOKING',
  WHEELCHAIR_ACCESSIBLE = 'WHEELCHAIR_ACCESSIBLE',
}

// Updated Interfaces
export interface TableCreateRequest {
  tableName: string;
  capacity: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  tableShape: TableShape;
  tableTypeId: number; // Changed from tableType enum to tableTypeId
  floorId: number;
}

export interface TableUpdateRequest {
  tableName: string;
  capacity: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  tableShape: TableShape;
  tableTypeId: number; // Changed from tableType enum to tableTypeId
}

export interface TableResponse {
  id: number;
  tableName: string;
  capacity: number;
  xRatio: number | null;
  yRatio: number | null;
  xratio: number; // API returns lowercase
  yratio: number; // API returns lowercase
  widthRatio: number;
  heightRatio: number;
  tableShape: TableShape;
  tableType: TableTypeResponse; // Changed from TableType enum to TableTypeResponse object
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  createdUsername: string;
  updatedUsername: string;
  floor?: {
    id: number;
    name: string;
    imageUrl: string;
    order: number;
  } | null;
}

export interface FloorTablesResponse {
  floor: {
    id: number;
    name: string;
    imageUrl: string;
    order: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy: number;
    updatedBy: number;
    createdUsername: string;
    updatedUsername: string;
    branch?: {
      id: number;
      name: string;
      address: string;
      phone: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      createdBy: number;
      updatedBy: number;
      createdUsername: string;
      updatedUsername: string;
      manager?: {
        id: number;
        fullName: string;
        email: string;
      };
    };
  };
  tables: TableResponse[];
}

// API Functions
const createTable = async (
  data: TableCreateRequest
): Promise<TableResponse> => {
  const response = await apiClient.post<BaseResponse<TableResponse>>(
    '/tables',
    data
  );
  return response.data.payload!;
};

const updateTable = async (
  id: number,
  data: TableUpdateRequest
): Promise<TableResponse> => {
  const response = await apiClient.put<BaseResponse<TableResponse>>(
    `/tables/${id}`,
    data
  );
  return response.data.payload!;
};

const getTablesByFloor = async (
  floorId: number
): Promise<FloorTablesResponse> => {
  const response = await apiClient.get<BaseResponse<FloorTablesResponse>>(
    `/tables/floors/${floorId}`
  );
  const data = response.data.payload!;

  // Normalize table data
  return {
    ...data,
    tables: data.tables.map(normalizeTableData),
  };
};

const deleteTable = async (id: number): Promise<void> => {
  await apiClient.delete(`/tables/${id}`);
};

// React Query Hooks
export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTable,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['tables', 'floor', data.floor?.id],
      });
    },
  });
};

export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TableUpdateRequest }) =>
      updateTable(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['tables', 'floor', data.floor?.id],
      });
    },
  });
};

export const useTablesByFloor = (floorId: number) => {
  return useQuery({
    queryKey: ['tables', 'floor', floorId],
    queryFn: () => getTablesByFloor(floorId),
    enabled: !!floorId,
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
};

// Updated utility functions to work with TableTypeResponse object
export const getTableColor = (
  tableType: TableTypeResponse | TableType
): string => {
  if (typeof tableType === 'object' && tableType.color) {
    return tableType.color;
  }

  // Legacy fallback for old enum values
  switch (tableType) {
    case TableType.VIP:
      return '#fbbf24'; // amber
    case TableType.PRIVATE:
      return '#8b5cf6'; // violet
    case TableType.COUPLE:
      return '#f472b6'; // pink
    case TableType.FAMILY:
      return '#10b981'; // emerald
    case TableType.BUSINESS:
      return '#3b82f6'; // blue
    case TableType.OUTDOOR:
      return '#059669'; // green
    case TableType.SMOKING:
      return '#ef4444'; // red
    case TableType.NON_SMOKING:
      return '#6b7280'; // gray
    case TableType.WHEELCHAIR_ACCESSIBLE:
      return '#14b8a6'; // teal
    default:
      return '#6b7280'; // gray for standard
  }
};

export const getTableTypeLabel = (
  tableType: TableTypeResponse | TableType
): string => {
  if (typeof tableType === 'object' && tableType.tableType) {
    return tableType.tableType;
  }

  // Legacy fallback for old enum values
  switch (tableType) {
    case TableType.STANDARD:
      return 'Standard';
    case TableType.VIP:
      return 'VIP';
    case TableType.OUTDOOR:
      return 'Outdoor';
    case TableType.PRIVATE:
      return 'Private';
    case TableType.COUPLE:
      return 'Couple';
    case TableType.FAMILY:
      return 'Family';
    case TableType.BUSINESS:
      return 'Business';
    case TableType.SMOKING:
      return 'Smoking';
    case TableType.NON_SMOKING:
      return 'Non-Smoking';
    case TableType.WHEELCHAIR_ACCESSIBLE:
      return 'Wheelchair Accessible';
    default:
      return typeof tableType === 'string' ? tableType : 'Unknown';
  }
};

export const getTableIcon = (
  tableType: TableTypeResponse | TableType
): string => {
  if (typeof tableType === 'object' && tableType.icon) {
    return tableType.icon;
  }

  // Legacy fallback for old enum values
  switch (tableType) {
    case TableType.VIP:
      return 'Crown';
    case TableType.PRIVATE:
      return 'Lock';
    case TableType.COUPLE:
      return 'Heart';
    case TableType.FAMILY:
      return 'Users';
    case TableType.BUSINESS:
      return 'Briefcase';
    case TableType.OUTDOOR:
      return 'TreePalm';
    case TableType.SMOKING:
      return 'Cigarette';
    case TableType.NON_SMOKING:
      return 'Ban';
    case TableType.WHEELCHAIR_ACCESSIBLE:
      return 'Accessibility';
    default:
      return 'Table';
  }
};

export const getTableShapeLabel = (tableShape: TableShape): string => {
  switch (tableShape) {
    case TableShape.SQUARE:
      return 'Square';
    case TableShape.ROUND:
      return 'Round';
    case TableShape.RECTANGLE:
      return 'Rectangle';
    case TableShape.OVAL:
      return 'Oval';
    default:
      return tableShape;
  }
};

// Normalize table data from API response
export const normalizeTableData = (table: TableResponse): TableResponse => {
  return {
    ...table,
    xRatio: table.xRatio ?? table.xratio,
    yRatio: table.yRatio ?? table.yratio,
  };
};

// Debounce hook for position updates
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const validateTableData = (
  tableData: Partial<TableCreateRequest | TableUpdateRequest>
) => {
  const errors: Record<string, string> = {};

  if (!tableData.tableName?.trim()) {
    errors.tableName = 'Table name is required';
  }

  if (
    !tableData.capacity ||
    tableData.capacity < 1 ||
    tableData.capacity > 50
  ) {
    errors.capacity = 'Capacity must be between 1 and 50 people';
  }

  if (
    tableData.xRatio === undefined ||
    tableData.xRatio < 0 ||
    tableData.xRatio > 1
  ) {
    errors.xRatio = 'X position must be between 0.0 and 1.0';
  }

  if (
    tableData.yRatio === undefined ||
    tableData.yRatio < 0 ||
    tableData.yRatio > 1
  ) {
    errors.yRatio = 'Y position must be between 0.0 and 1.0';
  }

  if (
    tableData.widthRatio === undefined ||
    tableData.widthRatio < 0.01 ||
    tableData.widthRatio > 1
  ) {
    errors.widthRatio = 'Width must be between 0.01 and 1.0';
  }

  if (
    tableData.heightRatio === undefined ||
    tableData.heightRatio < 0.01 ||
    tableData.heightRatio > 1
  ) {
    errors.heightRatio = 'Height must be between 0.01 and 1.0';
  }

  if (!tableData.tableShape) {
    errors.tableShape = 'Table shape is required';
  }

  if (!tableData.tableTypeId) {
    errors.tableTypeId = 'Table type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
