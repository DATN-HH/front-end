import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Types
export interface ShiftLeaveRequest {
    startDate: string;
    endDate: string;
    shiftIds: number[];
    reason: string;
}

export interface ShiftLeaveRequestForEmployee {
    employeeId: number;
    startDate: string;
    endDate: string;
    shiftIds: number[];
    reason: string;
}

export interface ShiftLeaveRequestDto {
    id: number;
    employee: {
        id: number;
        username: string;
        fullName: string;
        email: string;
        phone?: string;
    };
    startDate: string;
    endDate: string;
    requestStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason: string;
    managerNote?: string;
    approvedBy?: {
        id: number;
        fullName: string;
        username?: string;
    };
    approvedAt?: string;
    isManagerAdded: boolean;
    affectedShiftsCount: number;
    requestedShifts: {
        id: number;
        name: string;
        startTime: string;
        endTime: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface ShiftLeaveBalanceDto {
    id: number;
    user: {
        id: number;
        username: string;
        fullName: string;
        email: string;
        phone?: string;
    };
    year: number;
    totalShifts: number;
    usedShifts: number;
    bonusShifts: number;
    availableShifts: number;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateShiftLeaveBalanceRequest {
    year: number;
    bonusShifts: number;
    reason: string;
}

export interface ApproveRejectRequest {
    requestStatus: 'APPROVED' | 'REJECTED';
    managerNote: string;
}

// API calls
const createShiftLeaveRequest = async (
    data: ShiftLeaveRequest
): Promise<ShiftLeaveRequestDto> => {
    const response = await apiClient.post<BaseResponse<ShiftLeaveRequestDto>>(
        '/shift-leave-management/requests',
        data
    );
    return response.data.payload;
};

const getMyShiftLeaveRequests = async (
    year?: number
): Promise<ShiftLeaveRequestDto[]> => {
    const response = await apiClient.get<BaseResponse<ShiftLeaveRequestDto[]>>(
        '/shift-leave-management/my-requests',
        {
            params: { year },
        }
    );
    return response.data.payload;
};

const cancelShiftLeaveRequest = async (requestId: number): Promise<null> => {
    const response = await apiClient.delete<BaseResponse<null>>(
        `/shift-leave-management/requests/${requestId}`
    );
    return response.data.payload;
};

const getMyShiftLeaveBalance = async (
    year?: number
): Promise<ShiftLeaveBalanceDto> => {
    const response = await apiClient.get<BaseResponse<ShiftLeaveBalanceDto>>(
        '/shift-leave-management/my-balance',
        {
            params: { year },
        }
    );
    return response.data.payload;
};

const getPendingShiftLeaveRequests = async (
    branchId: number
): Promise<ShiftLeaveRequestDto[]> => {
    const response = await apiClient.get<BaseResponse<ShiftLeaveRequestDto[]>>(
        '/shift-leave-management/pending-requests',
        {
            params: { branchId },
        }
    );
    return response.data.payload;
};

const approveRejectShiftLeaveRequest = async (
    requestId: number,
    data: ApproveRejectRequest
): Promise<ShiftLeaveRequestDto> => {
    const response = await apiClient.put<BaseResponse<ShiftLeaveRequestDto>>(
        `/shift-leave-management/requests/${requestId}/approve-reject`,
        data
    );
    return response.data.payload;
};

const getAllShiftLeaveRequests = async (
    branchId: number,
    year?: number
): Promise<ShiftLeaveRequestDto[]> => {
    const response = await apiClient.get<BaseResponse<ShiftLeaveRequestDto[]>>(
        '/shift-leave-management/all-requests',
        {
            params: { branchId, year },
        }
    );
    return response.data.payload;
};

const addShiftLeaveForEmployee = async (
    data: ShiftLeaveRequestForEmployee
): Promise<ShiftLeaveRequestDto> => {
    const response = await apiClient.post<BaseResponse<ShiftLeaveRequestDto>>(
        '/shift-leave-management/requests/add-for-employee',
        data
    );
    return response.data.payload;
};

const updateShiftLeaveBalance = async (
    userId: number,
    data: UpdateShiftLeaveBalanceRequest
): Promise<ShiftLeaveBalanceDto> => {
    const response = await apiClient.put<BaseResponse<ShiftLeaveBalanceDto>>(
        `/shift-leave-management/balance/${userId}`,
        data
    );
    return response.data.payload;
};

const getBranchShiftLeaveBalances = async (
    branchId: number,
    year?: number
): Promise<ShiftLeaveBalanceDto[]> => {
    const response = await apiClient.get<BaseResponse<ShiftLeaveBalanceDto[]>>(
        '/shift-leave-management/branch-balances',
        {
            params: { branchId, year },
        }
    );
    return response.data.payload;
};

const getLowBalanceEmployees = async (
    branchId: number,
    year?: number,
    threshold?: number
): Promise<ShiftLeaveBalanceDto[]> => {
    const response = await apiClient.get<BaseResponse<ShiftLeaveBalanceDto[]>>(
        '/shift-leave-management/low-balance-employees',
        {
            params: { branchId, year, threshold },
        }
    );
    return response.data.payload;
};

// Hooks
export const useCreateShiftLeaveRequest = () => {
    return useMutation({
        mutationFn: createShiftLeaveRequest,
    });
};

export const useMyShiftLeaveRequests = (year?: number) => {
    return useQuery({
        queryKey: ['my-shift-leave-requests', year],
        queryFn: () => getMyShiftLeaveRequests(year),
    });
};

export const useCancelShiftLeaveRequest = () => {
    return useMutation({
        mutationFn: cancelShiftLeaveRequest,
    });
};

export const useMyShiftLeaveBalance = (year?: number) => {
    return useQuery({
        queryKey: ['my-shift-leave-balance', year],
        queryFn: () => getMyShiftLeaveBalance(year),
    });
};

export const usePendingShiftLeaveRequests = (branchId: number) => {
    return useQuery({
        queryKey: ['pending-shift-leave-requests', branchId],
        queryFn: () => getPendingShiftLeaveRequests(branchId),
        enabled: !!branchId,
    });
};

export const useApproveRejectShiftLeaveRequest = () => {
    return useMutation({
        mutationFn: ({
            requestId,
            data,
        }: {
            requestId: number;
            data: ApproveRejectRequest;
        }) => approveRejectShiftLeaveRequest(requestId, data),
    });
};

export const useAllShiftLeaveRequests = (branchId: number, year?: number) => {
    return useQuery({
        queryKey: ['all-shift-leave-requests', branchId, year],
        queryFn: () => getAllShiftLeaveRequests(branchId, year),
        enabled: !!branchId,
    });
};

export const useAddShiftLeaveForEmployee = () => {
    return useMutation({
        mutationFn: addShiftLeaveForEmployee,
    });
};

export const useUpdateShiftLeaveBalance = () => {
    return useMutation({
        mutationFn: ({
            userId,
            data,
        }: {
            userId: number;
            data: UpdateShiftLeaveBalanceRequest;
        }) => updateShiftLeaveBalance(userId, data),
    });
};

export const useBranchShiftLeaveBalances = (
    branchId: number,
    year?: number
) => {
    return useQuery({
        queryKey: ['branch-shift-leave-balances', branchId, year],
        queryFn: () => getBranchShiftLeaveBalances(branchId, year),
        enabled: !!branchId,
    });
};

export const useLowBalanceEmployees = (
    branchId: number,
    year?: number,
    threshold?: number
) => {
    return useQuery({
        queryKey: ['low-balance-employees', branchId, year, threshold],
        queryFn: () => getLowBalanceEmployees(branchId, year, threshold),
        enabled: !!branchId,
    });
};
