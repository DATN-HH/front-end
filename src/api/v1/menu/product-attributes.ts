import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

// API Response wrapper interface
interface ApiResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}

// ========== Type Definitions ==========

export type DisplayType = 'RADIO' | 'SELECT' | 'COLOR' | 'CHECKBOX' | 'TEXTBOX';
export type VariantCreationMode = 'INSTANTLY' | 'DYNAMICALLY' | 'NEVER';
export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface ProductAttributeCreateRequest {
    name: string;
    displayType: DisplayType;
    variantCreationMode: VariantCreationMode;
    description?: string;
}

export interface ProductAttributeResponse {
    id: number;
    name: string;
    displayType: DisplayType;
    variantCreationMode: VariantCreationMode;
    isMoneyAttribute?: boolean;
    description?: string;
    status: Status;
    createdAt: string;
    updatedAt: string;
    values?: ProductAttributeValueResponse[];
    valuesCount?: number;
    productsCount?: number;
}

export interface ProductAttributeValueCreateRequest {
    name: string;
    colorCode?: string;
    sequence?: number;
    textValue?: string;
    description?: string;
    attributeId: number;
}

export interface ProductAttributeValueResponse {
    id: number;
    name: string;
    colorCode?: string;
    sequence?: number;
    textValue?: string;
    description?: string;
    status: Status;
    createdAt: string;
    updatedAt: string;
    attributeId: number;
    attributeName: string;
    usageCount?: number;
}

export interface AttributeAssignment {
    attributeId: number;
    selectedValueIds?: number[];
    textValue?: string;
}

export interface ProductAttributeAssignRequest {
    productId: number;
    attributeAssignments: AttributeAssignment[];
}

export interface ProductVariantResponse {
    id: number;
    name: string;
    displayName: string;
    internalReference?: string;
    price?: number;
    cost?: number;
    effectivePrice?: number;
    effectiveCost?: number;
    calculatedPriceFromExtras?: number;
    totalAttributeExtras?: number;
    image?: string;
    isActive?: boolean;
    status: Status;
    createdAt: string;
    updatedAt: string;
    productTemplateId: number;
    productTemplateName: string;
    attributeValues?: ProductAttributeValueResponse[];
    attributeCombination?: string;
}

export interface ProductVariantCreateRequest {
    productId: number;
    attributeValueIds: number[];
    price?: number;
    cost?: number;
    internalReference?: string;
    isActive?: boolean;
}

export interface ProductVariantUpdateRequest {
    price?: number;
    cost?: number;
    internalReference?: string;
    isActive?: boolean;
}

export interface ProductVariantPricingRequest {
    variantId: number;
    price?: number;
    cost?: number;
}

export interface AttributeValuePriceExtra {
    attributeValueId: number;
    priceExtra?: number;
}

export interface AttributeValuePriceExtraRequest {
    attributeValuePriceExtras: AttributeValuePriceExtra[];
}

export interface ProductPosConfigRequest {
    productId: number;
    availableInPos?: boolean;
    posCategoryId?: number;
    posSequence?: number;
}

export interface ProductResponse {
    id: number;
    name: string;
    size?: string;
    price?: number;
    cost?: number;
    type: 'CONSUMABLE' | 'STOCKABLE' | 'SERVICE' | 'EXTRA';
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
    category?: {
        id: number;
        code: string;
        name: string;
        description?: string;
        status: Status;
        createdAt: string;
        updatedAt: string;
    };
}

// ========== API Functions ==========

// Product Attributes
export const createProductAttribute = async (
    data: ProductAttributeCreateRequest,
    saveAndNew: boolean = false
): Promise<ProductAttributeResponse> => {
    const params = saveAndNew ? '?saveAndNew=true' : '';
    const response = await apiClient.post<
        ApiResponse<ProductAttributeResponse>
    >(`/api/menu/product-attributes${params}`, data);
    return response.data.data;
};

export const getAllProductAttributes = async (): Promise<
    ProductAttributeResponse[]
> => {
    const response = await apiClient.get<
        ApiResponse<ProductAttributeResponse[]>
    >('/api/menu/product-attributes');
    return response.data.data;
};

export const getProductAttribute = async (
    id: number
): Promise<ProductAttributeResponse> => {
    const response = await apiClient.get<ApiResponse<ProductAttributeResponse>>(
        `/api/menu/product-attributes/${id}`
    );
    return response.data.data;
};

export const updateProductAttribute = async (
    id: number,
    data: ProductAttributeCreateRequest
): Promise<ProductAttributeResponse> => {
    const response = await apiClient.put<ApiResponse<ProductAttributeResponse>>(
        `/api/menu/product-attributes/${id}`,
        data
    );
    return response.data.data;
};

export const deleteProductAttribute = async (id: number): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
        `/api/menu/product-attributes/${id}`
    );
    return response.data.data;
};

// Attribute Values
export const createAttributeValue = async (
    data: ProductAttributeValueCreateRequest
): Promise<ProductAttributeValueResponse> => {
    const response = await apiClient.post<
        ApiResponse<ProductAttributeValueResponse>
    >('/api/menu/product-attributes/values', data);
    return response.data.data;
};

export const getAttributeValues = async (
    attributeId: number
): Promise<ProductAttributeValueResponse[]> => {
    const response = await apiClient.get<
        ApiResponse<ProductAttributeValueResponse[]>
    >(`/api/menu/product-attributes/${attributeId}/values`);
    return response.data.data;
};

export const updateAttributeValue = async (
    id: number,
    data: ProductAttributeValueCreateRequest
): Promise<ProductAttributeValueResponse> => {
    const response = await apiClient.put<
        ApiResponse<ProductAttributeValueResponse>
    >(`/api/menu/product-attributes/values/${id}`, data);
    return response.data.data;
};

export const deleteAttributeValue = async (id: number): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
        `/api/menu/product-attributes/values/${id}`
    );
    return response.data.data;
};

// Product Variants
export const assignAttributesToProduct = async (
    data: ProductAttributeAssignRequest
): Promise<ProductVariantResponse[]> => {
    const response = await apiClient.post<
        ApiResponse<ProductVariantResponse[]>
    >('/api/menu/product-attributes/assign', data);
    return response.data.data;
};

export const getProductVariants = async (
    productId: number
): Promise<ProductVariantResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductVariantResponse[]>>(
        `/api/menu/product-attributes/products/${productId}/variants`
    );
    return response.data.data;
};

export const createProductVariant = async (
    data: ProductVariantCreateRequest
): Promise<ProductVariantResponse> => {
    const response = await apiClient.post<ApiResponse<ProductVariantResponse>>(
        '/api/menu/product-attributes/variants',
        data
    );
    return response.data.data;
};

export const getProductVariant = async (
    id: number
): Promise<ProductVariantResponse> => {
    const response = await apiClient.get<ApiResponse<ProductVariantResponse>>(
        `/api/menu/product-attributes/variants/${id}`
    );
    return response.data.data;
};

export const updateProductVariant = async (
    id: number,
    data: ProductVariantUpdateRequest
): Promise<ProductVariantResponse> => {
    const response = await apiClient.put<ApiResponse<ProductVariantResponse>>(
        `/api/menu/product-attributes/variants/${id}`,
        data
    );
    return response.data.data;
};

export const archiveProductVariant = async (
    id: number
): Promise<ProductVariantResponse> => {
    const response = await apiClient.put<ApiResponse<ProductVariantResponse>>(
        `/api/menu/product-attributes/variants/${id}/archive`
    );
    return response.data.data;
};

export const unarchiveProductVariant = async (
    id: number
): Promise<ProductVariantResponse> => {
    const response = await apiClient.put<ApiResponse<ProductVariantResponse>>(
        `/api/menu/product-attributes/variants/${id}/unarchive`
    );
    return response.data.data;
};

export const deleteProductVariant = async (id: number): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
        `/api/menu/product-attributes/variants/${id}`
    );
    return response.data.data;
};

export const updateVariantPricing = async (
    data: ProductVariantPricingRequest
): Promise<ProductVariantResponse> => {
    const response = await apiClient.put<ApiResponse<ProductVariantResponse>>(
        '/api/menu/product-attributes/variants/pricing',
        data
    );
    return response.data.data;
};

// Attribute Value Price Extras
export const updateAttributeValuePriceExtras = async (
    data: AttributeValuePriceExtraRequest
): Promise<ProductAttributeValueResponse[]> => {
    const response = await apiClient.put<
        ApiResponse<ProductAttributeValueResponse[]>
    >('/api/menu/product-attributes/values/price-extras', data);
    return response.data.data;
};

// POS Configuration
export const updateProductPosConfig = async (
    data: ProductPosConfigRequest
): Promise<ProductResponse> => {
    const response = await apiClient.put<ApiResponse<ProductResponse>>(
        '/api/menu/product-attributes/pos-config',
        data
    );
    return response.data.data;
};

/**
 * @deprecated Use getProductsForCategory instead
 */
export const getProductsForPosCategory = async (
    posCategoryId: number
): Promise<ProductResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductResponse[]>>(
        `/api/menu/product-attributes/categories/${posCategoryId}/products`
    );
    return response.data.data;
};

export const getProductsForCategory = async (
    categoryId: number
): Promise<ProductResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductResponse[]>>(
        `/api/menu/product-attributes/categories/${categoryId}/products`
    );
    return response.data.data;
};

export const getAvailablePosProducts = async (): Promise<ProductResponse[]> => {
    const response = await apiClient.get<ApiResponse<ProductResponse[]>>(
        '/api/menu/product-attributes/pos/available'
    );
    return response.data.data;
};

// Assign attributes to product using PUT /api/menu/product-attributes/assign
export const removeAttributesFromProduct = async (
    productId: number
): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
        `/api/menu/product-attributes/products/${productId}/attributes`
    );
    return response.data.data;
};

// ========== React Query Hooks ==========

// Product Attributes Hooks
export const useAllProductAttributes = () => {
    return useQuery({
        queryKey: ['product-attributes', 'all'],
        queryFn: getAllProductAttributes,
    });
};

export const useProductAttribute = (id: number) => {
    return useQuery({
        queryKey: ['product-attributes', id],
        queryFn: () => getProductAttribute(id),
        enabled: !!id,
    });
};

export const useCreateProductAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            data,
            saveAndNew = false,
        }: {
            data: ProductAttributeCreateRequest;
            saveAndNew?: boolean;
        }) => createProductAttribute(data, saveAndNew),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
        },
    });
};

export const useUpdateProductAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: ProductAttributeCreateRequest;
        }) => updateProductAttribute(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            queryClient.invalidateQueries({
                queryKey: ['product-attributes', id],
            });
        },
    });
};

export const useDeleteProductAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProductAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
        },
    });
};

// Attribute Values Hooks
export const useAttributeValues = (attributeId: number) => {
    return useQuery({
        queryKey: ['product-attributes', attributeId, 'values'],
        queryFn: () => getAttributeValues(attributeId),
        enabled: !!attributeId,
    });
};

export const useCreateAttributeValue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAttributeValue,
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({
                queryKey: ['product-attributes', data.attributeId, 'values'],
            });
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
        },
    });
};

export const useUpdateAttributeValue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: ProductAttributeValueCreateRequest;
        }) => updateAttributeValue(id, data),
        onSuccess: (_, { data }) => {
            queryClient.invalidateQueries({
                queryKey: ['product-attributes', data.attributeId, 'values'],
            });
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
        },
    });
};

export const useDeleteAttributeValue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAttributeValue,
        onSuccess: () => {
            // Invalidate all product attributes and their values
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            // Invalidate all attribute values queries
            queryClient.invalidateQueries({
                queryKey: ['product-attributes'],
                predicate: (query) => query.queryKey.includes('values'),
            });
        },
    });
};

// Product Variants Hooks
export const useProductVariants = (productId: number) => {
    return useQuery({
        queryKey: ['product-variants', productId],
        queryFn: () => getProductVariants(productId),
        enabled: !!productId,
    });
};

export const useProductVariant = (id: number) => {
    return useQuery({
        queryKey: ['product-variants', 'single', id],
        queryFn: () => getProductVariant(id),
        enabled: !!id,
    });
};

export const useAssignAttributesToProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: assignAttributesToProduct,
        onSuccess: (_, variables) => {
            // Invalidate product variants for the specific product
            queryClient.invalidateQueries({
                queryKey: ['product-variants', variables.productId],
            });
            // Invalidate product detail
            queryClient.invalidateQueries({
                queryKey: ['products', variables.productId, 'detail'],
            });
            // Invalidate all products list
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // Invalidate product attributes (in case counts changed)
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
        },
    });
};

export const useCreateProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProductVariant,
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({
                queryKey: ['product-variants', data.productId],
            });
            queryClient.invalidateQueries({
                queryKey: ['products', data.productId, 'detail'],
            });
        },
    });
};

export const useUpdateProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: ProductVariantPricingRequest;
        }) => updateProductVariant(id, data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({
                queryKey: ['product-variants', result.productTemplateId],
            });
            queryClient.invalidateQueries({
                queryKey: ['product-variants', 'single'],
            });
            queryClient.invalidateQueries({
                queryKey: ['products', result.productTemplateId, 'detail'],
            });
        },
    });
};

export const useArchiveProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: archiveProductVariant,
        onSuccess: (result) => {
            // Invalidate product variants for the specific product
            queryClient.invalidateQueries({
                queryKey: ['product-variants', result.productTemplateId],
            });
            // Invalidate all product variants
            queryClient.invalidateQueries({ queryKey: ['product-variants'] });
            // Invalidate product detail
            queryClient.invalidateQueries({
                queryKey: ['products', result.productTemplateId, 'detail'],
            });
        },
    });
};

export const useUnarchiveProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: unarchiveProductVariant,
        onSuccess: (result) => {
            // Invalidate product variants for the specific product
            queryClient.invalidateQueries({
                queryKey: ['product-variants', result.productTemplateId],
            });
            // Invalidate all product variants
            queryClient.invalidateQueries({ queryKey: ['product-variants'] });
            // Invalidate product detail
            queryClient.invalidateQueries({
                queryKey: ['products', result.productTemplateId, 'detail'],
            });
        },
    });
};

export const useDeleteProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProductVariant,
        onSuccess: () => {
            // Invalidate all product variants
            queryClient.invalidateQueries({ queryKey: ['product-variants'] });
            // Invalidate all products
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // Invalidate product attributes (in case counts changed)
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
        },
    });
};

export const useUpdateVariantPricing = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateVariantPricing,
        onSuccess: (result) => {
            // Invalidate product variants for the specific product
            queryClient.invalidateQueries({
                queryKey: ['product-variants', result.productTemplateId],
            });
            // Invalidate single variant queries
            queryClient.invalidateQueries({
                queryKey: ['product-variants', 'single'],
            });
            // Invalidate product detail
            queryClient.invalidateQueries({
                queryKey: ['products', result.productTemplateId, 'detail'],
            });
            // Invalidate products list
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

// Price Extras and POS Config Hooks
export const useUpdateAttributeValuePriceExtras = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAttributeValuePriceExtras,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
        },
    });
};

export const useUpdateProductPosConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProductPosConfig,
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({
                queryKey: ['products', data.productId, 'detail'],
            });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

/**
 * @deprecated Use useProductsForCategory instead
 */
export const useProductsForPosCategory = (posCategoryId: number) => {
    return useQuery({
        queryKey: ['categories', posCategoryId, 'products'],
        queryFn: () => getProductsForPosCategory(posCategoryId),
        enabled: !!posCategoryId,
    });
};

export const useProductsForCategory = (categoryId: number) => {
    return useQuery({
        queryKey: ['categories', categoryId, 'products'],
        queryFn: () => getProductsForCategory(categoryId),
        enabled: !!categoryId,
    });
};

export const useAvailablePosProducts = () => {
    return useQuery({
        queryKey: ['pos', 'available-products'],
        queryFn: getAvailablePosProducts,
    });
};

export const useRemoveAttributesFromProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeAttributesFromProduct,
        onSuccess: (_, productId) => {
            // Invalidate product variants for the specific product
            queryClient.invalidateQueries({
                queryKey: ['product-variants', productId],
            });
            // Invalidate product detail
            queryClient.invalidateQueries({
                queryKey: ['products', productId, 'detail'],
            });
            // Invalidate products list
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // Invalidate product attributes (counts may have changed)
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
        },
    });
};
