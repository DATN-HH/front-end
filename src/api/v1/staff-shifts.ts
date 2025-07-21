import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { UserDtoResponse } from './auth';
import { ScheduledShiftResponseDto } from './scheduled-shift';

import {
    BaseListRequest,
    BaseResponse,
    PageResponse,
    ShiftStatus,
    Status,
} from '.';

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

export interface CopyWeekWithScheduleRequestDto {
    branchId: number;
    sourceStartDate: string;
    targetStartDates: string[];
}

export interface CopyWeekWithScheduleResponseDto {
    totalScheduledShiftsCopied: number;
    totalStaffShiftsCopied: number;
    totalStaffShiftsDeleted: number;
    copiedWeeks: string[];
    processedDetails: string[];
    message: string;
}

// API calls
const getStaffShifts = async (
    params: StaffShiftListRequest
): Promise<PageResponse<StaffShiftResponseDto>> => {
    const response = await apiClient.get<PageResponse<StaffShiftResponseDto>>(
        '/staff-shifts',
        { params }
    );
    return response.data;
};

const getStaffShiftsGrouped = async (
    params: StaffShiftListRequest
): Promise<StaffShiftGroupedResponseDto> => {
    const response = await apiClient.get<
        BaseResponse<StaffShiftGroupedResponseDto>
    >('/staff-shifts/grouped', { params });
    return response.data.payload;
};

const createStaffShift = async (
    data: StaffShiftRequestDto
): Promise<StaffShiftResponseDto> => {
    const response = await apiClient.post<StaffShiftResponseDto>(
        '/staff-shifts',
        data
    );
    return response.data;
};

const deleteStaffShift = async (id: number): Promise<string> => {
    const response = await apiClient.delete<string>(`/staff-shifts/${id}`);
    return response.data;
};

const publishStaffShifts = async (
    params: StaffShiftListRequest
): Promise<PageResponse<StaffShiftResponseDto>> => {
    const response = await apiClient.put<PageResponse<StaffShiftResponseDto>>(
        '/staff-shifts/publish',
        params
    );
    return response.data;
};

const copyWeekWithSchedule = async (
    data: CopyWeekWithScheduleRequestDto
): Promise<CopyWeekWithScheduleResponseDto> => {
    const response = await apiClient.post<
        BaseResponse<CopyWeekWithScheduleResponseDto>
    >('/staff-shifts/copy-week-with-schedule', data);
    return response.data.payload;
};

const requestEmergencyLeave = async (
    staffShiftId: number,
    reason?: string
): Promise<StaffShiftResponseDto> => {
    const params = reason ? { reason } : {};
    const response = await apiClient.put<BaseResponse<StaffShiftResponseDto>>(
        `/staff-shifts/${staffShiftId}/emergency-leave`,
        {},
        { params }
    );
    return response.data.payload;
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

export const useCopyWeekWithSchedule = () => {
    return useMutation({
        mutationFn: copyWeekWithSchedule,
    });
};

export const useRequestEmergencyLeave = () => {
    return useMutation({
        mutationFn: ({
            staffShiftId,
            reason,
        }: {
            staffShiftId: number;
            reason?: string;
        }) => requestEmergencyLeave(staffShiftId, reason),
    });
};
