import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Request Types
export interface PreOrderConfigRequest {
    branchId: number;
    depositPercentage: number;
}

// Response Types
export interface PreOrderConfigResponse {
    id: number | null;
    branchId: number;
    depositPercentage: number;
}

// API calls
const getPreOrderConfig = async (
    branchId: number
): Promise<PreOrderConfigResponse> => {
    const response = await apiClient.get<BaseResponse<PreOrderConfigResponse>>(
        `/pre-order-config/branch/${branchId}`
    );
    return response.data.payload;
};

const createPreOrderConfig = async (
    request: PreOrderConfigRequest
): Promise<PreOrderConfigResponse> => {
    const response = await apiClient.post<BaseResponse<PreOrderConfigResponse>>(
        '/pre-order-config',
        request
    );
    return response.data.payload;
};

const updatePreOrderConfig = async (
    request: PreOrderConfigRequest
): Promise<PreOrderConfigResponse> => {
    const response = await apiClient.put<BaseResponse<PreOrderConfigResponse>>(
        `/pre-order-config/branch/${request.branchId}`,
        request
    );
    return response.data.payload;
};

// Hooks
export const usePreOrderConfig = (branchId: number) => {
    return useQuery({
        queryKey: ['preOrderConfig', branchId],
        queryFn: () => getPreOrderConfig(branchId),
        enabled: !!branchId,
        staleTime: 300000, // 5 minutes - config doesn't change often
    });
};

export const useCreatePreOrderConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPreOrderConfig,
        onSuccess: (data) => {
            // Invalidate and update the config cache
            queryClient.invalidateQueries({
                queryKey: ['preOrderConfig', data.branchId],
            });
        },
    });
};

export const useUpdatePreOrderConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePreOrderConfig,
        onSuccess: (data) => {
            // Invalidate and update the config cache
            queryClient.invalidateQueries({
                queryKey: ['preOrderConfig', data.branchId],
            });
        },
    });
};
