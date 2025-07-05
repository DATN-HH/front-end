import { apiClient } from '@/services/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  PinUpdateRequest,
  AdminPinUpdateRequest,
  PinStatusResponse,
  PinValidationResponse,
  TempPinResponse,
  ApiResponse,
} from './types';

// ========== API Functions ==========

// Update user's own PIN
export const updateUserPin = async (userId: number, data: PinUpdateRequest): Promise<void> => {
  const response = await apiClient.put<ApiResponse<void>>(
    `/api/pos/pin/update?userId=${userId}`,
    data
  );
  return response.data.data;
};

// Admin update user PIN
export const adminUpdateUserPin = async (adminUserId: number, data: AdminPinUpdateRequest): Promise<void> => {
  const response = await apiClient.put<ApiResponse<void>>(
    `/api/pos/pin/admin/update?adminUserId=${adminUserId}`,
    data
  );
  return response.data.data;
};

// Admin reset user PIN (generates temporary PIN)
export const adminResetUserPin = async (adminUserId: number, targetUserId: number): Promise<TempPinResponse> => {
  const response = await apiClient.post<ApiResponse<TempPinResponse>>(
    `/api/pos/pin/admin/reset?adminUserId=${adminUserId}&targetUserId=${targetUserId}`
  );
  return response.data.data;
};

// Check if user has PIN set
export const checkUserHasPin = async (userId: number): Promise<PinStatusResponse> => {
  const response = await apiClient.get<ApiResponse<PinStatusResponse>>(
    `/api/pos/pin/has-pin?userId=${userId}`
  );
  return response.data.data;
};

// Validate PIN
export const validateUserPin = async (userId: number, pin: string): Promise<PinValidationResponse> => {
  const response = await apiClient.post<ApiResponse<PinValidationResponse>>(
    `/api/pos/pin/validate?userId=${userId}&pin=${pin}`
  );
  return response.data.data;
};

// Set initial PIN
export const setInitialPin = async (userId: number, pin: string): Promise<void> => {
  const response = await apiClient.post<ApiResponse<void>>(
    `/api/pos/pin/set-initial?userId=${userId}&pin=${pin}`
  );
  return response.data.data;
};

// ========== React Query Hooks ==========

export const useUpdateUserPin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: PinUpdateRequest }) =>
      updateUserPin(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pinStatus'] });
    },
  });
};

export const useAdminUpdateUserPin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ adminUserId, data }: { adminUserId: number; data: AdminPinUpdateRequest }) =>
      adminUpdateUserPin(adminUserId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pinStatus'] });
    },
  });
};

export const useAdminResetUserPin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ adminUserId, targetUserId }: { adminUserId: number; targetUserId: number }) =>
      adminResetUserPin(adminUserId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pinStatus'] });
    },
  });
};

export const useCheckUserHasPin = (userId: number) => {
  return useQuery({
    queryKey: ['pinStatus', userId],
    queryFn: () => checkUserHasPin(userId),
    enabled: !!userId,
  });
};

export const useValidateUserPin = () => {
  return useMutation({
    mutationFn: ({ userId, pin }: { userId: number; pin: string }) =>
      validateUserPin(userId, pin),
  });
};

export const useSetInitialPin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, pin }: { userId: number; pin: string }) =>
      setInitialPin(userId, pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pinStatus'] });
    },
  });
};