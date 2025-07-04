import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RoleResponseDto } from './auth';
import { BaseListRequest, BaseResponse, PageResponse, RoleName, Status } from '.';

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
export const getRoles = async (params: BaseListRequest): Promise<PageResponse<RoleResponseDto>> => {
  const response = await apiClient.get<BaseResponse<PageResponse<RoleResponseDto>>>('/role', { params });
  return response.data.payload;
};

export const createRole = async (data: RoleCreateDto): Promise<RoleResponseDto> => {
  const response = await apiClient.post<RoleResponseDto>('/role', data);
  return response.data;
};

export const updateRole = async (id: number, data: RoleUpdateDto): Promise<RoleResponseDto> => {
  const response = await apiClient.put<RoleResponseDto>(`/role/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: number): Promise<void> => {
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
    mutationFn: ({ id, data }: { id: number; data: RoleUpdateDto }) => updateRole(id, data),
  });
};

export const useDeleteRole = () => {
  return useMutation({
    mutationFn: deleteRole,
  });
}; 