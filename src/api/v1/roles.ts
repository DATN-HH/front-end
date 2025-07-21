import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { RoleResponseDto } from './auth';

import {
  BaseListRequest,
  BaseResponse,
  PageResponse,
  RoleName,
  Status,
} from '.';

// Types
export interface RoleCreateDto {
  name: RoleName;
  description?: string;
  status?: Status;
  hexColor?: string;
  rolePermissions?: RolePermissionCreateDto[];
  roleScreens?: RoleScreenCreateDto[];
}

export interface RolePermissionCreateDto {
  id?: number;
  roleId?: number;
  permissionId: number;
  isLimitedByOwner?: boolean;
  limitedIp?: string;
}

export interface RoleScreenCreateDto {
  id?: number;
  roleId?: number;
  screenId: number;
}

export interface RoleUpdateDto {
  name: RoleName;
  description?: string;
  hexColor?: string;
  status?: Status;
  rolePermissions?: RolePermissionCreateDto[];
  roleScreens?: RoleScreenCreateDto[];
}

// API calls
const getRoles = async (
  params: BaseListRequest
): Promise<PageResponse<RoleResponseDto>> => {
  // Build query string manually to ensure proper encoding
  const queryParams = new URLSearchParams();

  // Add basic params
  if (params.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params.size !== undefined)
    queryParams.append('size', params.size.toString());
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.status) queryParams.append('status', params.status);

  // Handle searchCondition with proper encoding
  if (params.searchCondition) {
    queryParams.append('searchCondition', params.searchCondition);
  }

  const url = `/role?${queryParams.toString()}`;
  const response =
    await apiClient.get<BaseResponse<PageResponse<RoleResponseDto>>>(url);
  return response.data.payload;
};

const createRole = async (data: RoleCreateDto): Promise<RoleResponseDto> => {
  const response = await apiClient.post<RoleResponseDto>('/role', data);
  return response.data;
};

const updateRole = async (
  id: number,
  data: RoleUpdateDto
): Promise<RoleResponseDto> => {
  const response = await apiClient.put<RoleResponseDto>(`/role/${id}`, data);
  return response.data;
};

const deleteRole = async (id: number): Promise<void> => {
  await apiClient.delete(`/role/${id}`);
};

// Hooks
export const useRoles = (params: BaseListRequest) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => getRoles(params),
  });
};

export const useCreateRole = () => {
  return useMutation({
    mutationFn: createRole,
  });
};

export const useUpdateRole = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleUpdateDto }) =>
      updateRole(id, data),
  });
};

export const useDeleteRole = () => {
  return useMutation({
    mutationFn: deleteRole,
  });
};
