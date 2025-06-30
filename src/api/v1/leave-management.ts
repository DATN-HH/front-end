import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api-client';

// Enums
export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  EMERGENCY = 'EMERGENCY',
  MATERNITY = 'MATERNITY',
  PERSONAL = 'PERSONAL',
  UNPAID = 'UNPAID'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum LeaveDuration {
  FULL_DAY = 'FULL_DAY',
  MORNING_HALF = 'MORNING_HALF',
  AFTERNOON_HALF = 'AFTERNOON_HALF'
}

// Interfaces
export interface LeaveRequest {
  id: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  leaveDuration: LeaveDuration;
  reason: string;
  status: LeaveStatus;
  totalDays: number;
  employeeId: number;
  employeeName: string;
  isOverBalance: boolean;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  approvedByName?: string;
}

export interface LeaveBalance {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  year: number;
  annualLeaveDays: number;
  usedDays: number;
  carriedOverDays: number;
  bonusDays: number;
  remainingDays: number;
  totalAllocatedDays: number;
  branchName: string;
  branchId: number;
}

export interface SubmitLeaveRequestDto {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  leaveDuration: LeaveDuration;
  reason: string;
}

export interface AddLeaveForEmployeeDto {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  leaveDuration: LeaveDuration;
  reason: string;
  employeeId: number;
}

export interface ApproveRejectLeaveDto {
  leaveRequestId: number;
  status: LeaveStatus.APPROVED | LeaveStatus.REJECTED;
  rejectionReason?: string;
}

export interface UpdateLeaveBalanceDto {
  userId: number;
  year: number;
  bonusDays: number;
  reason: string;
}

export interface LeaveStatistics {
  year: number;
  branchId: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  totalLeaveRequests: number;
  averageUsedDays: number;
  maxUsedDays: number;
  minUsedDays: number;
}

// Employee API Functions
const submitLeaveRequest = async (data: SubmitLeaveRequestDto): Promise<LeaveRequest> => {
  const response = await apiClient.post('/leave-management/requests', data);
  return response.data.payload;
};

const cancelLeaveRequest = async (id: number): Promise<void> => {
  await apiClient.put(`/leave-management/requests/${id}/cancel`);
};

const getMyLeaveRequests = async (year?: number): Promise<LeaveRequest[]> => {
  const response = await apiClient.get(`/leave-management/my-requests${year ? `?year=${year}` : ''}`);
  return response.data.payload;
};

const getMyLeaveBalance = async (year?: number): Promise<LeaveBalance> => {
  const response = await apiClient.get(`/leave-management/my-balance${year ? `?year=${year}` : ''}`);
  return response.data.payload;
};

// Manager API Functions
const getPendingLeaveRequests = async (branchId: number): Promise<LeaveRequest[]> => {
  const response = await apiClient.get(`/leave-management/branches/${branchId}/pending-requests`);
  return response.data.payload;
};

const approveRejectLeaveRequest = async (data: ApproveRejectLeaveDto): Promise<void> => {
  await apiClient.put('/leave-management/requests/approve-reject', data);
};

const addLeaveForEmployee = async (data: AddLeaveForEmployeeDto): Promise<LeaveRequest> => {
  const response = await apiClient.post('/leave-management/requests/add-for-employee', data);
  return response.data.payload;
};

const updateEmployeeLeaveBalance = async (data: UpdateLeaveBalanceDto): Promise<void> => {
  await apiClient.put(`/leave-management/balances/update?userId=${data.userId}&year=${data.year}&bonusDays=${data.bonusDays}&reason=${encodeURIComponent(data.reason)}`);
};

const getLowBalanceEmployees = async (branchId: number, threshold: number = 2.0): Promise<LeaveBalance[]> => {
  const response = await apiClient.get(`/leave-management/branches/${branchId}/low-balance?threshold=${threshold}`);
  return response.data.payload;
};

const getBranchLeaveStatistics = async (branchId: number, year?: number): Promise<LeaveStatistics> => {
  const response = await apiClient.get(`/leave-management/branches/${branchId}/statistics${year ? `?year=${year}` : ''}`);
  return response.data.payload;
};

const getAllLeaveRequests = async (branchId: number, year?: number): Promise<LeaveRequest[]> => {
  const response = await apiClient.get(`/leave-management/branches/${branchId}/requests${year ? `?year=${year}` : ''}`);
  return response.data.payload;
};

// Employee Hooks
export const useSubmitLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaveBalance'] });
    },
  });
};

export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaveBalance'] });
    },
  });
};

export const useMyLeaveRequests = (year?: number) => {
  return useQuery({
    queryKey: ['myLeaveRequests', year],
    queryFn: () => getMyLeaveRequests(year),
  });
};

export const useMyLeaveBalance = (year?: number) => {
  return useQuery({
    queryKey: ['myLeaveBalance', year],
    queryFn: () => getMyLeaveBalance(year),
  });
};

// Manager Hooks
export const usePendingLeaveRequests = (branchId: number) => {
  return useQuery({
    queryKey: ['pendingLeaveRequests', branchId],
    queryFn: () => getPendingLeaveRequests(branchId),
    enabled: !!branchId,
  });
};

export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId: number) => approveRejectLeaveRequest({
      leaveRequestId: requestId,
      status: LeaveStatus.APPROVED,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['branchLeaveBalances'] });
      queryClient.invalidateQueries({ queryKey: ['branchLeaveStatistics'] });
    },
  });
};

export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number; reason: string }) => 
      approveRejectLeaveRequest({
        leaveRequestId: requestId,
        status: LeaveStatus.REJECTED,
        rejectionReason: reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['branchLeaveBalances'] });
      queryClient.invalidateQueries({ queryKey: ['branchLeaveStatistics'] });
    },
  });
};

export const useAddLeaveForEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addLeaveForEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLeaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['branchLeaveBalances'] });
      queryClient.invalidateQueries({ queryKey: ['branchLeaveStatistics'] });
    },
  });
};

export const useUpdateEmployeeLeaveBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateEmployeeLeaveBalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branchLeaveBalances'] });
    },
  });
};

export const useLowBalanceEmployees = (branchId: number, threshold: number = 2.0) => {
  return useQuery({
    queryKey: ['lowBalanceEmployees', branchId, threshold],
    queryFn: () => getLowBalanceEmployees(branchId, threshold),
    enabled: !!branchId,
  });
};

export const useBranchLeaveStatistics = (branchId: number, year?: number) => {
  return useQuery({
    queryKey: ['branchLeaveStatistics', branchId, year],
    queryFn: () => getBranchLeaveStatistics(branchId, year),
    enabled: !!branchId,
  });
};

export const useAllLeaveRequests = (branchId: number, year?: number) => {
  return useQuery({
    queryKey: ['allLeaveRequests', branchId, year],
    queryFn: () => getAllLeaveRequests(branchId, year),
    enabled: !!branchId,
  });
};

// Helper functions
export const getLeaveTypeLabel = (type: LeaveType): string => {
  switch (type) {
    case LeaveType.ANNUAL: return 'Annual Leave';
    case LeaveType.SICK: return 'Sick Leave';
    case LeaveType.EMERGENCY: return 'Emergency Leave';
    case LeaveType.MATERNITY: return 'Maternity Leave';
    case LeaveType.PERSONAL: return 'Personal Leave';
    case LeaveType.UNPAID: return 'Unpaid Leave';
    default: return type;
  }
};

export const getLeaveDurationLabel = (duration: LeaveDuration): string => {
  switch (duration) {
    case LeaveDuration.FULL_DAY: return 'Full Day';
    case LeaveDuration.MORNING_HALF: return 'Morning Half Day';
    case LeaveDuration.AFTERNOON_HALF: return 'Afternoon Half Day';
    default: return duration;
  }
};

export const getLeaveStatusLabel = (status: LeaveStatus): string => {
  switch (status) {
    case LeaveStatus.PENDING: return 'Pending';
    case LeaveStatus.APPROVED: return 'Approved';
    case LeaveStatus.REJECTED: return 'Rejected';
    case LeaveStatus.CANCELLED: return 'Cancelled';
    default: return status;
  }
};

export const getStatusColor = (status: LeaveStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case LeaveStatus.APPROVED: return 'default';
    case LeaveStatus.PENDING: return 'secondary';
    case LeaveStatus.REJECTED: return 'destructive';
    case LeaveStatus.CANCELLED: return 'outline';
    default: return 'outline';
  }
}; 