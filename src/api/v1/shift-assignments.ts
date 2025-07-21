import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Original Shift Assignment Interfaces (keeping for backward compatibility)
export interface ShiftAssignmentSuggestionRequest {
  branchId: number;
  startDate: string; // Format: 'YYYY-MM-DD'
  endDate: string; // Format: 'YYYY-MM-DD'
  shiftIds?: number[]; // Optional: specific shifts to suggest
  excludeStaffIds?: number[]; // Optional: staff to exclude
  useAI?: boolean; // Default: false (use rule-based)
  maxSuggestionsPerShift?: number; // Default: 3
}

export interface StaffSuggestion {
  staffId: number;
  staffName: string;
  roleName: string;
  suitabilityScore: number; // 0.0 to 1.0
  reasonForSuggestion: string;
  warnings: string[]; // Potential issues
  currentWeekShifts: number;
  isAvailable: boolean;
}

export interface ShiftAssignmentSuggestionResponse {
  scheduledShiftId: number;
  shiftId: number;
  shiftName: string;
  date: string; // Format: 'YYYY-MM-DD'
  startTime: string; // Format: 'HH:mm:ss'
  endTime: string; // Format: 'HH:mm:ss'
  suggestedStaff: StaffSuggestion[];
  assignmentReason: string;
}

// New Complete Schedule Interfaces
export interface CompleteScheduleRequest {
  branchId: number;
  startDate: string; // Format: 'YYYY-MM-DD'
  endDate: string; // Format: 'YYYY-MM-DD'
  shiftIds?: number[]; // Optional: specific shifts to suggest
  excludeStaffIds?: number[]; // Optional: staff to exclude
}

export interface StaffAssignment {
  staffId: number;
  staffName: string;
  roleName: string;
  assignmentReason: string;
  weeklyWorkload: number;
  warnings: string[];
  isExisting: boolean; // true = already assigned, false = suggested
}

export interface RoleAssignment {
  roleName: string;
  requiredQuantity: number;
  existingQuantity: number; // Number of staff already assigned
  suggestedQuantity: number; // Number of staff suggested to add
  assignedQuantity: number; // Total (existing + suggested)
  isFullyFilled: boolean;
  assignedStaff: StaffAssignment[];
}

export interface SuggestedAssignment {
  scheduledShiftId: number;
  shiftId: number;
  shiftName: string;
  date: string; // Format: 'YYYY-MM-DD'
  startTime: string; // Format: 'HH:mm'
  endTime: string; // Format: 'HH:mm'
  roleAssignments: RoleAssignment[];
  missingRoles: string[];
}

export interface ScheduleSummary {
  totalShifts: number;
  fullyStaffedShifts: number;
  partiallyStaffedShifts: number;
  unstaffedShifts: number;
  staffWorkloadDistribution: { [staffName: string]: number };
  roleGaps: { [roleName: string]: number };
  scheduleCompleteness: number;
}

export interface CompleteScheduleResponse {
  startDate: string;
  endDate: string;
  branchId: number;
  branchName: string;
  suggestedAssignments: SuggestedAssignment[];
  summary: ScheduleSummary;
  warnings: string[];
}

// New Complete Schedule API call
export const getCompleteScheduleSuggestions = async (
  data: CompleteScheduleRequest
): Promise<CompleteScheduleResponse> => {
  const response = await apiClient.post<BaseResponse<CompleteScheduleResponse>>(
    '/shift-assignments/suggest',
    data
  );
  return response.data.payload;
};

// New Complete Schedule Hook
export const useCompleteScheduleSuggestions = () => {
  return useMutation({
    mutationFn: getCompleteScheduleSuggestions,
  });
};

// Bulk Staff Shift Creation Interfaces
export interface BulkStaffShiftAssignment {
  staffId: number;
  scheduledShiftId: number;
  note?: string;
  shiftStatus?: string;
  referenceId?: string;
}

export interface BulkStaffShiftRequest {
  assignments: BulkStaffShiftAssignment[];
  continueOnError?: boolean;
  defaultStatus?: string;
}

export interface BulkAssignmentResult {
  referenceId?: string;
  staffId: number;
  staffName: string;
  scheduledShiftId: number;
  shiftName: string;
  success: boolean;
  staffShift?: {
    id: number;
    note?: string;
    shiftStatus: string;
    staffId: number;
    scheduledShiftId: number;
    createdAt: string;
  };
  errorMessage?: string;
  errorCode?: string;
  warnings: string[];
}

export interface BulkStaffShiftSummary {
  totalRequested: number;
  successful: number;
  failed: number;
  skipped: number;
  successRate: number;
  processingMessage: string;
}

export interface BulkStaffShiftResponse {
  processedAt: string;
  summary: BulkStaffShiftSummary;
  warnings: string[];
  results: BulkAssignmentResult[];
}

// Bulk Staff Shift Creation API call
const bulkCreateStaffShifts = async (
  data: BulkStaffShiftRequest
): Promise<BulkStaffShiftResponse> => {
  const response = await apiClient.post<BaseResponse<BulkStaffShiftResponse>>(
    '/staff-shifts/bulk-enhanced',
    data
  );
  return response.data.payload;
};

// Bulk Staff Shift Creation Hook
export const useBulkCreateStaffShifts = () => {
  return useMutation({
    mutationFn: bulkCreateStaffShifts,
  });
};
