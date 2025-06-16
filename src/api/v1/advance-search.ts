import { apiClient } from '@/services/api-client';
import { useQuery } from '@tanstack/react-query';
import { BaseResponse, Status } from '.';
import { FilterDefinition, OperandType } from '@/components/common/Table/types';

// Types
export interface AdvanceSearchResponseDto {
  id: number;
  tableName: string;
  columnName: string;
  label: string;
  operandType: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: Status;
  createdUsername: string;
  updatedUsername: string;
}

// API calls
export const getAdvanceSearch = async (tableName: string): Promise<FilterDefinition[]> => {
  const response = await apiClient.get<BaseResponse<AdvanceSearchResponseDto[]>>(`/advance-search?tableName=${tableName}`);
  return response.data.payload.map(item => ({
    field: item.columnName,
    label: item.label,
    type: item.operandType as OperandType,
  }));
};

// Hooks
export const useAdvanceSearch = (tableName: string) => {
  return useQuery({
    queryKey: ['advance-search', tableName],
    queryFn: () => getAdvanceSearch(tableName),
    enabled: !!tableName,
  });
}; 