import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

// ========== Type Definitions ==========

export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface PosCategoryResponse {
    id: number;
    code?: string;
    name: string;
    description?: string;
    status: Status;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
    sequence?: number;
    image?: string;
    parentId?: number;
    parentName?: string;
    level?: number;
    isRoot?: boolean;
    hasChildren?: boolean;
    hasProducts?: boolean;
    children?: PosCategoryResponse[];
    childrenCount?: number;
    productsCount?: number;
    productCount?: number;
    migrationSource?: string;
    fullPath?: string;
}

// ========== API Functions ==========

// Get single pos category
export const usePosCategory = (id: number) => {
    return useQuery({
        queryKey: ['pos-categories', id],
        queryFn: async (): Promise<PosCategoryResponse> => {
            const response = await apiClient.get(
                `/api/menu/pos-categories/${id}`
            );
            return response.data;
        },
        enabled: !!id,
    });
};

// Delete pos category
export const useDeletePosCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<void> => {
            await apiClient.delete(`/api/menu/pos-categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-categories'] });
        },
    });
};

// Get all pos categories
export const usePosCategoriesList = () => {
    return useQuery({
        queryKey: ['pos-categories', 'all'],
        queryFn: async (): Promise<PosCategoryResponse[]> => {
            const response = await apiClient.get('/api/menu/pos-categories');
            return response.data;
        },
    });
};
