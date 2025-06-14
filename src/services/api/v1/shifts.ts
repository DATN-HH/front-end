import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LocalTime, RoleName, Status } from '.';

// Types
export interface ShiftResponseDto {
  id: number;
  startTime: LocalTime;
  endTime: LocalTime;
  branchId: number;
  branchName: string;
  requirements: ShiftRequirementDto[];
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: Status;
  createdUsername: string;
  updatedUsername: string;
}

export interface ShiftRequirementDto {
  id: number;
  role: RoleName;
  quantity: number;
}

export interface ShiftRequestDto {
  startTime: LocalTime;
  endTime: LocalTime;
  branchId: number;
  requirements: ShiftRequirementDto[];
}

// API calls
export const getShifts = async (branchId: number): Promise<ShiftResponseDto[]> => {
  const response = await apiClient.get<ShiftResponseDto[]>(`/shifts?branchId=${branchId}`);
  return response.data;
};

export const createShift = async (data: ShiftRequestDto): Promise<ShiftResponseDto> => {
  const response = await apiClient.post<ShiftResponseDto>('/shifts', data);
  return response.data;
};

export const updateShift = async (id: number, data: ShiftRequestDto): Promise<ShiftResponseDto> => {
  const response = await apiClient.put<ShiftResponseDto>(`/shifts/${id}`, data);
  return response.data;
};

export const deleteShift = async (id: number): Promise<string> => {
  const response = await apiClient.delete<string>(`/shifts/${id}`);
  return response.data;
};

// Hooks
export const useShifts = (branchId: number) => {
  return useQuery({
    queryKey: ['shifts', branchId],
    queryFn: () => getShifts(branchId),
    enabled: !!branchId,
  });
};

export const useCreateShift = () => {
  return useMutation({
    mutationFn: createShift,
  });
};

export const useUpdateShift = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ShiftRequestDto }) => updateShift(id, data),
  });
};

export const useDeleteShift = () => {
  return useMutation({
    mutationFn: deleteShift,
  });
}; 