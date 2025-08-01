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

export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface ComboItemRequest {
    productId: number;
    quantity: number;
    unitPrice?: number;
    unitCost?: number;
    sequenceOrder?: number;
    notes?: string;
    isOptional?: boolean;
    isSubstitutable?: boolean;
}

export interface ComboItemUpdateRequest extends ComboItemRequest {
    id?: number;
    markedForDeletion?: boolean;
}

export interface ComboAttributeAssignmentRequest {
    attributeId: number;
    selectedValueIds?: number[];
    textValue?: string;
}

export interface ComboAttributeAssignmentUpdateRequest
    extends ComboAttributeAssignmentRequest {
    id?: number;
    markedForDeletion?: boolean;
}

export interface FoodComboCreateRequest {
    name: string;
    description?: string;
    price?: number;
    cost?: number;
    image?: string;
    internalReference?: string;
    estimateTime?: number;
    canBeSold?: boolean;
    canBePurchased?: boolean;
    availableInPos?: boolean;
    posSequence?: number;
    categoryId?: number;
    posCategoryId?: number;
    comboItems: ComboItemRequest[];
    attributeAssignments?: ComboAttributeAssignmentRequest[];
}

export interface FoodComboUpdateRequest {
    name: string;
    description?: string;
    price?: number;
    cost?: number;
    image?: string;
    internalReference?: string;
    estimateTime?: number;
    canBeSold?: boolean;
    canBePurchased?: boolean;
    availableInPos?: boolean;
    posSequence?: number;
    categoryId?: number;
    posCategoryId?: number;
    comboItems: ComboItemUpdateRequest[];
    attributeAssignments?: ComboAttributeAssignmentUpdateRequest[];
}

export interface ComboItemResponse {
    id: number;
    productId: number;
    productName: string;
    productImage?: string;
    productDescription?: string;
    productPrice?: number;
    productCost?: number;
    quantity: number;
    unitPrice?: number;
    unitCost?: number;
    effectiveUnitPrice: number;
    effectiveUnitCost: number;
    totalPrice: number;
    totalCost: number;
    sequenceOrder: number;
    notes?: string;
    isOptional: boolean;
    isSubstitutable: boolean;
    status: Status;
}

export interface ComboAttributeLineResponse {
    id: number;
    attributeId: number;
    attributeName: string;
    attributeDisplayType: string;
    textValue?: string;
    selectedValues: AttributeValueResponse[];
    displayValue: string;
    isTextboxAttribute: boolean;
}

export interface AttributeValueResponse {
    id: number;
    name: string;
    colorCode?: string;
    sequence?: number;
    description?: string;
}

export interface ComboVariantResponse {
    id: number;
    name: string;
    displayName: string;
    internalReference?: string;
    price?: number;
    cost?: number;
    effectivePrice: number;
    effectiveCost: number;
    image?: string;
    isActive: boolean;
    status: Status;
    createdAt: string;
    updatedAt: string;
    attributeValues: AttributeValueResponse[];
    attributeCombination: string;
    comboTemplateId: number;
    comboTemplateName: string;
}

export interface FoodComboResponse {
    id: number;
    name: string;
    description?: string;
    price?: number;
    cost?: number;
    effectivePrice: number;
    effectiveCost: number;
    calculatedPrice: number;
    calculatedCost: number;
    image?: string;
    internalReference?: string;
    estimateTime?: number;
    canBeSold: boolean;
    canBePurchased: boolean;
    availableInPos: boolean;
    posSequence?: number;
    status: Status;
    createdAt: string;
    updatedAt: string;

    // Category information
    categoryId?: number;
    categoryName?: string;
    posCategoryId?: number;
    posCategoryName?: string;

    // Combo composition
    comboItems: ComboItemResponse[];
    attributeLines: ComboAttributeLineResponse[];
    variants: ComboVariantResponse[];

    // Computed fields
    itemsCount: number;
    variantsCount: number;
    hasVariants: boolean;
    hasAttributes: boolean;
}

// ========== API Functions ==========

// Create Food Combo
const createFoodCombo = async (
    data: FoodComboCreateRequest,
    saveAndNew: boolean = false
): Promise<FoodComboResponse> => {
    const params = saveAndNew ? '?saveAndNew=true' : '';
    const response = await apiClient.post<ApiResponse<FoodComboResponse>>(
        `/api/menu/food-combos${params}`,
        data
    );
    return response.data.data;
};

// Get all Food Combos
const getAllFoodCombos = async (): Promise<FoodComboResponse[]> => {
    const response = await apiClient.get<ApiResponse<FoodComboResponse[]>>(
        '/api/menu/food-combos'
    );
    return response.data.data;
};

// Get single Food Combo
const getFoodCombo = async (id: number): Promise<FoodComboResponse> => {
    const response = await apiClient.get<ApiResponse<FoodComboResponse>>(
        `/api/menu/food-combos/${id}`
    );
    return response.data.data;
};

// Update Food Combo
const updateFoodCombo = async (
    id: number,
    data: FoodComboUpdateRequest
): Promise<FoodComboResponse> => {
    const response = await apiClient.put<ApiResponse<FoodComboResponse>>(
        `/api/menu/food-combos/${id}`,
        data
    );
    return response.data.data;
};

// Delete Food Combo
const deleteFoodCombo = async (id: number): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
        `/api/menu/food-combos/${id}`
    );
    return response.data.data;
};

// Add Product to Combo
const addProductToCombo = async (
    comboId: number,
    productId: number,
    quantity: number = 1
): Promise<FoodComboResponse> => {
    const response = await apiClient.post<ApiResponse<FoodComboResponse>>(
        `/api/menu/food-combos/${comboId}/products/${productId}?quantity=${quantity}`
    );
    return response.data.data;
};

// Remove Product from Combo
const removeProductFromCombo = async (
    comboId: number,
    productId: number
): Promise<FoodComboResponse> => {
    const response = await apiClient.delete<ApiResponse<FoodComboResponse>>(
        `/api/menu/food-combos/${comboId}/products/${productId}`
    );
    return response.data.data;
};

// Update Combo Item Quantity
const updateComboItemQuantity = async (
    comboId: number,
    productId: number,
    quantity: number
): Promise<FoodComboResponse> => {
    const response = await apiClient.put<ApiResponse<FoodComboResponse>>(
        `/api/menu/food-combos/${comboId}/products/${productId}/quantity?quantity=${quantity}`
    );
    return response.data.data;
};

// Search Food Combos
const searchFoodCombos = async (
    searchTerm: string
): Promise<FoodComboResponse[]> => {
    const response = await apiClient.get<ApiResponse<FoodComboResponse[]>>(
        `/api/menu/food-combos/search?q=${encodeURIComponent(searchTerm)}`
    );
    return response.data.data;
};

// Get Food Combos by Category
const getFoodCombosByCategory = async (
    categoryId: number
): Promise<FoodComboResponse[]> => {
    const response = await apiClient.get<ApiResponse<FoodComboResponse[]>>(
        `/api/menu/food-combos/category/${categoryId}`
    );
    return response.data.data;
};

// Get Food Combos by POS Category
const getFoodCombosByPosCategory = async (
    posCategoryId: number
): Promise<FoodComboResponse[]> => {
    const response = await apiClient.get<ApiResponse<FoodComboResponse[]>>(
        `/api/menu/food-combos/pos-category/${posCategoryId}`
    );
    return response.data.data;
};

// Get Available POS Combos
const getAvailablePosCombo = async (): Promise<FoodComboResponse[]> => {
    try {
        // First try to get from regular endpoint
        const response = await apiClient.get<ApiResponse<FoodComboResponse[]>>(
            '/api/menu/food-combos'
        );

        // Filter active combos
        const activeCombos = response.data.data.filter(
            (combo) => combo.status === 'ACTIVE' && combo.canBeSold
        );

        // If we have combos, return them
        if (activeCombos.length > 0) {
            return activeCombos;
        }

        // If no combos found, use hardcoded demo data
        return [
            {
                id: 1001,
                name: 'Lunch Special',
                description: 'Main dish with beverage',
                price: 150000,
                cost: 95000,
                effectivePrice: 150000,
                effectiveCost: 95000,
                calculatedPrice: 150000,
                calculatedCost: 95000,
                categoryId: 1,
                categoryName: 'Set Meals',
                posCategoryId: 1,
                posCategoryName: 'Set Meals',
                canBeSold: true,
                canBePurchased: true,
                availableInPos: true,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                comboItems: [],
                attributeLines: [],
                variants: [],
                itemsCount: 2,
                variantsCount: 0,
                hasVariants: false,
                hasAttributes: false,
            },
            {
                id: 1002,
                name: 'Dinner Special',
                description: 'Complete dinner set with dessert',
                price: 190000,
                cost: 120000,
                effectivePrice: 190000,
                effectiveCost: 120000,
                calculatedPrice: 190000,
                calculatedCost: 120000,
                categoryId: 1,
                categoryName: 'Set Meals',
                posCategoryId: 1,
                posCategoryName: 'Set Meals',
                canBeSold: true,
                canBePurchased: true,
                availableInPos: true,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                comboItems: [],
                attributeLines: [],
                variants: [],
                itemsCount: 3,
                variantsCount: 0,
                hasVariants: false,
                hasAttributes: false,
            },
        ];
    } catch (error) {
        console.error('Error fetching food combos for POS:', error);
        return [];
    }
};

// ========== React Query Hooks ==========

// Food Combo Hooks
export const useAllFoodCombos = () => {
    return useQuery({
        queryKey: ['food-combos', 'all'],
        queryFn: getAllFoodCombos,
    });
};

export const useFoodCombo = (id: number) => {
    return useQuery({
        queryKey: ['food-combos', id],
        queryFn: () => getFoodCombo(id),
        enabled: !!id,
    });
};

export const useCreateFoodCombo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            data,
            saveAndNew = false,
        }: {
            data: FoodComboCreateRequest;
            saveAndNew?: boolean;
        }) => createFoodCombo(data, saveAndNew),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-combos'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Combos might affect product listings
        },
    });
};

export const useUpdateFoodCombo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: FoodComboUpdateRequest;
        }) => updateFoodCombo(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['food-combos'] });
            queryClient.invalidateQueries({ queryKey: ['food-combos', id] });
        },
    });
};

export const useDeleteFoodCombo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteFoodCombo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food-combos'] });
        },
    });
};

// Combo Product Management Hooks
export const useAddProductToCombo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            comboId,
            productId,
            quantity,
        }: {
            comboId: number;
            productId: number;
            quantity?: number;
        }) => addProductToCombo(comboId, productId, quantity),
        onSuccess: (_, { comboId }) => {
            queryClient.invalidateQueries({ queryKey: ['food-combos'] });
            queryClient.invalidateQueries({
                queryKey: ['food-combos', comboId],
            });
        },
    });
};

export const useRemoveProductFromCombo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            comboId,
            productId,
        }: {
            comboId: number;
            productId: number;
        }) => removeProductFromCombo(comboId, productId),
        onSuccess: (_, { comboId }) => {
            queryClient.invalidateQueries({ queryKey: ['food-combos'] });
            queryClient.invalidateQueries({
                queryKey: ['food-combos', comboId],
            });
        },
    });
};

export const useUpdateComboItemQuantity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            comboId,
            productId,
            quantity,
        }: {
            comboId: number;
            productId: number;
            quantity: number;
        }) => updateComboItemQuantity(comboId, productId, quantity),
        onSuccess: (_, { comboId }) => {
            queryClient.invalidateQueries({ queryKey: ['food-combos'] });
            queryClient.invalidateQueries({
                queryKey: ['food-combos', comboId],
            });
        },
    });
};

// Search and Filter Hooks
export const useSearchFoodCombos = (searchTerm: string) => {
    return useQuery({
        queryKey: ['food-combos', 'search', searchTerm],
        queryFn: () => searchFoodCombos(searchTerm),
        enabled: !!searchTerm && searchTerm.length > 0,
    });
};

export const useFoodCombosByCategory = (categoryId: number) => {
    return useQuery({
        queryKey: ['food-combos', 'category', categoryId],
        queryFn: () => getFoodCombosByCategory(categoryId),
        enabled: !!categoryId,
    });
};

export const useFoodCombosByPosCategory = (posCategoryId: number) => {
    return useQuery({
        queryKey: ['food-combos', 'pos-category', posCategoryId],
        queryFn: () => getFoodCombosByPosCategory(posCategoryId),
        enabled: !!posCategoryId,
    });
};

export const useAvailablePosCombo = () => {
    return useQuery({
        queryKey: ['food-combos', 'pos', 'available'],
        queryFn: getAvailablePosCombo,
    });
};
