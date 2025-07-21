import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Interfaces
export interface TableTypeCreateRequest {
  tableType: string;
  color: string;
  icon: string;
  depositForBooking: number;
}

export interface TableTypeUpdateRequest {
  tableType: string;
  color: string;
  icon: string;
  depositForBooking: number;
}

export interface TableTypeResponse {
  id: number;
  tableType: string;
  color: string;
  icon: string;
  depositForBooking: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

// API Functions
const createTableType = async (
  data: TableTypeCreateRequest
): Promise<TableTypeResponse> => {
  const response = await apiClient.post<BaseResponse<TableTypeResponse>>(
    '/table-types',
    data
  );
  return response.data.payload!;
};

const updateTableType = async (
  id: number,
  data: TableTypeUpdateRequest
): Promise<TableTypeResponse> => {
  const response = await apiClient.put<BaseResponse<TableTypeResponse>>(
    `/table-types/${id}`,
    data
  );
  return response.data.payload!;
};

const getTableTypes = async (): Promise<TableTypeResponse[]> => {
  const response =
    await apiClient.get<BaseResponse<TableTypeResponse[]>>('/table-types');
  return response.data.payload!;
};

const getActiveTableTypes = async (): Promise<TableTypeResponse[]> => {
  const response = await apiClient.get<BaseResponse<TableTypeResponse[]>>(
    '/table-types/active'
  );
  return response.data.payload!;
};

const deleteTableType = async (id: number): Promise<void> => {
  await apiClient.delete(`/table-types/${id}`);
};

// React Query Hooks
export const useCreateTableType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTableType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-types'] });
    },
  });
};

export const useUpdateTableType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TableTypeUpdateRequest }) =>
      updateTableType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-types'] });
    },
  });
};

export const useTableTypes = () => {
  return useQuery({
    queryKey: ['table-types'],
    queryFn: getTableTypes,
  });
};

export const useActiveTableTypes = () => {
  return useQuery({
    queryKey: ['table-types', 'active'],
    queryFn: getActiveTableTypes,
  });
};

export const useDeleteTableType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTableType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-types'] });
    },
  });
};

// Utility functions
export const validateTableTypeData = (
  tableTypeData: Partial<TableTypeCreateRequest | TableTypeUpdateRequest>
) => {
  const errors: Record<string, string> = {};

  if (!tableTypeData.tableType?.trim()) {
    errors.tableType = 'Table type name is required';
  } else if (tableTypeData.tableType.length > 100) {
    errors.tableType = 'Table type name must be less than 100 characters';
  }

  if (!tableTypeData.color?.trim()) {
    errors.color = 'Color is required';
  } else if (!/^#[0-9A-F]{6}$/i.test(tableTypeData.color)) {
    errors.color = 'Color must be a valid hex color code (e.g., #FF0000)';
  }

  if (!tableTypeData.icon?.trim()) {
    errors.icon = 'Icon is required';
  } else if (tableTypeData.icon.length > 50) {
    errors.icon = 'Icon name must be less than 50 characters';
  }

  if (
    tableTypeData.depositForBooking === undefined ||
    tableTypeData.depositForBooking < 0 ||
    tableTypeData.depositForBooking > 999999999.99
  ) {
    errors.depositForBooking = 'Deposit must be between 0 and 999,999,999.99';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
