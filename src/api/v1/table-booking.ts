import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
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
}

export interface BookedTableDto {
  tableId: number;
  tableName: string;
  tableType: string;
  floorName: string;
  deposit: number;
}

export type BookingStatus = 'BOOKED' | 'DEPOSIT_PAID' | 'COMPLETED' | 'CANCELLED';

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
  startTime: string;      // ISO 8601 format
  duration: number;       // Hours (min: 1)
  guests: number;         // Number of guests (min: 1)
  notes?: string;         // Optional booking notes
  tableId: number[];      // Array of table IDs, at least 1 required
  customerName: string;   // 2-100 characters
  customerPhone: string;  // 10-11 digits
}

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

// ===== ADMIN TABLE RESERVATION API CALLS =====
export const getBookingTables = async (params: BookingTableListRequest): Promise<PageResponse<BookingTableResponseDto>> => {
  // Build query string manually to ensure proper encoding
  const queryParams = new URLSearchParams();
  
  // Add basic params
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.customerName) queryParams.append('customerName', params.customerName);
  if (params.customerPhone) queryParams.append('customerPhone', params.customerPhone);
  if (params.bookingStatus) queryParams.append('bookingStatus', params.bookingStatus);
  if (params.timeStart) queryParams.append('timeStart', params.timeStart);
  if (params.timeEnd) queryParams.append('timeEnd', params.timeEnd);
  if (params.branchId !== undefined) queryParams.append('branchId', params.branchId.toString());
  
  // Handle searchCondition with proper encoding
  if (params.searchCondition) {
    queryParams.append('searchCondition', params.searchCondition);
  }
  
  const url = `/booking-table?${queryParams.toString()}`;
  const response = await apiClient.get<BaseResponse<PageResponse<BookingTableResponseDto>>>(url);
  return response.data.payload;
};

// ===== GUEST BOOKING API CALLS =====
const createBooking = async (request: CreateBookingRequest): Promise<ApiResponse<CreateBookingResponse>> => {
  const response = await apiClient.post('/booking-table/create', request);
  return response.data;
};

const checkBookingPaymentStatus = async (bookingId: number): Promise<ApiResponse<BookingPaymentStatusResponse>> => {
  const response = await apiClient.get(`/booking-table/check-payment-status/${bookingId}`);
  return response.data;
};

// ===== ADMIN BOOKING API CALLS =====
const createAdminBooking = async (request: CreateBookingRequest & { paymentType: 'cash' | 'banking' }): Promise<ApiResponse<CreateBookingResponse>> => {
  const response = await apiClient.post('/booking-table/admin/create', request);
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

export const useCheckBookingPaymentStatus = (bookingId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['booking-payment-status', bookingId],
    queryFn: () => checkBookingPaymentStatus(bookingId),
    enabled: enabled && !!bookingId,
    staleTime: 5000,
    refetchInterval: 10000, // Check every 10 seconds
  });
};
