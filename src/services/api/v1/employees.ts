import { apiClient } from '@/services/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BaseListRequest, BaseResponse, PageResponse, Status } from '.';
import { UserCreateDto, UserResponseDto, UserUpdateDto } from './users';

// API calls
export const getEmployees = async (params: BaseListRequest): Promise<PageResponse<UserResponseDto>> => {
  const response = await apiClient.get<BaseResponse<PageResponse<UserResponseDto>>>('/user', { params });
  return response.data.payload;
};

export const createEmployee = async (data: UserCreateDto): Promise<UserResponseDto> => {
  const response = await apiClient.post<UserResponseDto>('/user', data);
  return response.data;
};

export const updateEmployee = async (id: number, data: UserUpdateDto): Promise<UserResponseDto> => {
  const response = await apiClient.put<UserResponseDto>(`/user/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await apiClient.delete(`/user/${id}`);
};

// Hooks
export const useEmployees = (params: BaseListRequest) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => getEmployees(params),
  });
};

export const useCreateEmployee = () => {
  return useMutation({
    mutationFn: createEmployee,
  });
};

export const useUpdateEmployee = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateDto }) => updateEmployee(id, data),
  });
};

export const useDeleteEmployee = () => {
  return useMutation({
    mutationFn: deleteEmployee,
  });
}; 