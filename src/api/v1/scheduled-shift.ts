import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { LocalTime, BaseResponse, ShiftRequirementDto } from '.';

// Types
export interface ScheduledShiftRequestDto {
    shiftId: number;
    branchId: number;
    date: string; // yyyy-MM-dd format
}

export interface ScheduledShiftResponseDto {
    id: number;
    shiftId: number;
    shiftName: string;
    startTime: LocalTime;
    endTime: LocalTime;
    branchId: number;
    branchName: string;
    date: string; // yyyy-MM-dd format
    requirements: ShiftRequirementDto[];
    shiftStatus: 'DRAFT' | 'PUBLISHED';
}

export interface ScheduledShiftListRequest {
    branchId?: number;
    startDate?: string; // yyyy-MM-dd format
    endDate?: string; // yyyy-MM-dd format
}

export interface ScheduledShiftGroupedResponseDto {
    date: string; // yyyy-MM-dd format
    shifts: ScheduledShiftResponseDto[];
}

// API calls
const createScheduledShift = async (
    data: ScheduledShiftRequestDto
): Promise<ScheduledShiftResponseDto> => {
    const response = await apiClient.post<
        BaseResponse<ScheduledShiftResponseDto>
    >('/scheduled-shifts', data);
    return response.data.payload;
};

const getScheduledShifts = async (
    params: ScheduledShiftListRequest
): Promise<ScheduledShiftResponseDto[]> => {
    const response = await apiClient.get<
        BaseResponse<ScheduledShiftResponseDto[]>
    >('/scheduled-shifts', { params });
    return response.data.payload;
};

const getScheduledShiftsGrouped = async (
    params: ScheduledShiftListRequest
): Promise<ScheduledShiftGroupedResponseDto[]> => {
    const response = await apiClient.get<
        BaseResponse<ScheduledShiftGroupedResponseDto[]>
    >('/scheduled-shifts/grouped', { params });
    return response.data.payload;
};

const deleteScheduledShift = async (id: number): Promise<string> => {
    const response = await apiClient.delete<BaseResponse<string>>(
        `/scheduled-shifts/${id}`
    );
    return response.data.payload;
};

// Hooks
export const useCreateScheduledShift = () => {
    return useMutation({
        mutationFn: createScheduledShift,
    });
};

export const useScheduledShifts = (params: ScheduledShiftListRequest) => {
    return useQuery({
        queryKey: ['scheduled-shifts', params],
        queryFn: () => getScheduledShifts(params),
        enabled: !!params.branchId || !!params.startDate || !!params.endDate,
    });
};

export const useScheduledShiftsGrouped = (
    params: ScheduledShiftListRequest
) => {
    return useQuery({
        queryKey: ['scheduled-shifts', 'grouped', params],
        queryFn: () => getScheduledShiftsGrouped(params),
        enabled: !!params.branchId || !!params.startDate || !!params.endDate,
    });
};

export const useDeleteScheduledShift = () => {
    return useMutation({
        mutationFn: deleteScheduledShift,
    });
};

// Copy Week Types
export interface CopyWeekRequestDto {
    branchId: number;
    sourceStartDate: string; // yyyy-MM-dd format
    targetStartDates: string[]; // yyyy-MM-dd format
}

export interface CopyWeekResponseDto {
    totalCopied: number;
    totalSkipped: number;
    copiedWeeks: string[];
    skippedDuplicates: string[];
    message: string;
}

// Copy Week API call
export const copyScheduledShiftsWeek = async (
    data: CopyWeekRequestDto
): Promise<CopyWeekResponseDto> => {
    const response = await apiClient.post<BaseResponse<CopyWeekResponseDto>>(
        '/scheduled-shifts/copy-week',
        data
    );
    return response.data.payload;
};

// Copy Week Hook
export const useCopyScheduledShiftsWeek = () => {
    return useMutation({
        mutationFn: copyScheduledShiftsWeek,
    });
};
