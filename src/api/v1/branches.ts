import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

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
const getBranches = async (
    params: BaseListRequest
): Promise<BranchResponseDto[]> => {
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

    const url = `/branch?${queryParams.toString()}`;
    const response =
        await apiClient.get<BaseResponse<PageResponse<BranchResponseDto>>>(url);
    return response.data.payload.data;
};

const getBranch = async (
    id: number
): Promise<BaseResponse<BranchResponseDto>> => {
    const response = await apiClient.get<BaseResponse<BranchResponseDto>>(
        `/branch/${id}`
    );
    return response.data;
};

const createBranch = async (
    data: BranchCreateDto
): Promise<BaseResponse<BranchResponseDto>> => {
    const response = await apiClient.post<BaseResponse<BranchResponseDto>>(
        '/branch',
        data
    );
    return response.data;
};

const updateBranch = async ({
    id,
    data,
}: {
    id: number;
    data: BranchUpdateDto;
}): Promise<BaseResponse<BranchResponseDto>> => {
    const response = await apiClient.put<BaseResponse<BranchResponseDto>>(
        `/branch/${id}`,
        data
    );
    return response.data;
};

const deleteBranch = async (id: number): Promise<BaseResponse<void>> => {
    const response = await apiClient.delete<BaseResponse<void>>(
        `/branch/${id}`
    );
    return response.data;
};

// Hooks
export const useBranches = (params?: BaseListRequest) => {
    const defaultParams: BaseListRequest = {
        page: 0,
        size: 1000,
        sortBy: 'name',
        ...params,
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
