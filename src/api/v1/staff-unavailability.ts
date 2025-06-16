import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserDtoResponse } from './auth';
import { BaseListRequest, BaseResponse, PageResponse, RequestStatus, Status } from '.';

// Types
export interface StaffUnavailabilityResponseDto {
  id: number;
  startTime: string;
  endTime: string;
  staffUnavailabilityStatus: RequestStatus;
  reason: string;
  staff: UserDtoResponse;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: Status;
  createdUsername: string;
  updatedUsername: string;
}

export interface StaffUnavailabilityRequestDto {
  startTime: string;
  endTime: string;
  staffUnavailabilityStatus?: RequestStatus;
  reason?: string;
}

export interface StaffUnavailabilityListRequest extends BaseListRequest {
  startDate?: string;
  endDate?: string;
  branchId?: number;
  staffId?: number;
}

// API calls
export const getStaffUnavailability = async (params: StaffUnavailabilityListRequest): Promise<PageResponse<StaffUnavailabilityResponseDto>> => {
  const response = await apiClient.get<BaseResponse<PageResponse<StaffUnavailabilityResponseDto>>>('/staff-unavailability', { params });
  return response.data.payload;
};

export const createStaffUnavailability = async (data: StaffUnavailabilityRequestDto): Promise<StaffUnavailabilityResponseDto> => {
  const response = await apiClient.post<StaffUnavailabilityResponseDto>('/staff-unavailability', data);
  return response.data;
};

export const approveStaffUnavailability = async (id: number): Promise<StaffUnavailabilityResponseDto> => {
  const response = await apiClient.put<StaffUnavailabilityResponseDto>(`/staff-unavailability/${id}/approve`);
  return response.data;
};

export const rejectStaffUnavailability = async (id: number): Promise<StaffUnavailabilityResponseDto> => {
  const response = await apiClient.put<StaffUnavailabilityResponseDto>(`/staff-unavailability/${id}/reject`);
  return response.data;
};

// Hooks
export const useStaffUnavailability = (params: StaffUnavailabilityListRequest) => {
  return useQuery({
    queryKey: ['staff-unavailability', params],
    queryFn: () => getStaffUnavailability(params),
  });
};

export const useCreateStaffUnavailability = () => {
  return useMutation({
    mutationFn: createStaffUnavailability,
  });
};

export const useApproveStaffUnavailability = () => {
  return useMutation({
    mutationFn: approveStaffUnavailability,
  });
};

export const useRejectStaffUnavailability = () => {
  return useMutation({
    mutationFn: rejectStaffUnavailability,
  });
}; 