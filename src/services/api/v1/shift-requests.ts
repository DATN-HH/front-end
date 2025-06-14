import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserDtoResponse } from './auth';
import { StaffShiftResponseDto } from './staff-shifts';
import { BaseListRequest, PageResponse, RequestStatus, ShiftRequestType, Status } from '.';

// Types
export interface ShiftRequestResponseDto {
  id: number;
  targetShiftId: number;
  type: ShiftRequestType;
  requestStatus: RequestStatus;
  reason: string;
  staff: UserDtoResponse;
  targetShift: StaffShiftResponseDto;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: Status;
  createdUsername: string;
  updatedUsername: string;
}

export interface ShiftRequestRequestDto {
  targetShiftId: number;
  type: ShiftRequestType;
  requestStatus?: RequestStatus;
  reason?: string;
}

export interface ShiftRequestListRequest extends BaseListRequest {
  startDate?: string;
  endDate?: string;
  branchId?: number;
  staffId?: number;
}

// API calls
export const getShiftRequests = async (params: ShiftRequestListRequest): Promise<PageResponse<ShiftRequestResponseDto>> => {
  const response = await apiClient.get<PageResponse<ShiftRequestResponseDto>>('/shift-requests', { params });
  return response.data;
};

export const createShiftRequest = async (data: ShiftRequestRequestDto): Promise<ShiftRequestResponseDto> => {
  const response = await apiClient.post<ShiftRequestResponseDto>('/shift-requests', data);
  return response.data;
};

export const approveShiftRequest = async (id: number): Promise<ShiftRequestResponseDto> => {
  const response = await apiClient.put<ShiftRequestResponseDto>(`/shift-requests/${id}/approve`);
  return response.data;
};

export const rejectShiftRequest = async (id: number): Promise<ShiftRequestResponseDto> => {
  const response = await apiClient.put<ShiftRequestResponseDto>(`/shift-requests/${id}/reject`);
  return response.data;
};

// Hooks
export const useShiftRequests = (params: ShiftRequestListRequest) => {
  return useQuery({
    queryKey: ['shift-requests', params],
    queryFn: () => getShiftRequests(params),
  });
};

export const useCreateShiftRequest = () => {
  return useMutation({
    mutationFn: createShiftRequest,
  });
};

export const useApproveShiftRequest = () => {
  return useMutation({
    mutationFn: approveShiftRequest,
  });
};

export const useRejectShiftRequest = () => {
  return useMutation({
    mutationFn: rejectShiftRequest,
  });
}; 