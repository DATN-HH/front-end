import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserDtoResponse } from './auth';
import { BaseListRequest, BaseResponse, PageResponse, ShiftStatus, Status } from '.';
import { ScheduledShiftResponseDto } from './scheduled-shift';


export interface StaffShiftResponseDto {
  id: number;
  note: string;
  shiftStatus: ShiftStatus;
  staff: UserDtoResponse;
  scheduledShift: ScheduledShiftResponseDto;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: Status;
  createdUsername: string;
  updatedUsername: string;
}

export interface StaffShiftRequestDto {
  note?: string;
  shiftStatus?: ShiftStatus;
  staffId: number;
  scheduledShiftId: number;
}

export interface StaffShiftListRequest extends BaseListRequest {
  startDate?: string;
  endDate?: string;
  branchId?: number;
  staffId?: number;
  size?: number;
}

export interface StaffShiftData {
  staffId: number;
  shifts: Record<string, ScheduledShiftResponseDto[]>; // DATE -> SHIFTS
}

export interface StaffShiftGroupedResponseDto {
  data: Record<string, Record<string, StaffShiftData>>; // ROLE -> STAFF NAME -> StaffShiftData
}

// API calls
export const getStaffShifts = async (params: StaffShiftListRequest): Promise<PageResponse<StaffShiftResponseDto>> => {
  const response = await apiClient.get<PageResponse<StaffShiftResponseDto>>('/staff-shifts', { params });
  return response.data;
};

export const getStaffShiftsGrouped = async (params: StaffShiftListRequest): Promise<StaffShiftGroupedResponseDto> => {
  const response = await apiClient.get<BaseResponse<StaffShiftGroupedResponseDto>>('/staff-shifts/grouped', { params });
  return response.data.payload;
};

export const createStaffShift = async (data: StaffShiftRequestDto): Promise<StaffShiftResponseDto> => {
  const response = await apiClient.post<StaffShiftResponseDto>('/staff-shifts', data);
  return response.data;
};

export const bulkCreateStaffShifts = async (data: StaffShiftRequestDto[]): Promise<StaffShiftResponseDto[]> => {
  const response = await apiClient.post<StaffShiftResponseDto[]>('/staff-shifts/bulk', data);
  return response.data;
};

export const updateStaffShift = async (id: number, data: StaffShiftRequestDto): Promise<StaffShiftResponseDto> => {
  const response = await apiClient.put<StaffShiftResponseDto>(`/staff-shifts/${id}`, data);
  return response.data;
};

export const deleteStaffShift = async (id: number): Promise<string> => {
  const response = await apiClient.delete<string>(`/staff-shifts/${id}`);
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

export const useStaffShiftsGrouped = (params: StaffShiftListRequest) => {
  return useQuery({
    queryKey: ['staff-shifts-grouped', params],
    queryFn: () => getStaffShiftsGrouped(params),
  });
};

export const useCreateStaffShift = () => {
  return useMutation({
    mutationFn: createStaffShift,
  });
};

export const useBulkCreateStaffShifts = () => {
  return useMutation({
    mutationFn: bulkCreateStaffShifts,
  });
};

export const useUpdateStaffShift = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StaffShiftRequestDto }) => updateStaffShift(id, data),
  });
};

export const useDeleteStaffShift = () => {
  return useMutation({
    mutationFn: deleteStaffShift,
  });
};

export const usePublishStaffShifts = () => {
  return useMutation({
    mutationFn: publishStaffShifts,
  });
}; 