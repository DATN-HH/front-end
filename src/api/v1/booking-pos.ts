import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

// Types
export interface BookingDetail {
    id: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    timeStart: string;
    timeEnd?: string;
    guestCount: number;
    bookingStatus:
        | 'PENDING'
        | 'BOOKED'
        | 'DEPOSIT_PAID'
        | 'CANCELLED'
        | 'COMPLETED';
    note?: string;
    totalDeposit: number;
    expireTime: string;
    tables: Array<{
        tableId: number;
        tableName: string;
        capacity: number;
    }>;
    preOrderItems: Array<{
        productName: string;
        quantity: number;
        note?: string;
        type: 'PRODUCT' | 'VARIANT' | 'COMBO';
    }>;
}

export interface BookingCancelResponse {
    bookingId: number;
    bookingStatus: 'CANCELLED';
    message: string;
}

export interface BookingToPosResponse {
    posOrderId: number;
    orderNumber: string;
    bookingTableId: number;
    totalAmount: number;
    deposit: number;
    remainingAmount: number;
    message: string;
}

// API Service
class BookingPosService {
    private baseURL = '/api/booking-pos';

    // Get booking detail
    async getBookingDetail(bookingId: number): Promise<BookingDetail> {
        const response = await apiClient.get(
            `${this.baseURL}/booking/${bookingId}`
        );

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(
            response.data.message || 'Failed to get booking detail'
        );
    }

    // Cancel booking
    async cancelBooking(bookingId: number): Promise<BookingCancelResponse> {
        const response = await apiClient.put(
            `${this.baseURL}/booking/${bookingId}/cancel`
        );

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to cancel booking');
    }

    // Convert booking to POS order
    async convertBookingToPosOrder(
        bookingTableId: number
    ): Promise<BookingToPosResponse> {
        const response = await apiClient.post(
            `${this.baseURL}/booking/${bookingTableId}/convert-to-pos`
        );

        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(
            response.data.message || 'Failed to convert booking to POS order'
        );
    }
}

const bookingPosService = new BookingPosService();

// React Query hooks
export const useBookingDetail = (bookingId: number | null) => {
    return useQuery({
        queryKey: ['booking-detail', bookingId],
        queryFn: () => bookingPosService.getBookingDetail(bookingId!),
        enabled: !!bookingId,
    });
};

export const useCancelBooking = () => {
    return useMutation({
        mutationFn: (bookingId: number) =>
            bookingPosService.cancelBooking(bookingId),
    });
};

export const useConvertBookingToPos = () => {
    return useMutation({
        mutationFn: (bookingTableId: number) =>
            bookingPosService.convertBookingToPosOrder(bookingTableId),
    });
};

// Utility function to check if booking can be cancelled (>20 minutes late)
export const canCancelBooking = (expireTime: string): boolean => {
    const expireDate = new Date(expireTime);
    const now = new Date();
    const diffInMinutes = (now.getTime() - expireDate.getTime()) / (1000 * 60);
    return diffInMinutes > 20;
};
