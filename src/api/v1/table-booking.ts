import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api-client';

// Request interfaces
export interface CreateBookingRequest {
  startTime: string;      // ISO 8601 format
  duration: number;       // Hours (min: 1)
  guests: number;         // Number of guests (min: 1)
  notes?: string;         // Optional booking notes
  tableId: number[];      // Array of table IDs, at least 1 required
  customerName: string;   // 2-100 characters
  customerPhone: string;  // 10-11 digits
}

// Response interfaces
export interface BookedTable {
  tableId: number;
  tableName: string;
  tableType: string;
  deposit: number;        // Deposit for this specific table
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
  expireTime: string;      // Booking expires in 15 minutes if unpaid
  bookedTables: BookedTable[];
}

// Payment status check response interface
export interface BookingPaymentStatusResponse {
  bookingId: number;
  customerName: string;
  customerPhone: string;
  bookingStatus: 'BOOKED' | 'DEPOSIT_PAID' | 'COMPLETED' | 'CANCELLED';
  totalDeposit: number;
  expireTime: string;
  timeStart: string;
  timeEnd: string;
  expired: boolean;  // API uses 'expired' not 'isExpired'
  paymentRequired: boolean;  // API uses 'paymentRequired' not 'isPaymentRequired'
  statusMessage: string;
  minutesUntilExpiry: number;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  payload?: T;
  error?: {
    code: number;
    message: string;
  };
}

// API functions
const createBooking = async (request: CreateBookingRequest): Promise<ApiResponse<CreateBookingResponse>> => {
  const response = await apiClient.post('/booking-table/create', request);
  return response.data;
};

const checkBookingPaymentStatus = async (bookingId: number): Promise<ApiResponse<BookingPaymentStatusResponse>> => {
  const response = await apiClient.get(`/booking-table/check-payment-status/${bookingId}`);
  return response.data;
};

// React Query hooks
export const useCreateBooking = () => {
  return useMutation({
    mutationFn: createBooking,
    onError: (error: unknown) => {
      console.error('Booking creation failed:', error);
    },
  });
};

export const useCheckBookingPaymentStatus = (bookingId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['booking-payment-status', bookingId],
    queryFn: () => checkBookingPaymentStatus(bookingId),
    enabled: enabled && !!bookingId,
    staleTime: 5000,
    refetchInterval: 10000, // Check every 10 seconds
  });
};
