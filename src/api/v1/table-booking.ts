import { useMutation } from '@tanstack/react-query';
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

// API function
const createBooking = async (request: CreateBookingRequest): Promise<ApiResponse<CreateBookingResponse>> => {
  const response = await apiClient.post('/booking-table/create', request);
  return response.data;
};

// React Query hook
export const useCreateBooking = () => {
  return useMutation({
    mutationFn: createBooking,
    onError: (error: unknown) => {
      console.error('Booking creation failed:', error);
    },
  });
};
