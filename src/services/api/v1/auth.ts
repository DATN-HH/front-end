import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';

// Types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  account: UserDtoResponse;
}

export interface SignOutResponse {
  dummy: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface UserDtoResponse {
  id: number;
  email: string;
  username: string;
  fullName: string;
  birthdate: string;
  gender: 'FEMALE' | 'MALE' | 'OTHER';
  phoneNumber: string;
  isFullRole: boolean;
  userRoles: UserRoleResponseDto[];
  branch: BranchRespondDto;
  displayName: string;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdUsername: string;
  updatedUsername: string;
}

export interface UserRoleResponseDto {
  id: number;
  userId: number;
  roleId: number;
  role: RoleResponseDto;
}

export interface RoleResponseDto {
  id: number;
  name: 'MANAGER' | 'WAITER' | 'HOST' | 'KITCHEN' | 'CASHIER' | 'ACCOUNTANT' | 'EMPLOYEE' | 'CUSTOMER' | 'SUPPORT' | 'SYSTEM_ADMIN';
  description: string;
  hexColor: string;
  rolePermissions: RolePermissionResponseDto[];
  roleScreens: RoleScreenResponseDto[];
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdUsername: string;
  updatedUsername: string;
}

export interface RolePermissionResponseDto {
  id: number;
  roleId: number;
  permissionId: number;
  isLimitedByOwner: boolean;
  limitedIp: string;
  permission: PermissionResponseDto;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdUsername: string;
  updatedUsername: string;
}

export interface PermissionResponseDto {
  id: number;
  code: string;
  name: string;
  permissionGroup: string;
}

export interface RoleScreenResponseDto {
  id: number;
  roleId: number;
  screenId: number;
  screen: ScreenResponseDto;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdUsername: string;
  updatedUsername: string;
}

export interface ScreenResponseDto {
  id: number;
  code: string;
  name: string;
  menuGroup: string;
  menuItem: string;
}

export interface BranchRespondDto {
  id: number;
  name: string;
  address: string;
  phone: string;
  manager: UserDtoResponse;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdUsername: string;
  updatedUsername: string;
}

export interface BaseResponse<T> {
  success: boolean;
  code: number;
  message: string;
  payload: T;
}

// API calls
export const signIn = async (data: SignInRequest): Promise<BaseResponse<SignInResponse>> => {
  const response = await apiClient.post<BaseResponse<SignInResponse>>('/user/sign-in', data);
  return response.data;
};

export const signOut = async (): Promise<SignOutResponse> => {
  const response = await apiClient.post<SignOutResponse>('/user/sign-out');
  return response.data;
};

export const verifyToken = async (data: VerifyTokenRequest): Promise<SignInResponse> => {
  const response = await apiClient.post<BaseResponse<SignInResponse>>('/user/verify-token', data);
  return response.data.payload;
};

// Hooks
export const useSignIn = () => {
  return useMutation({
    mutationFn: signIn,
  });
};

export const useSignOut = () => {
  return useMutation({
    mutationFn: signOut,
  });
};

export const useVerifyToken = () => {
  return useMutation({
    mutationFn: verifyToken,
  });
}; 