import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

// Enums
export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  EMERGENCY = 'EMERGENCY',
  MATERNITY = 'MATERNITY',
  PERSONAL = 'PERSONAL',
  UNPAID = 'UNPAID',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum ShiftStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  CONFLICTED = 'CONFLICTED',
  REQUEST_CHANGE = 'REQUEST_CHANGE',
  APPROVED_LEAVE_VALID = 'APPROVED_LEAVE_VALID',
  APPROVED_LEAVE_EXCEEDED = 'APPROVED_LEAVE_EXCEEDED',
}

// Interfaces
export interface WeeklyScheduleItem {
  id: number;
  note: string;
  date: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  branchName: string;
  branchId: number;
}

export interface WorkingHours {
  totalHours: number;
  totalDays: number;
  period: string;
}

export interface LeaveBalance {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveRequest {
  id: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  totalDays: number;
  createdAt: string;
}

export interface SubmitLeaveRequestDto {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

// Available Shifts Interface
export interface AvailableShift {
  scheduledShiftId: number;
  shiftId?: number;
  shiftName: string;
  date: string; // Format: 'YYYY-MM-DD'
  startTime: string; // Format: 'HH:mm:ss'
  endTime: string; // Format: 'HH:mm:ss'
  branchId: number;
  branchName: string;
  registeredCount: number; // Number of staff already registered
  maxStaff: number; // Maximum staff needed
  canRegister: boolean;
  conflictReason?: string;
  requirements?: {
    roleId: number;
    roleName: string;
    count: number;
  }[];
}

export interface ShiftRegistrationRequest {
  scheduledShiftId: number;
  note?: string;
}

// API Functions
const getWeeklySchedule = async (
  startDate: string,
  endDate: string
): Promise<WeeklyScheduleItem[]> => {
  const response = await apiClient.get(
    `/employee-portal/schedule?startDate=${startDate}&endDate=${endDate}`
  );
  return response.data.payload;
};

const getWorkingHours = async (days: number): Promise<WorkingHours> => {
  const response = await apiClient.get(
    `/employee-portal/working-hours/${days}`
  );
  return response.data.payload;
};

const getAvailableShifts = async (): Promise<AvailableShift[]> => {
  const response = await apiClient.get('/employee-portal/available-shifts');
  return response.data.payload;
};

const registerForShift = async (
  data: ShiftRegistrationRequest
): Promise<string> => {
  const response = await apiClient.post(
    '/employee-portal/shift-registration',
    data
  );
  return response.data.payload;
};

// React Query Hooks
export const useWeeklySchedule = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['weeklySchedule', startDate, endDate],
    queryFn: () => getWeeklySchedule(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useWorkingHours = (days: number) => {
  return useQuery({
    queryKey: ['workingHours', days],
    queryFn: () => getWorkingHours(days),
    enabled: !!days,
  });
};

export const useAvailableShifts = () => {
  return useQuery({
    queryKey: ['availableShifts'],
    queryFn: getAvailableShifts,
  });
};

export const useRegisterForShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerForShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableShifts'] });
      queryClient.invalidateQueries({ queryKey: ['weeklySchedule'] });
    },
  });
};
