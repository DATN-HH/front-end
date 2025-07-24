import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

// ========== Type Definitions ==========

export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface CategoryResponse {
    id: number;
    code?: string; // May be null for migrated pos_categories
    name: string;
    description?: string;
    status: Status;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;

    // Fields from pos_category for unified system
    sequence?: number;
    image?: string;

    // Parent information for hierarchy
    parentId?: number;
    parentName?: string;

    // Hierarchy information
    level?: number;
    isRoot?: boolean;
    hasChildren?: boolean;
    hasProducts?: boolean;

    // Children categories (for tree structure)
    children?: CategoryResponse[];

    // Counts for smart buttons
    childrenCount?: number;
    productsCount?: number;
    productCount?: number; // Legacy field for backward compatibility

    // Migration tracking (temporary)
    migrationSource?: string;

    // Full hierarchical path
    fullPath?: string;
}

// ========== BACKWARD COMPATIBILITY TYPES ==========
// These type aliases provide compatibility with the old pos-category types

/**
 * @deprecated Use CategoryResponse instead
 */
export type PosCategoryResponse = CategoryResponse;

/**
 * @deprecated Use CategoryCreateRequest instead
 */
export type PosCategoryCreateRequest = CategoryCreateRequest;

/**
 * @deprecated Use CategoryUpdateRequest instead
 */
export type PosCategoryUpdateRequest = CategoryUpdateRequest;

export interface ProductListResponse {
    id: number;
    name: string;
    internalReference: string;
    price: number;
    cost: number;
    type: 'CONSUMABLE' | 'STOCKABLE' | 'SERVICE' | 'EXTRA';
    image: string;
    size: string;
    estimateTime: number;
    canBeSold: boolean;
    canBePurchased: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
    createdAt: string;
    updatedAt: string;
    categoryId: number;
    categoryName: string;
    categoryCode: string;
    stockQuantity: number;
    stockThreshold: number;
}

export interface CategoryCreateRequest {
    code?: string; // Optional to support pos_category style categories
    name: string;
    description?: string;
    status?: Status;

    // Fields from pos_category for unified system
    parentId?: number; // Optional parent category for hierarchy
    sequence?: number; // Display order
    image?: string; // Optional image URL
}

export interface CategoryUpdateRequest {
    code?: string; // Optional to support pos_category style categories
    name?: string;
    description?: string;
    status?: Status;

    // Fields from pos_category for unified system
    parentId?: number; // Optional parent category for hierarchy
    sequence?: number; // Display order
    image?: string; // Optional image URL
}

export interface CategoryListParams {
    search?: string;
    archived?: boolean;
    includeAllStatuses?: boolean;
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}

export interface CategoryListResponse {
    content: CategoryResponse[];
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
    data: CategoryResponse[];
}

// ========== API Functions ==========

// Get all categories using /api/menu/categories
export const getAllCategories = async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<ApiResponse<CategoryResponse[]>>(
        '/api/menu/categories'
    );
    return response.data.data;
};

// Create category using /api/menu/categories with optional saveAndNew parameter
export const createCategory = async (
    data: CategoryCreateRequest,
    saveAndNew: boolean = false
): Promise<CategoryResponse> => {
    const params = saveAndNew ? '?saveAndNew=true' : '';
    const response = await apiClient.post<ApiResponse<CategoryResponse>>(
        `/api/menu/categories${params}`,
        data
    );
    return response.data.data;
};

// Get single category using /api/menu/categories/{id}
export const getCategory = async (id: number): Promise<CategoryResponse> => {
    const response = await apiClient.get<ApiResponse<CategoryResponse>>(
        `/api/menu/categories/${id}`
    );
    return response.data.data;
};

// Update category using /api/menu/categories/{id}
export const updateCategory = async (
    id: number,
    data: CategoryUpdateRequest
): Promise<CategoryResponse> => {
    const response = await apiClient.put<ApiResponse<CategoryResponse>>(
        `/api/menu/categories/${id}`,
        data
    );
    return response.data.data;
};

// Delete category using /api/menu/categories/{id}
export const deleteCategory = async (id: number): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
        `/api/menu/categories/${id}`
    );
    return response.data.data;
};

// Get category by code using /api/menu/categories/code/{code}
export const getCategoryByCode = async (
    code: string
): Promise<CategoryResponse> => {
    const response = await apiClient.get<ApiResponse<CategoryResponse>>(
        `/api/menu/categories/code/${code}`
    );
    return response.data.data;
};

// Search categories by name using /api/menu/categories/search
export const searchCategories = async (
    name: string
): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<ApiResponse<CategoryResponse[]>>(
        `/api/menu/categories/search?name=${encodeURIComponent(name)}`
    );
    return response.data.data;
};

// Get product count by category using /api/menu/categories/{id}/product-count
export const getProductCountByCategory = async (
    id: number
): Promise<number> => {
    const response = await apiClient.get<ApiResponse<number>>(
        `/api/menu/categories/${id}/product-count`
    );
    return response.data.data;
};

// ========== HIERARCHY API FUNCTIONS ==========

// Get root categories (categories without parent)
export const getRootCategories = async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<ApiResponse<CategoryResponse[]>>(
        '/api/menu/categories/roots'
    );
    return response.data.data;
};

// Get children of a specific category
export const getCategoryChildren = async (
    id: number
): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<ApiResponse<CategoryResponse[]>>(
        `/api/menu/categories/${id}/children`
    );
    return response.data.data;
};

// Get complete category hierarchy as tree
export const getCategoryHierarchy = async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<ApiResponse<CategoryResponse[]>>(
        '/api/menu/categories/hierarchy'
    );
    return response.data.data;
};

// Move category to different parent
export const moveCategoryToParent = async (
    id: number,
    parentId?: number
): Promise<CategoryResponse> => {
    const params = parentId ? `?parentId=${parentId}` : '';
    const response = await apiClient.put<ApiResponse<CategoryResponse>>(
        `/api/menu/categories/${id}/move${params}`
    );
    return response.data.data;
};

// Update category sequence
export const updateCategorySequence = async (
    id: number,
    sequence: number
): Promise<CategoryResponse> => {
    const response = await apiClient.put<ApiResponse<CategoryResponse>>(
        `/api/menu/categories/${id}/sequence?sequence=${sequence}`
    );
    return response.data.data;
};

// Get products by category using /api/menu/categories/{id}/products
export const getProductsByCategory = async (
    id: number
): Promise<ProductListResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductListResponse[]>>(
        `/api/menu/categories/${id}/products`
    );
    return response.data.data;
};

// Get paginated category list using /api/menu/categories/list
export const getCategoryList = async (
    params: CategoryListParams = {}
): Promise<CategoryListResponse> => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });

    const response = await apiClient.get<ApiResponse<ApiListData>>(
        `/api/menu/categories/list?${searchParams.toString()}`
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

// Archive category (soft delete by setting status to DELETED)
export const archiveCategory = async (
    id: number
): Promise<CategoryResponse> => {
    const response = await apiClient.put<ApiResponse<CategoryResponse>>(
        `/api/menu/categories/${id}`,
        {
            status: 'DELETED',
        }
    );
    return response.data.data;
};

// Unarchive category (restore by setting status to ACTIVE)
export const unarchiveCategory = async (
    id: number
): Promise<CategoryResponse> => {
    const response = await apiClient.put<ApiResponse<CategoryResponse>>(
        `/api/menu/categories/${id}`,
        {
            status: 'ACTIVE',
        }
    );
    return response.data.data;
};

// ========== React Query Hooks ==========

// Query hooks
export const useAllCategories = () => {
    return useQuery({
        queryKey: ['categories', 'all'],
        queryFn: getAllCategories,
    });
};

export const useCategory = (id: number) => {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: () => getCategory(id),
        enabled: !!id,
    });
};

export const useCategoryByCode = (code: string) => {
    return useQuery({
        queryKey: ['categories', 'code', code],
        queryFn: () => getCategoryByCode(code),
        enabled: !!code,
    });
};

export const useSearchCategories = (name: string) => {
    return useQuery({
        queryKey: ['categories', 'search', name],
        queryFn: () => searchCategories(name),
        enabled: !!name && name.length > 0,
    });
};

export const useProductCountByCategory = (id: number) => {
    return useQuery({
        queryKey: ['categories', id, 'product-count'],
        queryFn: () => getProductCountByCategory(id),
        enabled: !!id,
    });
};

export const useProductsByCategory = (id: number) => {
    return useQuery({
        queryKey: ['categories', id, 'products'],
        queryFn: () => getProductsByCategory(id),
        enabled: !!id,
    });
};

export const useCategoryList = (params: CategoryListParams = {}) => {
    return useQuery({
        queryKey: ['categories', 'list', params],
        queryFn: () => getCategoryList(params),
    });
};

// Mutation hooks
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            data,
            saveAndNew = false,
        }: {
            data: CategoryCreateRequest;
            saveAndNew?: boolean;
        }) => createCategory(data, saveAndNew),
        onSuccess: () => {
            // Invalidate all categories queries
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            // Invalidate products queries (category options may have changed)
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: CategoryUpdateRequest;
        }) => updateCategory(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate all categories queries
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            // Invalidate specific category
            queryClient.invalidateQueries({ queryKey: ['categories', id] });
            // Invalidate products queries (category info may have changed)
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            // Invalidate all categories queries
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            // Invalidate products queries (category options may have changed)
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useArchiveCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: archiveCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUnarchiveCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: unarchiveCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// ========== HIERARCHY HOOKS ==========

export const useRootCategories = () => {
    return useQuery({
        queryKey: ['categories', 'roots'],
        queryFn: getRootCategories,
    });
};

export const useCategoryChildren = (id: number) => {
    return useQuery({
        queryKey: ['categories', id, 'children'],
        queryFn: () => getCategoryChildren(id),
        enabled: !!id,
    });
};

export const useCategoryHierarchy = () => {
    return useQuery({
        queryKey: ['categories', 'hierarchy'],
        queryFn: getCategoryHierarchy,
    });
};

export const useMoveCategoryToParent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            parentId,
        }: {
            id: number;
            parentId?: number;
        }) => moveCategoryToParent(id, parentId),
        onSuccess: () => {
            // Invalidate all category-related queries
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUpdateCategorySequence = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            sequence,
        }: {
            id: number;
            sequence: number;
        }) => updateCategorySequence(id, sequence),
        onSuccess: () => {
            // Invalidate all category-related queries
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// ========== BACKWARD COMPATIBILITY FUNCTIONS ==========
// These functions provide compatibility with the old pos-category API

/**
 * @deprecated Use getAllCategories instead
 */
export const getAllPosCategories = getAllCategories;

/**
 * @deprecated Use getCategoryHierarchy instead
 */
export const getPosCategoryTree = getCategoryHierarchy;

/**
 * @deprecated Use getCategory instead
 */
export const getPosCategory = getCategory;

/**
 * @deprecated Use createCategory instead
 */
export const createPosCategory = createCategory;

/**
 * @deprecated Use updateCategory instead
 */
export const updatePosCategory = updateCategory;

/**
 * @deprecated Use deleteCategory instead
 */
export const deletePosCategory = deleteCategory;

// ========== BACKWARD COMPATIBILITY HOOKS ==========

/**
 * @deprecated Use useAllCategories instead
 */
export const useAllPosCategories = useAllCategories;

/**
 * @deprecated Use useCategoryHierarchy instead
 */
export const usePosCategoryTree = useCategoryHierarchy;

/**
 * @deprecated Use useCategory instead
 */
export const usePosCategory = useCategory;

/**
 * @deprecated Use useCreateCategory instead
 */
export const useCreatePosCategory = useCreateCategory;

/**
 * @deprecated Use useUpdateCategory instead
 */
export const useUpdatePosCategory = useUpdateCategory;

/**
 * @deprecated Use useDeleteCategory instead
 */
export const useDeletePosCategory = useDeleteCategory;

/**
 * @deprecated Use useUpdateCategorySequence instead
 */
export const useMoveCategorySequence = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            direction,
        }: {
            id: number;
            direction: 'up' | 'down';
        }) => {
            // This is a simplified implementation - in a real app you'd need to
            // calculate the new sequence based on direction
            const newSequence = direction === 'up' ? -1 : 1; // Placeholder logic
            return updateCategorySequence(id, newSequence);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
