import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Types
export enum POSSessionStatus {
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED',
}

export enum CashMovementType {
    CASH_IN = 'CASH_IN',
    CASH_OUT = 'CASH_OUT',
}

export interface POSCashMovement {
    id: number;
    type: CashMovementType;
    amount: number;
    reason: string;
    createdAt: string;
    createdBy: string;
}

export interface POSSession {
    id: number;
    sessionNumber: string;
    status: POSSessionStatus;
    openingBalance: number;
    closingBalance?: number;
    expectedCash: number;
    actualCash?: number;
    cashDifference?: number;
    totalSales: number;
    totalOrders: number;
    cashMovements: POSCashMovement[];
    openedAt: string;
    closedAt?: string;
    openedBy: string;
    closedBy?: string;
    closingNotes?: string;
}

export interface POSSessionCreateRequest {
    openingBalance: number;
}

export interface POSSessionCloseRequest {
    actualCash: number;
    closingNotes?: string;
}

export interface POSCashMovementRequest {
    sessionId: number;
    type: CashMovementType;
    amount: number;
    reason: string;
}

export interface POSSessionSummary {
    totalSales: number;
    totalOrders: number;
    cashPayments: number;
    cardPayments: number;
    digitalPayments: number;
    cashMovements: number;
    expectedCash: number;
}

// API calls
const createPOSSession = async (
    data: POSSessionCreateRequest
): Promise<POSSession> => {
    const response = await apiClient.post<BaseResponse<POSSession>>(
        '/api/pos/sessions',
        data
    );
    return response.data.payload;
};

const getCurrentPOSSession = async (): Promise<POSSession | null> => {
    try {
        const response = await apiClient.get<BaseResponse<POSSession>>(
            '/api/pos/sessions/current'
        );
        return response.data.payload;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null; // No active session
        }
        throw error;
    }
};

const closePOSSession = async (
    data: POSSessionCloseRequest
): Promise<POSSession> => {
    const response = await apiClient.post<BaseResponse<POSSession>>(
        '/api/pos/sessions/close',
        data
    );
    return response.data.payload;
};

const createCashMovement = async (
    data: POSCashMovementRequest
): Promise<POSCashMovement> => {
    const response = await apiClient.post<BaseResponse<POSCashMovement>>(
        `/api/pos/sessions/${data.sessionId}/cash-movements`,
        data
    );
    return response.data.payload;
};

const getPOSSessionSummary = async (
    sessionId: number
): Promise<POSSessionSummary> => {
    const response = await apiClient.get<BaseResponse<POSSessionSummary>>(
        `/api/pos/sessions/${sessionId}/summary`
    );
    return response.data.payload;
};

const getPOSSessions = async (): Promise<POSSession[]> => {
    const response =
        await apiClient.get<BaseResponse<POSSession[]>>('/api/pos/sessions');
    return response.data.payload;
};

// Hooks
export const useCreatePOSSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPOSSession,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['pos-session-current'],
            });
            queryClient.invalidateQueries({ queryKey: ['pos-sessions'] });
        },
    });
};

export const useCurrentPOSSession = () => {
    return useQuery({
        queryKey: ['pos-session-current'],
        queryFn: getCurrentPOSSession,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

export const useClosePOSSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: closePOSSession,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['pos-session-current'],
            });
            queryClient.invalidateQueries({ queryKey: ['pos-sessions'] });
        },
    });
};

export const useCreateCashMovement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCashMovement,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['pos-session-current'],
            });
            queryClient.invalidateQueries({
                queryKey: ['pos-session-summary', variables.sessionId],
            });
        },
    });
};

export const usePOSSessionSummary = (sessionId: number) => {
    return useQuery({
        queryKey: ['pos-session-summary', sessionId],
        queryFn: () => getPOSSessionSummary(sessionId),
        enabled: !!sessionId,
    });
};

export const usePOSSessions = () => {
    return useQuery({
        queryKey: ['pos-sessions'],
        queryFn: getPOSSessions,
    });
};
