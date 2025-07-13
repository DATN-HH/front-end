import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api-client';

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

export interface BaseResponse<T> {
  success: boolean;
  code: number;
  message: string;
  payload: T | null;
}

// API Functions
export const createTableType = async (data: TableTypeCreateRequest): Promise<TableTypeResponse> => {
  const response = await apiClient.post<BaseResponse<TableTypeResponse>>('/table-types', data);
  return response.data.payload!;
};

export const updateTableType = async (id: number, data: TableTypeUpdateRequest): Promise<TableTypeResponse> => {
  const response = await apiClient.put<BaseResponse<TableTypeResponse>>(`/table-types/${id}`, data);
  return response.data.payload!;
};

export const getTableTypes = async (): Promise<TableTypeResponse[]> => {
  const response = await apiClient.get<BaseResponse<TableTypeResponse[]>>('/table-types');
  return response.data.payload!;
};

export const getActiveTableTypes = async (): Promise<TableTypeResponse[]> => {
  const response = await apiClient.get<BaseResponse<TableTypeResponse[]>>('/table-types/active');
  return response.data.payload!;
};

export const getTableType = async (id: number): Promise<TableTypeResponse> => {
  const response = await apiClient.get<BaseResponse<TableTypeResponse>>(`/table-types/${id}`);
  return response.data.payload!;
};

export const deleteTableType = async (id: number): Promise<void> => {
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
    mutationFn: ({ id, data }: { id: number; data: TableTypeUpdateRequest }) => updateTableType(id, data),
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

export const useTableType = (id: number) => {
  return useQuery({
    queryKey: ['table-types', id],
    queryFn: () => getTableType(id),
    enabled: !!id,
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
export const validateTableTypeData = (tableTypeData: Partial<TableTypeCreateRequest | TableTypeUpdateRequest>) => {
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

  if (tableTypeData.depositForBooking === undefined || tableTypeData.depositForBooking < 0 || tableTypeData.depositForBooking > 999999999.99) {
    errors.depositForBooking = 'Deposit must be between 0 and 999,999,999.99';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Default table types mapping (for migration reference)
export const defaultTableTypes = [
  { tableType: 'STANDARD', color: '#6B7280', icon: 'Table', depositForBooking: 0 },
  { tableType: 'VIP', color: '#F59E0B', icon: 'Crown', depositForBooking: 100000 },
  { tableType: 'OUTDOOR', color: '#059669', icon: 'TreePalm', depositForBooking: 0 },
  { tableType: 'PRIVATE', color: '#8B5CF6', icon: 'Lock', depositForBooking: 50000 },
  { tableType: 'COUPLE', color: '#F472B6', icon: 'Heart', depositForBooking: 30000 },
  { tableType: 'FAMILY', color: '#10B981', icon: 'Users', depositForBooking: 20000 },
  { tableType: 'BUSINESS', color: '#3B82F6', icon: 'Briefcase', depositForBooking: 25000 },
  { tableType: 'SMOKING', color: '#EF4444', icon: 'Cigarette', depositForBooking: 0 },
  { tableType: 'NON_SMOKING', color: '#6B7280', icon: 'Ban', depositForBooking: 0 },
  { tableType: 'WHEELCHAIR_ACCESSIBLE', color: '#14B8A6', icon: 'Accessibility', depositForBooking: 0 }
]; 