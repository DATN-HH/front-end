import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BaseResponse } from '.';

// Shift Assignment Interfaces
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

// API calls
export const getShiftAssignmentSuggestions = async (data: ShiftAssignmentSuggestionRequest): Promise<ShiftAssignmentSuggestionResponse[]> => {
  const response = await apiClient.post<BaseResponse<ShiftAssignmentSuggestionResponse[]>>('/shift-assignments/suggest', data);
  return response.data.payload;
};

export const getSuggestedStaffForShift = async (scheduledShiftId: number, branchId: number): Promise<StaffSuggestion[]> => {
  const response = await apiClient.get<BaseResponse<StaffSuggestion[]>>(`/shift-assignments/${scheduledShiftId}/suggest-staff`, {
    params: { branchId }
  });
  return response.data.payload;
};

export const canStaffTakeShift = async (staffId: number, scheduledShiftId: number): Promise<boolean> => {
  const response = await apiClient.get<BaseResponse<boolean>>(`/shift-assignments/staff/${staffId}/can-take-shift/${scheduledShiftId}`);
  return response.data.payload;
};

export const getStaffSuitabilityScore = async (staffId: number, scheduledShiftId: number): Promise<number> => {
  const response = await apiClient.get<BaseResponse<number>>(`/shift-assignments/staff/${staffId}/suitability-score/${scheduledShiftId}`);
  return response.data.payload;
};

// Hooks
export const useShiftAssignmentSuggestions = () => {
  return useMutation({
    mutationFn: getShiftAssignmentSuggestions,
  });
};

export const useSuggestedStaffForShift = (scheduledShiftId: number, branchId: number) => {
  return useQuery({
    queryKey: ['suggested-staff-for-shift', scheduledShiftId, branchId],
    queryFn: () => getSuggestedStaffForShift(scheduledShiftId, branchId),
    enabled: !!scheduledShiftId && !!branchId,
  });
};

export const useCanStaffTakeShift = (staffId: number, scheduledShiftId: number) => {
  return useQuery({
    queryKey: ['can-staff-take-shift', staffId, scheduledShiftId],
    queryFn: () => canStaffTakeShift(staffId, scheduledShiftId),
    enabled: !!staffId && !!scheduledShiftId,
  });
};

export const useStaffSuitabilityScore = (staffId: number, scheduledShiftId: number) => {
  return useQuery({
    queryKey: ['staff-suitability-score', staffId, scheduledShiftId],
    queryFn: () => getStaffSuitabilityScore(staffId, scheduledShiftId),
    enabled: !!staffId && !!scheduledShiftId,
  });
}; 