import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Interfaces
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export interface FloorResponse {
  id: number;
  name: string;
  imageUrl?: string;
  order: number;
  branch?: Branch;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  createdBy: number;
  updatedBy: number;
  createdUsername: string;
  updatedUsername: string;
}

export interface CreateFloorRequest {
  name: string;
  branchId: number;
  order?: number;
  image?: File;
}

export interface UpdateFloorRequest {
  name: string;
  order?: number;
  image?: File;
}

// API Functions
const createFloor = async (
  data: CreateFloorRequest
): Promise<FloorResponse> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('branchId', data.branchId.toString());

  if (data.order !== undefined) {
    formData.append('order', data.order.toString());
  }

  if (data.image) {
    formData.append('image', data.image);
  }

  const response = await apiClient.post<BaseResponse<FloorResponse>>(
    '/floors',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.payload!;
};

const updateFloor = async (
  id: number,
  data: UpdateFloorRequest
): Promise<FloorResponse> => {
  const formData = new FormData();
  formData.append('name', data.name);

  if (data.order !== undefined) {
    formData.append('order', data.order.toString());
  }

  if (data.image) {
    formData.append('image', data.image);
  }

  const response = await apiClient.put<BaseResponse<FloorResponse>>(
    `/floors/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.payload!;
};

const getFloorsByBranch = async (
  branchId: number,
  includeDeleted: boolean = false
): Promise<FloorResponse[]> => {
  const response = await apiClient.get<BaseResponse<FloorResponse[]>>(
    `/floors/branches/${branchId}/floors${includeDeleted ? '?includeDeleted=true' : ''}`
  );
  return response.data.payload || [];
};

const deleteFloor = async (id: number): Promise<void> => {
  await apiClient.delete(`/floors/${id}`);
};

// React Query Hooks
export const useCreateFloor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFloor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors'] });
    },
  });
};

export const useUpdateFloor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFloorRequest }) =>
      updateFloor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors'] });
    },
  });
};

export const useFloorsByBranch = (
  branchId: number,
  includeDeleted: boolean = false
) => {
  return useQuery({
    queryKey: ['floors', branchId, includeDeleted],
    queryFn: () => getFloorsByBranch(branchId, includeDeleted),
    enabled: !!branchId,
  });
};

export const useDeleteFloor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFloor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors'] });
    },
  });
};
