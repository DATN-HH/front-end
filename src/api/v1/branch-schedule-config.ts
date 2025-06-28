import { apiClient } from '@/services/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BaseResponse, BaseEntity } from '.';

// Enums
export enum ScheduleLockStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED', 
  TEMPORARILY_UNLOCKED = 'TEMPORARILY_UNLOCKED'
}

export enum AssignmentRuleType {
  MAX_SHIFTS_PER_WEEK = 'MAX_SHIFTS_PER_WEEK',
  MAX_SHIFTS_PER_DAY = 'MAX_SHIFTS_PER_DAY',
  MIN_REST_HOURS_BETWEEN_SHIFTS = 'MIN_REST_HOURS_BETWEEN_SHIFTS',
  PREFERRED_ROLES = 'PREFERRED_ROLES',
  SKILL_REQUIREMENT = 'SKILL_REQUIREMENT',
  AVAILABILITY_BASED = 'AVAILABILITY_BASED'
}

// Branch Schedule Configuration Interfaces
export interface BranchScheduleConfigRequest {
  branchId: number;
  maxShiftsPerWeek?: number;
  maxShiftsPerDay?: number;
  minRestHoursBetweenShifts?: number;
  autoAssignEnabled?: boolean;
  requireManagerApproval?: boolean;
  allowSelfAssignment?: boolean;
  enableShiftSwap?: boolean;
  responseDeadlineHours?: number;
  notificationSettings?: string;
  assignmentPriorityRules?: string;
  allowSelfShiftRegistration?: boolean;
  registrationStartDayOfWeek?: number; // 1 = Monday, 7 = Sunday
  registrationEndDayOfWeek?: number;   // 1 = Monday, 7 = Sunday
  registrationDaysInAdvance?: number;  // How many days in advance to register
}

export interface BranchScheduleConfigResponse extends BaseEntity {
  branchId: number;
  branchName: string;
  maxShiftsPerWeek: number;
  maxShiftsPerDay: number;
  minRestHoursBetweenShifts: number;
  autoAssignEnabled: boolean;
  requireManagerApproval: boolean;
  allowSelfAssignment: boolean;
  enableShiftSwap: boolean;
  responseDeadlineHours: number;
  notificationSettings?: string;
  assignmentPriorityRules?: string;
  allowSelfShiftRegistration: boolean;
  registrationStartDayOfWeek: number; // 1 = Monday, 7 = Sunday
  registrationEndDayOfWeek: number;   // 1 = Monday, 7 = Sunday
  registrationDaysInAdvance: number;  // How many days in advance to register
}

// API calls
export const createOrUpdateBranchScheduleConfig = async (data: BranchScheduleConfigRequest): Promise<BranchScheduleConfigResponse> => {
  const response = await apiClient.post<BaseResponse<BranchScheduleConfigResponse>>('/branch-schedule-configs', data);
  return response.data.payload;
};

export const getBranchScheduleConfig = async (branchId: number): Promise<BranchScheduleConfigResponse> => {
  const response = await apiClient.get<BaseResponse<BranchScheduleConfigResponse>>(`/branch-schedule-configs/branch/${branchId}`);
  return response.data.payload;
};

export const deleteBranchScheduleConfig = async (branchId: number): Promise<string> => {
  const response = await apiClient.delete<BaseResponse<string>>(`/branch-schedule-configs/branch/${branchId}`);
  return response.data.payload;
};

// Hooks
export const useBranchScheduleConfig = (branchId: number) => {
  return useQuery({
    queryKey: ['branch-schedule-config', branchId],
    queryFn: () => getBranchScheduleConfig(branchId),
    enabled: !!branchId,
  });
};

export const useCreateOrUpdateBranchScheduleConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrUpdateBranchScheduleConfig,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['branch-schedule-config', data.branchId] });
    },
  });
};

export const useDeleteBranchScheduleConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBranchScheduleConfig,
    onSuccess: (_, branchId) => {
      queryClient.invalidateQueries({ queryKey: ['branch-schedule-config', branchId] });
    },
  });
}; 