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

// Get single menu product by ID
const getMenuProduct = async (productId: number): Promise<MenuProduct> => {
    try {
        const response = await apiClient.get<ApiResponse<MenuProduct>>(
            `/api/menu/menu-products/${productId}`
        );

        // Handle the new response format
        if (response.data.success && response.data.data) {
            return response.data.data;
        } else {
            throw new Error('Product not found');
        }
    } catch (error: any) {
        // Handle 404 - product not found
        if (error.response?.status === 404) {
            throw new Error('Product not found');
        }
        throw error;
    }
};

// Get menu products by category
const getMenuProductsByCategory = async (
    categoryId: number
): Promise<MenuProduct[]> => {
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

// ========== React Query Hooks ==========

export const useMenuProduct = (productId: number) => {
    return useQuery({
        queryKey: ['menu-product', productId],
        queryFn: () => getMenuProduct(productId),
        enabled: !!productId,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on 404 errors
            if (error?.response?.status === 404) {
                return false;
            }
            return failureCount < 3;
        },
    });
};

export const useMenuProductsByCategory = (categoryId: number) => {
    return useQuery({
        queryKey: ['menu-products', 'category', categoryId],
        queryFn: () => getMenuProductsByCategory(categoryId),
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on 404 errors
            if (error?.response?.status === 404) {
                return false;
            }
            return failureCount < 3;
        },
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
        .filter((attr) => attr.attributeName !== 'Total')
        .map((attr) => `${attr.attributeName}: ${attr.name}`)
        .join(', ');

    return displayAttributes || variant.displayName || variant.name;
};

// Get variant price from attributeValues with attributeName "Total"
export const getVariantPrice = (
    variant: MenuVariant,
    productPrice: number
): number => {
    // First try to use variant.effectivePrice if exists and > 0
    if (variant.effectivePrice && variant.effectivePrice > 0) {
        return variant.effectivePrice;
    }

    // Second try to use variant.price if exists
    if (variant.price && variant.price > 0) {
        return variant.price;
    }

    // Try to extract price from variant name (format: "price, size #id")
    if (variant.name) {
        const priceMatch = variant.name.match(/^(\d+)/);
        if (priceMatch) {
            const extractedPrice = parseInt(priceMatch[1]);
            if (!isNaN(extractedPrice) && extractedPrice > 0) {
                return extractedPrice;
            }
        }
    }

    // Fallback to get price from "Total" attribute
    const totalAttribute = variant.attributeValues?.find(
        (attr) => attr.attributeName === 'Total'
    );
    if (totalAttribute?.name) {
        const price = parseFloat(totalAttribute.name);
        if (!isNaN(price) && price > 0) {
            return price;
        }
    }

    // Final fallback to product price
    return productPrice;
};

// Calculate price range for products with variants
export const calculatePriceRange = (
    product: MenuProduct
): { min: number; max: number; hasRange: boolean } => {
    const basePrice = product.price || 0;

    if (!product.variants || product.variants.length === 0) {
        return {
            min: basePrice,
            max: basePrice,
            hasRange: false,
        };
    }

    const prices = product.variants.map((variant) =>
        getVariantPrice(variant, basePrice)
    );
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return {
        min,
        max,
        hasRange: min !== max,
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
