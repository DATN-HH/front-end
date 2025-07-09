import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';

// Enums
export enum ShiftStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  CONFLICTED = 'CONFLICTED',
  REQUEST_CHANGE = 'REQUEST_CHANGE',
  APPROVED_LEAVE_VALID = 'APPROVED_LEAVE_VALID',
  APPROVED_LEAVE_EXCEEDED = 'APPROVED_LEAVE_EXCEEDED'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum NotificationType {
  SHIFT_ASSIGNED = 'SHIFT_ASSIGNED',
  SHIFT_PUBLISHED = 'SHIFT_PUBLISHED',
  SHIFT_CANCELLED = 'SHIFT_CANCELLED',
  SHIFT_FEEDBACK = 'SHIFT_FEEDBACK',
  SHIFT_REPLACEMENT = 'SHIFT_REPLACEMENT',
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  SWAP_REQUEST = 'SWAP_REQUEST',
  EMERGENCY_SHIFT = 'EMERGENCY_SHIFT',
  SCHEDULE_PUBLISHED = 'SCHEDULE_PUBLISHED',
  GENERAL = 'GENERAL'
}

// Interfaces
export interface PublishShiftsRequest {
  startDate: string;
  endDate: string;
  branchId: number;
}

export interface StaffShiftResponse {
  id: number;
  note: string;
  shiftStatus: ShiftStatus;
  staff: {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  scheduledShift: {
    id: number;
    shiftId: number;
    shiftName: string;
    startTime: string;
    endTime: string;
    date: string;
    branchId: number;
    branchName: string;
  };
}

export interface PublishShiftsResponse {
  totalShifts: number;
  publishedShifts: number;
  publishedAt: string;
  message: string;
  staffShifts: StaffShiftResponse[];
}

export interface StaffResponseRequest {
  staffShiftId: number;
  responseStatus: RequestStatus;
  reason?: string;
}

export interface StaffShiftFeedback {
  id: number;
  staffShiftId: number;
  staffId: number;
  staffName: string;
  responseStatus: RequestStatus;
  reason?: string;
  responseDate?: string;
  publishedDate: string;
  deadline: string;
  staffShift: {
    id: number;
    note: string;
    shiftStatus: ShiftStatus;
    scheduledShift: {
      id: number;
      date: string;
      shiftName: string;
      startTime: string;
      endTime: string;
    };
  };
}

// API Functions
export const publishShifts = async (data: PublishShiftsRequest): Promise<PublishShiftsResponse> => {
  const response = await apiClient.post('/publish-shifts', data);
  return response.data.payload;
};

export const respondToShift = async (data: StaffResponseRequest): Promise<StaffShiftFeedback> => {
  const response = await apiClient.post('/publish-shifts/respond', data);
  return response.data.payload;
};

export const getMyPendingShifts = async (): Promise<StaffShiftFeedback[]> => {
  const response = await apiClient.get('/publish-shifts/my-pending-shifts');
  return response.data.payload;
};

export const replaceStaff = async (feedbackId: number, replacementStaffId: number): Promise<string> => {
  const response = await apiClient.post(`/publish-shifts/replace-staff/${feedbackId}/${replacementStaffId}`);
  return response.data.payload;
};

// React Query Hooks
export const usePublishShifts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishShifts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['pending-feedbacks'] });
    },
  });
};

export const useRespondToShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: respondToShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pending-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['staff-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['pending-feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['rejected-feedbacks'] });
    },
  });
};

export const useMyPendingShifts = () => {
  return useQuery({
    queryKey: ['my-pending-shifts'],
    queryFn: getMyPendingShifts,
  });
};

export const useReplaceStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feedbackId, replacementStaffId }: { feedbackId: number; replacementStaffId: number }) =>
      replaceStaff(feedbackId, replacementStaffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejected-feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['pending-feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['staff-shifts'] });
    },
  });
};