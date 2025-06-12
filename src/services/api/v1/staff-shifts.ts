import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserDtoResponse } from './auth';
import { ShiftResponseDto } from './shifts';
import { BaseListRequest, PageResponse, ShiftStatus, Status } from '.';

// Types
export interface StaffShiftResponseDto {
  id: number;
  date: string;
  note: string;
  shiftStatus: ShiftStatus;
  staff: UserDtoResponse;
  shift: ShiftResponseDto;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: Status;
  createdUsername: string;
  updatedUsername: string;
}

export interface StaffShiftRequestDto {
  date: string;
  note?: string;
  shiftStatus?: ShiftStatus;
  staffId: number;
  shiftId: number;
}

export interface StaffShiftListRequest extends BaseListRequest {
  startDate?: string;
  endDate?: string;
  branchId?: number;
  staffId?: number;
  shiftId?: number;
}

export interface StaffShiftCopyRequest {
  fromDate: string;
  toDate: string;
  branchId: number;
  numberOfDays: number;
}

// API calls
export const getStaffShifts = async (params: StaffShiftListRequest): Promise<PageResponse<StaffShiftResponseDto>> => {
  const response = await apiClient.get<PageResponse<StaffShiftResponseDto>>('/staff-shifts', { params });
  return response.data;
};

export const createStaffShift = async (data: StaffShiftRequestDto): Promise<StaffShiftResponseDto> => {
  const response = await apiClient.post<StaffShiftResponseDto>('/staff-shifts', data);
  return response.data;
};

export const copyStaffShifts = async (data: StaffShiftCopyRequest): Promise<PageResponse<StaffShiftResponseDto>> => {
  const response = await apiClient.post<PageResponse<StaffShiftResponseDto>>('/staff-shifts/copy', data);
  return response.data;
};

export const publishStaffShifts = async (params: StaffShiftListRequest): Promise<PageResponse<StaffShiftResponseDto>> => {
  const response = await apiClient.put<PageResponse<StaffShiftResponseDto>>('/staff-shifts/publish', params);
  return response.data;
};

// Hooks
export const useStaffShifts = (params: StaffShiftListRequest) => {
  return useQuery({
    queryKey: ['staff-shifts', params],
    queryFn: () => getStaffShifts(params),
  });
};

export const useCreateStaffShift = () => {
  return useMutation({
    mutationFn: createStaffShift,
  });
};

export const useCopyStaffShifts = () => {
  return useMutation({
    mutationFn: copyStaffShifts,
  });
};

export const usePublishStaffShifts = () => {
  return useMutation({
    mutationFn: publishStaffShifts,
  });
}; 