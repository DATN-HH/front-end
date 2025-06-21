import { apiClient } from '@/services/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BaseResponse, BaseEntity } from '.';
import { ScheduleLockStatus } from './branch-schedule-config';

// Schedule Lock Interfaces
export interface ScheduleLockRequest {
  branchId: number;
  startDate: string; // Format: 'YYYY-MM-DD'
  endDate: string; // Format: 'YYYY-MM-DD'
  lockReason?: string;
}

export interface ScheduleUnlockRequest {
  unlockReason: string;
}

export interface ScheduleLockResponse extends BaseEntity {
  branchId: number;
  branchName: string;
  startDate: string; // Format: 'YYYY-MM-DD'
  endDate: string; // Format: 'YYYY-MM-DD'
  lockStatus: ScheduleLockStatus;
  lockedById: number;
  lockedByName: string;
  lockedAt: string; // ISO datetime
  unlockedById?: number;
  unlockedByName?: string;
  unlockedAt?: string; // ISO datetime
  unlockReason?: string;
  lockReason?: string;
}

// API calls
export const lockSchedule = async (data: ScheduleLockRequest): Promise<ScheduleLockResponse> => {
  const response = await apiClient.post<BaseResponse<ScheduleLockResponse>>('/schedule-locks/lock', data);
  return response.data.payload;
};

export const unlockSchedule = async (lockId: number, data: ScheduleUnlockRequest): Promise<ScheduleLockResponse> => {
  const response = await apiClient.put<BaseResponse<ScheduleLockResponse>>(`/schedule-locks/${lockId}/unlock`, data);
  return response.data.payload;
};

export const checkScheduleLock = async (branchId: number, date: string): Promise<boolean> => {
  const response = await apiClient.get<BaseResponse<boolean>>(`/schedule-locks/branch/${branchId}/check`, {
    params: { date }
  });
  return response.data.payload;
};

export const getActiveScheduleLock = async (branchId: number, date: string): Promise<ScheduleLockResponse | null> => {
  const response = await apiClient.get<BaseResponse<ScheduleLockResponse | null>>(`/schedule-locks/branch/${branchId}/active`, {
    params: { date }
  });
  return response.data.payload;
};

export const getBranchScheduleLocks = async (branchId: number): Promise<ScheduleLockResponse[]> => {
  const response = await apiClient.get<BaseResponse<ScheduleLockResponse[]>>(`/schedule-locks/branch/${branchId}`);
  return response.data.payload;
};

export const getScheduleLocksInRange = async (branchId: number, startDate: string, endDate: string): Promise<ScheduleLockResponse[]> => {
  const response = await apiClient.get<BaseResponse<ScheduleLockResponse[]>>(`/schedule-locks/branch/${branchId}/range`, {
    params: { startDate, endDate }
  });
  return response.data.payload;
};

// Hooks
export const useLockSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lockSchedule,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schedule-locks', data.branchId] });
      queryClient.invalidateQueries({ queryKey: ['schedule-lock-check'] });
    },
  });
};

export const useUnlockSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lockId, data }: { lockId: number; data: ScheduleUnlockRequest }) => 
      unlockSchedule(lockId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schedule-locks', data.branchId] });
      queryClient.invalidateQueries({ queryKey: ['schedule-lock-check'] });
    },
  });
};

export const useCheckScheduleLock = (branchId: number, date: string) => {
  return useQuery({
    queryKey: ['schedule-lock-check', branchId, date],
    queryFn: () => checkScheduleLock(branchId, date),
    enabled: !!branchId && !!date,
  });
};

export const useActiveScheduleLock = (branchId: number, date: string) => {
  return useQuery({
    queryKey: ['active-schedule-lock', branchId, date],
    queryFn: () => getActiveScheduleLock(branchId, date),
    enabled: !!branchId && !!date,
  });
};

export const useBranchScheduleLocks = (branchId: number) => {
  return useQuery({
    queryKey: ['schedule-locks', branchId],
    queryFn: () => getBranchScheduleLocks(branchId),
    enabled: !!branchId,
  });
};

export const useScheduleLocksInRange = (branchId: number, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['schedule-locks-range', branchId, startDate, endDate],
    queryFn: () => getScheduleLocksInRange(branchId, startDate, endDate),
    enabled: !!branchId && !!startDate && !!endDate,
  });
}; 