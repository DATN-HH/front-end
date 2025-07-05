import { apiClient } from '@/services/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  PosApiResponse,
  PosUser,
  PosSession,
  PosLoginRequest,
  PosLoginResponse,
  EmployeeSwitchRequest,
} from './types';

// ========== API Functions ==========

// Get available employees for POS login
export const getPosEmployees = async (): Promise<PosUser[]> => {
  const response = await apiClient.get<PosApiResponse<PosUser[]>>('/api/pos/auth/employees');
  return response.data.data;
};

// Login with PIN
export const posLogin = async (data: PosLoginRequest): Promise<PosLoginResponse> => {
  const response = await apiClient.post<PosApiResponse<PosLoginResponse>>(
    '/api/pos/auth/login',
    data
  );
  return response.data.data;
};

// Get current POS session
export const getCurrentPosSession = async (): Promise<PosSession> => {
  const response = await apiClient.get<PosApiResponse<PosSession>>('/api/pos/auth/session');
  return response.data.data;
};

// Switch to different user
export const switchPosUser = async (data: EmployeeSwitchRequest): Promise<PosLoginResponse> => {
  const response = await apiClient.post<PosApiResponse<PosLoginResponse>>(
    '/api/pos/auth/switch-user',
    data
  );
  return response.data.data;
};

// Lock current session
export const lockPosSession = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<PosApiResponse<{ success: boolean; message: string }>>(
    '/api/pos/auth/lock'
  );
  return response.data.data;
};

// Unlock session with PIN
export const unlockPosSession = async (pin: string): Promise<PosLoginResponse> => {
  const response = await apiClient.post<PosApiResponse<PosLoginResponse>>(
    '/api/pos/auth/unlock',
    { pin }
  );
  return response.data.data;
};

// Logout from POS
export const posLogout = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<PosApiResponse<{ success: boolean; message: string }>>(
    '/api/pos/auth/logout'
  );
  return response.data.data;
};

// Verify PIN for user
export const verifyUserPin = async (userId: number, pin: string): Promise<{ valid: boolean }> => {
  const response = await apiClient.post<PosApiResponse<{ valid: boolean }>>(
    '/api/pos/auth/verify-pin',
    { userId, pin }
  );
  return response.data.data;
};

// ========== React Query Hooks ==========

// Get available employees
export const usePosEmployees = () => {
  return useQuery({
    queryKey: ['pos', 'employees'],
    queryFn: getPosEmployees,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get current session
export const useCurrentPosSession = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['pos', 'session'],
    queryFn: () => {
      // Check if we have cached session data first
      const cachedSession = queryClient.getQueryData(['pos', 'session']);
      if (cachedSession) {
        return Promise.resolve(cachedSession);
      }
      // Only call API if no cached data
      return getCurrentPosSession();
    },
    retry: false,
    staleTime: 1000, // 1 second
  });
};

// POS Login mutation
export const usePosLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: posLogin,
    onSuccess: (data) => {
      // Update session cache - the session data is in data.data, not data.session
      console.log('Login success, caching session data:', data);
      queryClient.setQueryData(['pos', 'session'], data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['pos'] });
    },
  });
};

// Switch user mutation
export const useSwitchPosUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: switchPosUser,
    onSuccess: (data) => {
      // Update session cache
      queryClient.setQueryData(['pos', 'session'], data.session);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['pos'] });
    },
  });
};

// Lock session mutation
export const useLockPosSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: lockPosSession,
    onSuccess: () => {
      // Clear session cache
      queryClient.removeQueries({ queryKey: ['pos', 'session'] });
      
      // Invalidate all POS queries
      queryClient.invalidateQueries({ queryKey: ['pos'] });
    },
  });
};

// Unlock session mutation
export const useUnlockPosSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: unlockPosSession,
    onSuccess: (data) => {
      // Update session cache
      queryClient.setQueryData(['pos', 'session'], data.session);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['pos'] });
    },
  });
};

// Logout mutation
export const usePosLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: posLogout,
    onSuccess: () => {
      // Clear all POS-related cache
      queryClient.removeQueries({ queryKey: ['pos'] });
      
      // Optionally clear all cache if switching to different system
      // queryClient.clear();
    },
  });
};

// Verify PIN mutation
export const useVerifyUserPin = () => {
  return useMutation({
    mutationFn: ({ userId, pin }: { userId: number; pin: string }) =>
      verifyUserPin(userId, pin),
  });
};