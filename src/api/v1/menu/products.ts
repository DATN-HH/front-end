import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

// API Response wrapper interface
interface ApiResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}

// API List Response interface (what the API actually returns)
interface ApiListData<T> {
    page: number;
    size: number;
    total: number;
    data: T[];
}

// ========== Type Definitions ==========

export interface BigDecimal {
    // BigDecimal properties can be handled as number or string for simplicity
    toString(): string;
    valueOf(): number;
}

export type ProductType = 'CONSUMABLE' | 'STOCKABLE' | 'SERVICE' | 'EXTRA';
export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface CategoryResponse {
    id: number;
    code: string;
    name: string;
    description: string;
    status: Status;
    createdAt: string;
    updatedAt: string;
}

export interface ProductCreateRequest {
    name: string;
    size?: string;
    price?: number;
    cost?: number;
    type: ProductType;
    image?: string;
    description?: string;
    estimateTime?: number;
    groupName?: string;
    internalReference?: string;
    canBeSold?: boolean;
    canBePurchased?: boolean;
    categoryId?: number;
}

export interface ProductUpdateRequest {
    name?: string;
    size?: string;
    price?: number;
    cost?: number;
    type?: ProductType;
    image?: string;
    description?: string;
    estimateTime?: number;
    groupName?: string;
    internalReference?: string;
    canBeSold?: boolean;
    canBePurchased?: boolean;
    categoryId?: number;
    salesDescription?: string;
    invoicePolicy?: string;
    trackService?: boolean;
    availableInPos?: boolean;
    posCategory?: string;
    posSequence?: number;
    toWeigh?: boolean;
    purchaseDescription?: string;
    minimumQuantity?: number;
    route?: string;
    inventoryRule?: string;
    weight?: number;
    volume?: number;
    revenueAccount?: string;
    expenseAccount?: string;
    taxCategory?: string;
}

export interface ProductResponse {
    id: number;
    name: string;
    size?: string;
    price?: number;
    cost?: number;
    type: ProductType;
    image?: string;
    description?: string;
    estimateTime?: number;
    groupName?: string;
    internalReference?: string;
    canBeSold?: boolean;
    canBePurchased?: boolean;
    status: Status;
    createdAt: string;
    updatedAt: string;
    category?: CategoryResponse;
}

export interface ProductVariantResponse {
    id: number;
    name: string;
    displayName?: string;
    price?: number;
    attributes?: string;
    status: Status;
}

export interface SalesInfo {
    salesDescription?: string;
    invoicePolicy?: string;
    trackService?: boolean;
    customerLeadTime?: string;
}

export interface PosInfo {
    availableInPos?: boolean;
    posCategoryId?: number; // @deprecated Use categoryId instead
    posCategoryName?: string; // @deprecated Use categoryName instead
    categoryId?: number; // Unified category system
    categoryName?: string; // Unified category system
    posSequence?: number;
    toWeigh?: boolean;
}

export interface PurchaseInfo {
    purchaseDescription?: string;
    vendorLeadTime?: string;
    minimumQuantity?: number;
}

export interface InventoryInfo {
    route?: string;
    inventoryRule?: string;
    weight?: number;
    volume?: number;
    stockQuantity?: number;
    stockThreshold?: number;
}

export interface AccountingInfo {
    revenueAccount?: string;
    expenseAccount?: string;
    taxCategory?: string;
}

export interface SmartButtonCounts {
    variantsCount?: number;
    onHandCount?: number;
    soldCount?: number;
    ordersCount?: number;
    promotionsCount?: number;
}

export interface ProductDetailResponse {
    id: number;
    name: string;
    size?: string;
    price?: number;
    cost?: number;
    type: ProductType;
    image?: string;
    description?: string;
    estimateTime?: number;
    groupName?: string;
    internalReference?: string;
    canBeSold?: boolean;
    canBePurchased?: boolean;
    status: Status;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
    category?: CategoryResponse;
    variantCount?: number;
    variants?: ProductVariantResponse[];
    salesInfo?: SalesInfo;
    posInfo?: PosInfo;
    purchaseInfo?: PurchaseInfo;
    inventoryInfo?: InventoryInfo;
    accountingInfo?: AccountingInfo;
    smartButtons?: SmartButtonCounts;
}

export interface ProductListResponse {
    id: number;
    name: string;
    internalReference?: string;
    price?: number;
    cost?: number;
    type: ProductType;
    image?: string;
    size?: string;
    estimateTime?: number;
    canBeSold?: boolean;
    canBePurchased?: boolean;
    status: Status;
    createdAt: string;
    updatedAt: string;
    categoryId?: number;
    categoryName?: string;
    categoryCode?: string;
    stockQuantity?: number;
    stockThreshold?: number;
}

export interface ProductGroupedResponse {
    groupKey: string;
    groupName: string;
    totalCount: number;
    products: ProductListResponse[];
}

export interface ProductArchiveRequest {
    productIds: number[];
    reason?: string;
}

export interface ProductListParams {
    search?: string;
    canBeSold?: boolean;
    canBePurchased?: boolean;
    type?: ProductType;
    categoryId?: number;
    archived?: boolean;
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
    viewMode?: string;
}

export interface ProductGroupedParams {
    search?: string;
    canBeSold?: boolean;
    canBePurchased?: boolean;
    type?: ProductType;
    categoryId?: number;
    archived?: boolean;
    groupBy?: string;
}

// ========== API Functions ==========

// Get all products using /api/menu/products
const getAllProducts = async (): Promise<ProductResponse[]> => {
    const response =
        await apiClient.get<ApiResponse<ProductResponse[]>>(
            '/api/menu/products'
        );
    return response.data.data;
};

// Create product using /api/menu/products with optional saveAndNew parameter
const createProduct = async (
    data: ProductCreateRequest,
    saveAndNew: boolean = false
): Promise<ProductResponse> => {
    const response = await apiClient.post<ApiResponse<ProductResponse>>(
        `/api/menu/products?saveAndNew=${saveAndNew}`,
        data
    );
    return response.data.data;
};

// Get single product using /api/menu/products/{id}
const getProduct = async (id: number): Promise<ProductResponse> => {
    const response = await apiClient.get<ApiResponse<ProductResponse>>(
        `/api/menu/products/${id}`
    );
    return response.data.data;
};

// Get product detail using /api/menu/products/{id}/detail
const getProductDetail = async (id: number): Promise<ProductDetailResponse> => {
    const response = await apiClient.get<ApiResponse<ProductDetailResponse>>(
        `/api/menu/products/${id}/detail`
    );
    return response.data.data;
};

// Update product using /api/menu/products/{id}
const updateProduct = async (
    id: number,
    data: ProductUpdateRequest
): Promise<ProductDetailResponse> => {
    const response = await apiClient.put<ApiResponse<ProductDetailResponse>>(
        `/api/menu/products/${id}`,
        data
    );
    return response.data.data;
};

// Get products by category using /api/menu/products/category/{categoryId}
const getProductsByCategory = async (
    categoryId: number
): Promise<ProductResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductResponse[]>>(
        `/api/menu/products/category/${categoryId}`
    );
    return response.data.data;
};

// Get paginated product list using /api/menu/products/list
const getProductList = async (
    params: ProductListParams = {}
): Promise<{
    content: ProductListResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}> => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });

    const response = await apiClient.get<
        ApiResponse<ApiListData<ProductListResponse>>
    >(`/api/menu/products/list?${searchParams.toString()}`);

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

// Get grouped product list using /api/menu/products/list/grouped
const getGroupedProductList = async (
    params: ProductGroupedParams = {}
): Promise<ProductGroupedResponse[]> => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });

    const response = await apiClient.get<ApiResponse<ProductGroupedResponse[]>>(
        `/api/menu/products/list/grouped?${searchParams.toString()}`
    );
    return response.data.data;
};

// Archive single product using /api/menu/products/{id}/archive
const archiveProduct = async (id: number): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
        `/api/menu/products/${id}/archive`
    );
    return response.data.data;
};

// Unarchive single product using /api/menu/products/{id}/unarchive
const unarchiveProduct = async (id: number): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>(
        `/api/menu/products/${id}/unarchive`
    );
    return response.data.data;
};

// ========== React Query Hooks ==========

// Query hooks
export const useAllProducts = () => {
    return useQuery({
        queryKey: ['products', 'all'],
        queryFn: getAllProducts,
    });
};

export const useProduct = (id: number) => {
    return useQuery({
        queryKey: ['products', id],
        queryFn: () => getProduct(id),
        enabled: !!id,
    });
};

export const useProductDetail = (id: number) => {
    return useQuery({
        queryKey: ['products', id, 'detail'],
        queryFn: () => getProductDetail(id),
        enabled: !!id,
    });
};

export const useProductsByCategory = (categoryId: number) => {
    return useQuery({
        queryKey: ['products', 'category', categoryId],
        queryFn: () => getProductsByCategory(categoryId),
        enabled: !!categoryId,
    });
};

export const useProductList = (params: ProductListParams = {}) => {
    return useQuery({
        queryKey: ['products', 'list', params],
        queryFn: () => getProductList(params),
    });
};

export const useGroupedProductList = (params: ProductGroupedParams = {}) => {
    return useQuery({
        queryKey: ['products', 'grouped', params],
        queryFn: () => getGroupedProductList(params),
    });
};

// Mutation hooks
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            data,
            saveAndNew = false,
        }: {
            data: ProductCreateRequest;
            saveAndNew?: boolean;
        }) => createProduct(data, saveAndNew),
        onSuccess: (_, { data }) => {
            // Invalidate all products queries
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // Invalidate categories (product counts may have changed)
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            // If product was assigned to a specific category, invalidate that category's products
            if (data.categoryId) {
                queryClient.invalidateQueries({
                    queryKey: ['categories', data.categoryId, 'products'],
                });
                queryClient.invalidateQueries({
                    queryKey: ['categories', data.categoryId, 'product-count'],
                });
            }
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: ProductUpdateRequest;
        }) => updateProduct(id, data),
        onSuccess: (_, { id, data }) => {
            // Invalidate all products queries
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // Invalidate specific product
            queryClient.invalidateQueries({ queryKey: ['products', id] });
            // Invalidate categories (product counts or category assignments may have changed)
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            // If product was assigned to a specific category, invalidate that category's products
            if (data.categoryId) {
                queryClient.invalidateQueries({
                    queryKey: ['categories', data.categoryId, 'products'],
                });
                queryClient.invalidateQueries({
                    queryKey: ['categories', data.categoryId, 'product-count'],
                });
            }
        },
    });
};

export const useArchiveProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: archiveProduct,
        onSuccess: () => {
            // Invalidate all products queries
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // Invalidate categories (product counts may have changed)
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUnarchiveProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: unarchiveProduct,
        onSuccess: () => {
            // Invalidate all products queries
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // Invalidate categories (product counts may have changed)
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
