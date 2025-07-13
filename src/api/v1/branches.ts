import { apiClient } from '@/services/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseListRequest, BaseResponse, PageResponse, Status } from '.';

// Types
export interface BranchResponseDto {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    managerId?: number;
    status: Status;
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
    createdUsername: string;
    updatedUsername: string;
    manager?: {
        id: number;
        fullName: string;
        email: string;
    };
}

export interface BranchCreateDto {
    name: string;
    address?: string;
    phone?: string;
    managerId?: number;
    status?: Status;
}

export interface BranchUpdateDto {
    name: string;
    address?: string;
    phone?: string;
    managerId?: number;
    status?: Status;
}

// API calls
export const getBranches = async (params: BaseListRequest): Promise<BranchResponseDto[]> => {
    const response = await apiClient.get<BaseResponse<PageResponse<BranchResponseDto>>>('/branch', { params });
    return response.data.payload.data;
};

export const getBranch = async (id: number): Promise<BaseResponse<BranchResponseDto>> => {
    const response = await apiClient.get<BaseResponse<BranchResponseDto>>(`/branch/${id}`);
    return response.data;
};

export const createBranch = async (data: BranchCreateDto): Promise<BaseResponse<BranchResponseDto>> => {
    const response = await apiClient.post<BaseResponse<BranchResponseDto>>('/branch', data);
    return response.data;
};

export const updateBranch = async ({ id, data }: { id: number; data: BranchUpdateDto }): Promise<BaseResponse<BranchResponseDto>> => {
    const response = await apiClient.put<BaseResponse<BranchResponseDto>>(`/branch/${id}`, data);
    return response.data;
};

export const deleteBranch = async (id: number): Promise<BaseResponse<void>> => {
    const response = await apiClient.delete<BaseResponse<void>>(`/branch/${id}`);
    return response.data;
};

// Hooks
export const useBranches = (params?: BaseListRequest) => {
    const defaultParams: BaseListRequest = {
        page: 0,
        size: 1000,
        sortBy: 'name',
        ...params
    };
    
    return useQuery({
        queryKey: ['branches', defaultParams],
        queryFn: () => getBranches(defaultParams),
    });
};

export const useBranch = (id: number) => {
    return useQuery({
        queryKey: ['branches', id],
        queryFn: () => getBranch(id),
    });
};

export const useCreateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBranch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
        },
    });
};

export const useUpdateBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateBranch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
        },
    });
};

export const useDeleteBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBranch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
        },
    });
}; 