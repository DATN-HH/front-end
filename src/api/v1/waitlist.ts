import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse, PageResponse } from '.';

// ===== WAITLIST TYPES =====
export type WaitlistStatus =
    | 'ACTIVE' // Đang chờ xử lý
    | 'NOTIFIED' // Đã thông báo có bàn, chờ thanh toán
    | 'CONVERTED' // Đã chuyển thành booking thành công
    | 'EXPIRED' // Hết hạn chờ
    | 'CANCELLED'; // Đã hủy

export interface CreateWaitlistRequest {
    preferredStartTime: string; // ISO 8601 format
    preferredEndTime: string; // ISO 8601 format
    duration: number; // Hours (1-6)
    guestCount: number; // Number of guests (1-20)
    customerName: string; // 2-100 characters
    customerPhone: string; // Valid phone format
    customerEmail: string; // Valid email format
    notes?: string; // Optional, max 500 chars
    maxWaitHours: number; // 1-24 hours
    branchId: number; // Branch ID where waitlist is created
}

export interface WaitlistResponseDto {
    // Base Entity Fields
    createdAt: string;
    createdBy: number | null;
    updatedAt: string;
    updatedBy: number | null;
    status: 'ACTIVE' | 'DELETED';
    createdUsername: string;
    updatedUsername: string;

    // Waitlist Specific Fields
    id: number;
    preferredStartTime: string;
    preferredEndTime: string;
    duration: number;
    guestCount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes: string | null;
    maxWaitHours: number;
    notificationSent: boolean;
    bookingCreatedId: number | null;
    expiresAt: string;
    waitlistStatus: WaitlistStatus;
    estimatedWaitTime: number; // minutes
    timeRemaining: string; // human readable
}

export interface CreateWaitlistResponse {
    waitlistId: number;
    preferredStartTime: string;
    preferredEndTime: string;
    duration: number;
    guestCount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes: string | null;
    maxWaitHours: number;
    expiresAt: string;
    waitlistStatus: WaitlistStatus;
    estimatedWaitTime: number;
    message: string;
}

export interface WaitlistListRequest {
    page?: number; // 0-based
    size?: number; // default 20
    keyword?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    waitlistStatus?: WaitlistStatus;
    guestCount?: number;
    duration?: number;
    branchId?: number; // Filter by branch
}

// ===== API FUNCTIONS =====
const createWaitlist = async (
    request: CreateWaitlistRequest
): Promise<BaseResponse<CreateWaitlistResponse>> => {
    const response = await apiClient.post('/waitlist/create', request);
    return response.data;
};

const getWaitlistById = async (
    id: number
): Promise<BaseResponse<WaitlistResponseDto>> => {
    const response = await apiClient.get(`/waitlist/${id}`);
    return response.data;
};

const getWaitlistList = async (
    params: WaitlistListRequest = {}
): Promise<BaseResponse<PageResponse<WaitlistResponseDto>>> => {
    const response = await apiClient.get('/waitlist', { params });
    return response.data;
};

const cancelWaitlist = async (id: number): Promise<BaseResponse<string>> => {
    const response = await apiClient.put(`/waitlist/${id}/cancel`);
    return response.data;
};

const processWaitlist = async (): Promise<BaseResponse<string>> => {
    const response = await apiClient.post('/waitlist/process', {});
    return response.data;
};

const cleanupWaitlist = async (): Promise<BaseResponse<string>> => {
    const response = await apiClient.post('/waitlist/cleanup', {});
    return response.data;
};

// ===== HOOKS =====

// Create waitlist
export const useCreateWaitlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createWaitlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        },
        onError: (error: unknown) => {
            console.error('Waitlist creation failed:', error);
        },
    });
};

// Get waitlist by ID
export const useWaitlistById = (id: number | null, enabled = true) => {
    return useQuery({
        queryKey: ['waitlist', id],
        queryFn: () => getWaitlistById(id!),
        enabled: enabled && !!id,
    });
};

// Get waitlist list
export const useWaitlistList = (params: WaitlistListRequest = {}) => {
    return useQuery({
        queryKey: ['waitlist', 'list', params],
        queryFn: () => getWaitlistList(params),
        staleTime: 0, // Always consider data stale to enable refresh
        refetchOnWindowFocus: true,
    });
};

// Cancel waitlist
export const useCancelWaitlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelWaitlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        },
        onError: (error: unknown) => {
            console.error('Waitlist cancellation failed:', error);
        },
    });
};

// Process waitlist (Admin)
export const useProcessWaitlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: processWaitlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        },
        onError: (error: unknown) => {
            console.error('Waitlist processing failed:', error);
        },
    });
};

// Cleanup waitlist (Admin)
export const useCleanupWaitlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cleanupWaitlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        },
        onError: (error: unknown) => {
            console.error('Waitlist cleanup failed:', error);
        },
    });
};

// ===== UTILITY FUNCTIONS =====
export const getStatusColor = (status: WaitlistStatus): string => {
    switch (status) {
        case 'ACTIVE':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'NOTIFIED':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'CONVERTED':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'EXPIRED':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'CANCELLED':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const getStatusIcon = (status: WaitlistStatus): string => {
    switch (status) {
        case 'ACTIVE':
            return '🟡';
        case 'NOTIFIED':
            return '🔵';
        case 'CONVERTED':
            return '🟢';
        case 'EXPIRED':
            return '🔴';
        case 'CANCELLED':
            return '⚫';
        default:
            return '❓';
    }
};

export const getStatusDisplayName = (status: WaitlistStatus): string => {
    switch (status) {
        case 'ACTIVE':
            return 'Active';
        case 'NOTIFIED':
            return 'Notified';
        case 'CONVERTED':
            return 'Converted';
        case 'EXPIRED':
            return 'Expired';
        case 'CANCELLED':
            return 'Cancelled';
        default:
            return 'Unknown';
    }
};

export const formatWaitTime = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours} hours`;
};

export const validateWaitlistForm = (data: Partial<CreateWaitlistRequest>) => {
    const errors: Record<string, string> = {};

    if (!data.customerName?.trim()) {
        errors.customerName = 'Customer name is required';
    } else if (data.customerName.length < 2 || data.customerName.length > 100) {
        errors.customerName = 'Customer name must be 2-100 characters';
    }

    if (!data.customerPhone?.trim()) {
        errors.customerPhone = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(data.customerPhone.replace(/\s/g, ''))) {
        errors.customerPhone = 'Invalid phone number format';
    }

    if (!data.customerEmail?.trim()) {
        errors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
        errors.customerEmail = 'Invalid email format';
    }

    if (!data.preferredStartTime) {
        errors.preferredStartTime = 'Start time is required';
    } else {
        const startDate = new Date(data.preferredStartTime);
        const now = new Date();
        // Add 1 minute buffer to avoid timing issues
        const minTime = new Date(now.getTime() + 60 * 1000);

        if (isNaN(startDate.getTime())) {
            errors.preferredStartTime = 'Invalid start time format';
        } else if (startDate <= minTime) {
            errors.preferredStartTime =
                'Start time must be at least 1 minute in the future';
        }
    }

    if (!data.preferredEndTime) {
        errors.preferredEndTime = 'End time is required';
    } else if (data.preferredStartTime) {
        const startDate = new Date(data.preferredStartTime);
        const endDate = new Date(data.preferredEndTime);

        if (isNaN(endDate.getTime())) {
            errors.preferredEndTime = 'Invalid end time format';
        } else if (endDate <= startDate) {
            errors.preferredEndTime = 'End time must be after start time';
        }
    }

    if (!data.guestCount || data.guestCount < 1 || data.guestCount > 20) {
        errors.guestCount = 'Guest count must be 1-20 people';
    }

    if (!data.duration || data.duration < 1 || data.duration > 6) {
        errors.duration = 'Duration must be 1-6 hours';
    }

    if (!data.maxWaitHours || data.maxWaitHours < 1 || data.maxWaitHours > 24) {
        errors.maxWaitHours = 'Max wait time must be 1-24 hours';
    }

    if (data.notes && data.notes.length > 500) {
        errors.notes = 'Notes cannot exceed 500 characters';
    }

    if (!data.branchId || data.branchId < 1) {
        errors.branchId = 'Branch is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
