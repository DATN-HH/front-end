import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserDtoResponse } from './auth';
import { BaseResponse, PageResponse, SearchCondition } from '.';

// Types
export interface UserListRequest {
  keyword?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  page?: number;
  size?: number;
  sortBy?: string;
  searchCondition?: string;
  searchConditions?: SearchCondition[];
  fieldNameMap?: string;
  fieldNameMaps?: Record<string, string>;
  searchConditionDisplay?: string;
  branchId?: number;
  isEmployee?: boolean;
}

export interface UserCreateDto {
  email: string;
  username?: string;
  fullName?: string;
  birthdate?: string;
  gender?: 'FEMALE' | 'MALE' | 'OTHER';
  phoneNumber?: string;
  isFullRole?: boolean;
  password?: string;
  branchId?: number;
  userRoles?: UserRoleCreateDto[];
}

export interface UserRoleCreateDto {
  id?: number;
  userId?: number;
  roleId: number;
}

export interface UserUpdateDto {
  email: string;
  username?: string;
  fullName?: string;
  birthdate?: string;
  gender?: 'FEMALE' | 'MALE' | 'OTHER';
  phoneNumber?: string;
  isFullRole?: boolean;
  userRoles?: UserRoleCreateDto[];
}

export interface UserChangePasswordRequest {
  password: string;
  newPassword: string;
}

export interface UserForgetPasswordRequest {
  email: string;
}

// API calls
export const getUsers = async (params: UserListRequest): Promise<PageResponse<UserDtoResponse>> => {
  const response = await apiClient.get<BaseResponse<PageResponse<UserDtoResponse>>>('/user/list', { params });
  return response.data.payload;
};

export const getUserById = async (id: number): Promise<UserDtoResponse> => {
  const response = await apiClient.get<UserDtoResponse>(`/user/${id}`);
  return response.data;
};

export const createUser = async (data: UserCreateDto): Promise<UserDtoResponse> => {
  const response = await apiClient.post<UserDtoResponse>('/user', data);
  return response.data;
};

export const updateUser = async (id: number, data: UserUpdateDto): Promise<UserDtoResponse> => {
  const response = await apiClient.put<UserDtoResponse>(`/user/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/user/${id}`);
};

export const changePassword = async (data: UserChangePasswordRequest): Promise<void> => {
  await apiClient.put('/user/change-password', data);
};

export const forgetPassword = async (data: UserForgetPasswordRequest): Promise<void> => {
  await apiClient.post('/user/forget-password', data);
};

// Hooks
export const useUsers = (params: UserListRequest) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: createUser,
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateDto }) => updateUser(id, data),
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: deleteUser,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: forgetPassword,
  });
}; 