import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseListRequest, BaseResponse, PageResponse, Status } from '.';

// ===== ADMIN TABLE RESERVATION TYPES =====
export interface BookingTableResponseDto {
    id: number;
    timeStart: string;
    timeEnd: string;
    guestCount: number;
    bookingStatus: BookingStatus;
    note?: string;
    customerName: string;
    customerPhone: string;
    totalDeposit: number;
    expireTime: string;
    status: Status;
    createdAt: string;
    updatedAt: string;
    bookedTables: BookedTableDto[];
    preOrderIds: number[];
}

export interface BookedTableDto {
    tableId: number;
    tableName: string;
    tableType: string;
    floorName: string;
    deposit: number;
}

export type BookingStatus =
    | 'BOOKED'
    | 'DEPOSIT_PAID'
    | 'COMPLETED'
    | 'CANCELLED';

export interface BookingTableListRequest extends BaseListRequest {
    customerName?: string;
    customerPhone?: string;
    bookingStatus?: BookingStatus;
    timeStart?: string;
    timeEnd?: string;
    branchId?: number;
}

// ===== GUEST BOOKING TYPES =====
export interface CreateBookingRequest {
    startTime: string; // ISO 8601 format
    duration: number; // Hours (min: 1)
    guests: number; // Number of guests (min: 1)
    notes?: string; // Optional booking notes
    tableId: number[]; // Array of table IDs, at least 1 required
    customerName: string; // 2-100 characters
    customerPhone: string; // 10-11 digits
    customerEmail?: string; // Optional email for booking reminders and payment confirmations
}

export interface BookedTable {
    tableId: number;
    tableName: string;
    tableType: string;
    floorName: string;
    deposit: number; // Deposit for this specific table
}

export interface CreateBookingResponse {
    bookingId: number;
    startTime: string;
    endTime: string;
    guests: number;
    notes?: string | null;
    customerName: string;
    customerPhone: string;
    bookingStatus: 'BOOKED' | 'DEPOSIT_PAID' | 'COMPLETED' | 'CANCELLED';
    totalDeposit: number;
    expireTime: string; // Booking expires in 15 minutes if unpaid
    bookedTables: BookedTable[];
}

export interface BookingPaymentStatusResponse {
    bookingId: number;
    customerName: string;
    customerPhone: string;
    bookingStatus: 'BOOKED' | 'DEPOSIT_PAID' | 'COMPLETED' | 'CANCELLED';
    totalDeposit: number;
    expireTime: string;
    timeStart: string;
    timeEnd: string;
    expired: boolean; // API uses 'expired' not 'isExpired'
    paymentRequired: boolean; // API uses 'paymentRequired' not 'isPaymentRequired'
    statusMessage: string;
    minutesUntilExpiry: number;
}

// ===== ADMIN TABLE RESERVATION API CALLS =====
const getBookingTables = async (
    params: BookingTableListRequest
): Promise<PageResponse<BookingTableResponseDto>> => {
    // Build query string manually to ensure proper encoding
    const queryParams = new URLSearchParams();

    // Add basic params
    if (params.page !== undefined)
        queryParams.append('page', params.page.toString());
    if (params.size !== undefined)
        queryParams.append('size', params.size.toString());
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.customerName)
        queryParams.append('customerName', params.customerName);
    if (params.customerPhone)
        queryParams.append('customerPhone', params.customerPhone);
    if (params.bookingStatus)
        queryParams.append('bookingStatus', params.bookingStatus);
    if (params.timeStart) queryParams.append('timeStart', params.timeStart);
    if (params.timeEnd) queryParams.append('timeEnd', params.timeEnd);
    if (params.branchId !== undefined)
        queryParams.append('branchId', params.branchId.toString());

    // Handle searchCondition with proper encoding
    if (params.searchCondition) {
        queryParams.append('searchCondition', params.searchCondition);
    }

    const url = `/booking-table?${queryParams.toString()}`;
    const response =
        await apiClient.get<
            BaseResponse<PageResponse<BookingTableResponseDto>>
        >(url);
    return response.data.payload;
};

// ===== GUEST BOOKING API CALLS =====
const createBooking = async (
    request: CreateBookingRequest
): Promise<BaseResponse<CreateBookingResponse>> => {
    const response = await apiClient.post('/booking-table/create', request);
    return response.data;
};

const checkBookingPaymentStatus = async (
    bookingId: number
): Promise<BaseResponse<BookingPaymentStatusResponse>> => {
    const response = await apiClient.get(
        `/booking-table/check-payment-status/${bookingId}`
    );
    return response.data;
};

// ===== ADMIN BOOKING API CALLS =====
const createAdminBooking = async (
    request: CreateBookingRequest & { paymentType: 'cash' | 'banking' }
): Promise<BaseResponse<CreateBookingResponse>> => {
    const response = await apiClient.post(
        '/booking-table/admin/create',
        request
    );
    return response.data;
};

// ===== ADMIN BOOKING HOOKS =====
export const useCreateAdminBooking = () => {
    return useMutation({
        mutationFn: createAdminBooking,
        onError: (error: unknown) => {
            console.error('Admin booking creation failed:', error);
        },
    });
};

// ===== ADMIN TABLE RESERVATION HOOKS =====
export const useBookingTables = (params: BookingTableListRequest) => {
    return useQuery({
        queryKey: ['booking-tables', params],
        queryFn: () => getBookingTables(params),
    });
};

// ===== GUEST BOOKING HOOKS =====
export const useCreateBooking = () => {
    return useMutation({
        mutationFn: createBooking,
        onError: (error: unknown) => {
            console.error('Booking creation failed:', error);
        },
    });
};

export const useCheckBookingPaymentStatus = (
    bookingId: number,
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ['booking-payment-status', bookingId],
        queryFn: () => checkBookingPaymentStatus(bookingId),
        enabled: enabled && !!bookingId,
        staleTime: 5000,
        refetchInterval: 10000, // Check every 10 seconds
    });
};

export interface GetMyBookingsParams {
    page?: number;
    size?: number;
    bookingStatus?: string;
    timeStart?: string;
    timeEnd?: string;
    branchId?: number;
}

export interface MyBookingResponse {
    id: number;
    timeStart: string;
    timeEnd: string;
    guestCount: number;
    bookingStatus: 'BOOKED' | 'DEPOSIT_PAID' | 'COMPLETED' | 'CANCELLED';
    note: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    totalDeposit: number;
    expireTime: string;
    status: Status;
    bookedTables: BookedTable[];
    preOrderIds: number[];
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
    createdUsername: string;
    updatedUsername: string;
}

export function useMyBookings(params: GetMyBookingsParams) {
    return useQuery({
        queryKey: ['my-bookings', params],
        queryFn: async () => {
            const { data } = await apiClient.get<
                BaseResponse<PageResponse<MyBookingResponse>>
            >('/booking-table/my-bookings', {
                params: {
                    ...params,
                    page: params.page ?? 0,
                    size: params.size ?? 10,
                },
            });
            return data;
        },
    });
}

const getBookingTableDetail = async (
    bookingId: number
): Promise<BookingTableResponseDto> => {
    const response = await apiClient.get<BaseResponse<BookingTableResponseDto>>(
        `/booking-table/${bookingId}`
    );
    return response.data.payload;
};

export const useBookingTableDetail = (bookingId: number) => {
    return useQuery({
        queryKey: ['booking-table-detail', bookingId],
        queryFn: () => getBookingTableDetail(bookingId),
        enabled: !!bookingId,
    });
};

// ===== NEW BOOKING STATUS API =====
export interface BookingStatusResponse {
    bookingStatus:
        | 'PENDING'
        | 'BOOKED'
        | 'DEPOSIT_PAID'
        | 'CANCELLED'
        | 'COMPLETED';
}

const getBookingStatus = async (
    bookingId: number
): Promise<BaseResponse<BookingStatusResponse>> => {
    const response = await apiClient.get(`/booking-table/status/${bookingId}`);
    return response.data;
};

export const useBookingStatus = (
    bookingId: number,
    enabled: boolean = true,
    refetchInterval: number = 5000
) => {
    return useQuery({
        queryKey: ['booking-status', bookingId],
        queryFn: () => getBookingStatus(bookingId),
        enabled: enabled && !!bookingId,
        refetchInterval,
    });
};

// ===== CASH PAYMENT API =====
export interface CashPaymentRequest {
    bookingTableId: number;
    requiredAmount: number;
    givenAmount: number;
}

export interface CashPaymentResponse {
    bookingId: number;
    bookingStatus: string;
    message: string;
    requiredAmount: number;
    givenAmount: number;
    changeAmount: number;
}

const processCashPayment = async (
    request: CashPaymentRequest
): Promise<BaseResponse<CashPaymentResponse>> => {
    const response = await apiClient.post(
        '/booking-table/cash-payment',
        request
    );
    return response.data;
};

export const useCashPayment = () => {
    return useMutation({
        mutationFn: processCashPayment,
        onError: (error: unknown) => {
            console.error('Cash payment processing failed:', error);
        },
    });
};

// ===== ENHANCED CREATE BOOKING RESPONSE WITH PAYMENT INFO =====
export interface EnhancedCreateBookingResponse extends CreateBookingResponse {
    customerEmail?: string | null;
    paymentType?: 'cash' | 'banking';
    paymentUrl?: string;
    qrCode?: string;
    orderCode?: number;
    emailSent?: boolean;
    message?: string;
}
