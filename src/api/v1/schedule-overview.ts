import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api-client';

// Enums
export enum StaffShiftStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  CONFLICTED = 'CONFLICTED',
  REQUEST_CHANGE = 'REQUEST_CHANGE',
  APPROVED_LEAVE_VALID = 'APPROVED_LEAVE_VALID',
  APPROVED_LEAVE_EXCEEDED = 'APPROVED_LEAVE_EXCEEDED'
}

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

// Interfaces
export interface StaffShiftStatisticsDto {
  totalStaffShifts: number;
  draftShifts: number;
  pendingShifts: number;
  publishedShifts: number;
  conflictedShifts: number;
  requestChangeShifts: number;
  statusBreakdown: Record<string, number>;
}

export interface ShiftLeaveStatisticsDto {
  totalShiftLeaveRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  statusBreakdown: Record<string, number>;
  totalAffectedShifts: number;
  averageAffectedShifts: number;
  totalEmployeesWithBalance: number;
  averageShiftBalance: number;
  totalShiftsUsed: number;
  totalShiftsAvailable: number;
}

export interface RoleShortfallDto {
  roleId: number;
  roleName: string;
  required: number;
  assigned: number;
  shortfall: number;
}

export interface UnderStaffedShiftDetailDto {
  scheduledShiftId: number;
  shiftId: number;
  shiftName: string;
  date: string;
  startTime: string;
  endTime: string;
  currentStaffCount: number;
  requiredStaffCount: number;
  shortfall: number;
  roleShortfalls: RoleShortfallDto[];
}

export interface UnderStaffedShiftDto {
  totalUnderStaffedShifts: number;
  shifts: UnderStaffedShiftDetailDto[];
}

export interface StaffSummaryDto {
  staffId: number;
  staffName: string;
  email: string;
  roleName: string;
  totalShifts: number;
  totalWorkingHours: number;
}

export interface StaffWorkingStatisticsDto {
  totalActiveStaff: number;
  staffWithShifts: number;
  staffWithoutShifts: number;
  workingStaff: StaffSummaryDto[];
  nonWorkingStaff: StaffSummaryDto[];
}

export interface ScheduleOverviewDto {
  startDate: string;
  endDate: string;
  branchId: number;
  branchName: string;
  staffShiftStats: StaffShiftStatisticsDto;
  shiftLeaveStats: ShiftLeaveStatisticsDto;
  underStaffedShifts: UnderStaffedShiftDto;
  staffWorkingStats: StaffWorkingStatisticsDto;
}

// API Functions
const getDailyOverview = async (branchId: number, date: string): Promise<ScheduleOverviewDto> => {
  const response = await apiClient.get(`/schedule/overview/daily?branchId=${branchId}&date=${date}`);
  return response.data.payload || response.data;
};

const getWeeklyOverview = async (branchId: number, startOfWeek: string): Promise<ScheduleOverviewDto> => {
  const response = await apiClient.get(`/schedule/overview/weekly?branchId=${branchId}&startOfWeek=${startOfWeek}`);
  return response.data.payload || response.data;
};

const getMonthlyOverview = async (branchId: number, year: number, month: number): Promise<ScheduleOverviewDto> => {
  const response = await apiClient.get(`/schedule/overview/monthly?branchId=${branchId}&year=${year}&month=${month}`);
  return response.data.payload || response.data;
};

// Hooks
export const useDailyOverview = (branchId: number, date: string) => {
  return useQuery({
    queryKey: ['scheduleOverview', 'daily', branchId, date],
    queryFn: () => getDailyOverview(branchId, date),
    enabled: !!branchId && !!date,
  });
};

export const useWeeklyOverview = (branchId: number, startOfWeek: string) => {
  return useQuery({
    queryKey: ['scheduleOverview', 'weekly', branchId, startOfWeek],
    queryFn: () => getWeeklyOverview(branchId, startOfWeek),
    enabled: !!branchId && !!startOfWeek,
  });
};

export const useMonthlyOverview = (branchId: number, year: number, month: number) => {
  return useQuery({
    queryKey: ['scheduleOverview', 'monthly', branchId, year, month],
    queryFn: () => getMonthlyOverview(branchId, year, month),
    enabled: !!branchId && !!year && !!month,
  });
};

// Utility functions
export const getStaffShiftStatusColor = (status: StaffShiftStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case StaffShiftStatus.PUBLISHED: return 'default';
    case StaffShiftStatus.PENDING: return 'secondary';
    case StaffShiftStatus.CONFLICTED: return 'destructive';
    case StaffShiftStatus.REQUEST_CHANGE: return 'outline';
    case StaffShiftStatus.APPROVED_LEAVE_VALID: return 'default';
    case StaffShiftStatus.APPROVED_LEAVE_EXCEEDED: return 'destructive';
    default: return 'outline';
  }
};

export const getStaffShiftStatusLabel = (status: StaffShiftStatus): string => {
  switch (status) {
    case StaffShiftStatus.DRAFT: return 'Nháp';
    case StaffShiftStatus.PENDING: return 'Chờ xử lý';
    case StaffShiftStatus.PUBLISHED: return 'Đã công bố';
    case StaffShiftStatus.CONFLICTED: return 'Xung đột';
    case StaffShiftStatus.REQUEST_CHANGE: return 'Yêu cầu thay đổi';
    case StaffShiftStatus.APPROVED_LEAVE_VALID: return 'Nghỉ phép được chấp nhận';
    case StaffShiftStatus.APPROVED_LEAVE_EXCEEDED: return 'Nghỉ phép vượt quá';
    default: return status;
  }
};

export const getLeaveStatusColor = (status: LeaveRequestStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case LeaveRequestStatus.APPROVED: return 'default';
    case LeaveRequestStatus.PENDING: return 'secondary';
    case LeaveRequestStatus.REJECTED: return 'destructive';
    case LeaveRequestStatus.CANCELLED: return 'outline';
    default: return 'outline';
  }
};

export const getLeaveStatusLabel = (status: LeaveRequestStatus): string => {
  switch (status) {
    case LeaveRequestStatus.PENDING: return 'Chờ duyệt';
    case LeaveRequestStatus.APPROVED: return 'Đã duyệt';
    case LeaveRequestStatus.REJECTED: return 'Từ chối';
    case LeaveRequestStatus.CANCELLED: return 'Đã hủy';
    default: return status;
  }
};

// Helper functions for date calculations
export const getStartOfWeek = (date: Date): string => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  startOfWeek.setDate(diff);
  return startOfWeek.toISOString().split('T')[0];
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getCurrentMonth = (): { year: number; month: number } => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  };
};