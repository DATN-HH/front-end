import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';

// ========== Type Definitions ==========

export interface AttributeValue {
    id: number;
    name: string;
    colorCode: string | null;
    sequence: number;
    priceExtra: number | null;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    attributeId: number;
    attributeName: string;
    usageCount: number;
}

export interface MenuVariant {
    id: number;
    name: string;
    displayName: string;
    internalReference: string | null;
    price: number | null;
    cost: number;
    effectivePrice: number;
    effectiveCost: number;
    calculatedPriceFromExtras: number;
    totalAttributeExtras: number;
    image: string | null;
    isActive: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    productTemplateId: number;
    productTemplateName: string;
    attributeValues: AttributeValue[];
    attributeCombination: string;
}

export interface MenuProduct {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    estimateTime: number;
    posSequence: number;
    variants: MenuVariant[];
}

export interface MenuProductsResponse {
    success: boolean;
    code: number;
    message: string;
    data: MenuProduct[];
}

// API Response wrapper interface
interface ApiResponse<T> {
    success?: boolean;
    code?: number;
    message?: string;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

// ========== API Functions ==========

// Get menu products by category
export const getMenuProductsByCategory = async (categoryId: number): Promise<MenuProduct[]> => {
    try {
        const response = await apiClient.get<MenuProductsResponse>(
            `/api/menu/categories/${categoryId}/products`
        );

        // Handle the new response format
        if (response.data.success && response.data.data) {
            return response.data.data;
        } else {
            return [];
        }
    } catch (error: any) {
        // Handle 404 - category not found or no products
        if (error.response?.status === 404) {
            return [];
        }
        throw error;
    }
};

// Get product variants by product ID
export const getProductVariants = async (productId: number): Promise<MenuVariant[]> => {
    try {
        const response = await apiClient.get<MenuProductsResponse>(
            `/api/menu/categories/7/products` // This will be updated when we have the correct endpoint
        );

        if (response.data.success && response.data.data) {
            // Find the product and return its variants
            const product = response.data.data.find(p => p.id === productId);
            return product?.variants || [];
        } else {
            return [];
        }
    } catch (error: any) {
        if (error.response?.status === 404) {
            return [];
        }
        throw error;
    }
};

// ========== React Query Hooks ==========

export const useMenuProductsByCategory = (categoryId: number) => {
    return useQuery({
        queryKey: ['menu-products', 'category', categoryId],
        queryFn: () => getMenuProductsByCategory(categoryId),
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on 404 errors
            if (error?.response?.status === 404) {
                return false;
            }
            return failureCount < 3;
        },
    });
};

export const useProductVariants = (productId: number) => {
    return useQuery({
        queryKey: ['product-variants', productId],
        queryFn: () => getProductVariants(productId),
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 404) {
                return false;
            }
            return failureCount < 3;
        },
    });
};

// Hook to get products for multiple categories (lazy loading)
export const useMenuProductsForCategories = (categoryIds: number[]) => {
    return useQuery({
        queryKey: ['menu-products', 'categories', categoryIds.sort()],
        queryFn: async () => {
            const results = await Promise.allSettled(
                categoryIds.map(id => getMenuProductsByCategory(id))
            );
            
            const productsByCategory: Record<number, MenuProduct[]> = {};
            
            results.forEach((result, index) => {
                const categoryId = categoryIds[index];
                if (result.status === 'fulfilled') {
                    productsByCategory[categoryId] = result.value;
                } else {
                    productsByCategory[categoryId] = [];
                }
            });
            
            return productsByCategory;
        },
        enabled: categoryIds.length > 0,
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });
};

// ========== Utility Functions ==========

// Get variant display name (exclude "Total" attribute from display)
export const getVariantDisplayName = (variant: MenuVariant): string => {
    if (!variant.attributeValues || variant.attributeValues.length === 0) {
        return variant.displayName || variant.name;
    }

    // Filter out "Total" attribute and create a clean display name
    const displayAttributes = variant.attributeValues
        .filter(attr => attr.attributeName !== "Total")
        .map(attr => `${attr.attributeName}: ${attr.name}`)
        .join(", ");

    return displayAttributes || variant.displayName || variant.name;
};

// Get variant price from attributeValues with attributeName "Total"
export const getVariantPrice = (variant: MenuVariant, productPrice: number): number => {
    // First try to get price from "Total" attribute
    const totalAttribute = variant.attributeValues?.find(attr => attr.attributeName === "Total");
    if (totalAttribute && totalAttribute.name) {
        const price = parseFloat(totalAttribute.name);
        if (!isNaN(price)) {
            return price;
        }
    }

    // Fallback to variant.price if exists
    if (variant.price) {
        return variant.price;
    }

    // Final fallback to product price
    return productPrice;
};

// Calculate price range for products with variants
export const calculatePriceRange = (product: MenuProduct): { min: number; max: number; hasRange: boolean } => {
    if (!product.variants || product.variants.length === 0) {
        return {
            min: product.price,
            max: product.price,
            hasRange: false
        };
    }

    const prices = product.variants.map(variant => getVariantPrice(variant, product.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return {
        min,
        max,
        hasRange: min !== max
    };
};

// Format price in Vietnamese currency
export const formatVietnameseCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Format price range
export const formatPriceRange = (product: MenuProduct): string => {
    const { min, max, hasRange } = calculatePriceRange(product);

    // For products without variants, always show product price
    if (!product.variants || product.variants.length === 0) {
        return formatVietnameseCurrency(product.price);
    }

    // For products with variants, show range if different prices
    if (!hasRange) {
        return formatVietnameseCurrency(min);
    }

    return `${formatVietnameseCurrency(min)} - ${formatVietnameseCurrency(max)}`;
};
