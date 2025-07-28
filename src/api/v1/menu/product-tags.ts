import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

// ========== Type Definitions ==========

export type TagStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface ProductTagResponse {
    id: number;
    name: string;
    color?: string;
    description?: string;
    status: TagStatus;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
    productCount?: number;
}

export interface ProductTagCreateRequest {
    name: string;
    color?: string;
    description?: string;
}

export interface ProductTagUpdateRequest {
    name?: string;
    color?: string;
    description?: string;
    status?: TagStatus;
}

export interface ProductTagAssignRequest {
    productId: number;
    tagIds: number[];
}

export interface ProductTagListParams {
    search?: string;
    activeOnly?: boolean;
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}

export interface ProductTagListResponse {
    content: ProductTagResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// API Response wrapper interface
interface ApiResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}

// API List Response interface (what the API actually returns)
interface ApiListData {
    page: number;
    size: number;
    total: number;
    data: ProductTagResponse[];
}

// ========== API Functions ==========

// Get all tags using /api/menu/tags
const getAllTags = async (): Promise<ProductTagResponse[]> => {
    const response =
        await apiClient.get<ApiResponse<ProductTagResponse[]>>(
            '/api/menu/tags'
        );
    return response.data.data;
};

// Create tag using /api/menu/tags
const createTag = async (
    data: ProductTagCreateRequest
): Promise<ProductTagResponse> => {
    const response = await apiClient.post<ApiResponse<ProductTagResponse>>(
        '/api/menu/tags',
        data
    );
    return response.data.data;
};

// Get single tag using /api/menu/tags/{id}
const getTag = async (id: number): Promise<ProductTagResponse> => {
    const response = await apiClient.get<ApiResponse<ProductTagResponse>>(
        `/api/menu/tags/${id}`
    );
    return response.data.data;
};

// Update tag using /api/menu/tags/{id}
const updateTag = async (
    id: number,
    data: ProductTagUpdateRequest
): Promise<ProductTagResponse> => {
    const response = await apiClient.put<ApiResponse<ProductTagResponse>>(
        `/api/menu/tags/${id}`,
        data
    );
    return response.data.data;
};

// Delete tag using /api/menu/tags/{id}
const deleteTag = async (id: number): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
        `/api/menu/tags/${id}`
    );
    return response.data.data;
};

// Search tags by name using /api/menu/tags/search
const searchTags = async (name: string): Promise<ProductTagResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductTagResponse[]>>(
        `/api/menu/tags/search?name=${encodeURIComponent(name)}`
    );
    return response.data.data;
};

// Get paginated tag list using /api/menu/tags/list
const getTagList = async (
    params: ProductTagListParams = {}
): Promise<ProductTagListResponse> => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });

    const response = await apiClient.get<ApiResponse<ApiListData>>(
        `/api/menu/tags/list?${searchParams.toString()}`
    );

    // Transform the API response to match our expected interface
    const apiData = response.data.data;
    return {
        content: apiData.data,
        totalElements: apiData.total,
        totalPages: Math.ceil(apiData.total / apiData.size),
        size: apiData.size,
        number: apiData.page,
    };
};

// Assign tags to product using /api/menu/tags/assign
const assignTagsToProduct = async (
    data: ProductTagAssignRequest
): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
        '/api/menu/tags/assign',
        data
    );
    return response.data.data;
};

// Get tags by product using /api/menu/tags/product/{productId}
const getTagsByProduct = async (
    productId: number
): Promise<ProductTagResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductTagResponse[]>>(
        `/api/menu/tags/product/${productId}`
    );
    return response.data.data;
};

// Get popular tags using /api/menu/tags/popular
const getPopularTags = async (
    limit: number = 10
): Promise<ProductTagResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductTagResponse[]>>(
        `/api/menu/tags/popular?limit=${limit}`
    );
    return response.data.data;
};

// ========== React Query Hooks ==========

// Query hooks
export const useAllTags = () => {
    return useQuery({
        queryKey: ['tags', 'all'],
        queryFn: getAllTags,
    });
};

export const useTag = (id: number) => {
    return useQuery({
        queryKey: ['tags', id],
        queryFn: () => getTag(id),
        enabled: !!id,
    });
};

export const useSearchTags = (name: string) => {
    return useQuery({
        queryKey: ['tags', 'search', name],
        queryFn: () => searchTags(name),
        enabled: !!name && name.length > 0,
    });
};

export const useTagList = (params: ProductTagListParams = {}) => {
    return useQuery({
        queryKey: ['tags', 'list', params],
        queryFn: () => getTagList(params),
    });
};

export const usePopularTags = (limit: number = 10) => {
    return useQuery({
        queryKey: ['tags', 'popular', limit],
        queryFn: () => getPopularTags(limit),
    });
};

// Mutation hooks
export const useCreateTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTag,
        onSuccess: () => {
            // Invalidate all tags queries
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
};

export const useUpdateTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: ProductTagUpdateRequest;
        }) => updateTag(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate all tags queries
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            // Invalidate specific tag
            queryClient.invalidateQueries({ queryKey: ['tags', id] });
        },
    });
};

export const useAssignTagsToProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assignTagsToProduct,
        onSuccess: (_, { productId }) => {
            // Invalidate tags for the specific product
            queryClient.invalidateQueries({
                queryKey: ['tags', 'product', productId],
            });
            // Invalidate products queries (tag assignments may have changed)
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};
