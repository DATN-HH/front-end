'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/services/api-client';
import { BaseResponse } from '@/api/v1';

// Types for product variants
interface ProductVariant {
    id: number;
    name: string;
    displayName: string;
    effectivePrice: number;
    attributeCombination: string;
    attributeValues: Array<{
        id: number;
        value: string;
        attributeName: string;
        priceExtra: number;
    }>;
    isActive: boolean;
}

interface POSProductVariantModalProps {
    product: any;
    onVariantSelect: (variant: ProductVariant) => void;
    onClose: () => void;
}

// API call to fetch product variants
const fetchProductVariants = async (
    productId: number
): Promise<ProductVariant[]> => {
    try {
        console.log('Fetching variants for product ID:', productId);
        // Use the correct API endpoint path from product-attributes.ts
        const response = await apiClient.get<any>(
            `/api/menu/product-attributes/products/${productId}/variants`
        );
        console.log('API response for variants:', response.data);
        // Extract data based on the API response structure
        const variants = response.data.data || [];
        return variants.filter((variant: any) => variant.isActive !== false);
    } catch (error) {
        console.error('Error fetching product variants:', error);
        return [];
    }
};

export function POSProductVariantModal({
    product,
    onVariantSelect,
    onClose,
}: POSProductVariantModalProps) {
    const [selectedVariant, setSelectedVariant] =
        useState<ProductVariant | null>(null);

    // Fetch product variants
    const {
        data: variants = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['product-variants', product.id],
        queryFn: () => fetchProductVariants(product.id),
        enabled: !!product.id,
    });

    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);
    };

    const handleConfirmSelection = () => {
        if (selectedVariant) {
            onVariantSelect(selectedVariant);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Select {product.name} Variant</span>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex h-[60vh]">
                    {/* Left Panel - Product Info */}
                    <div className="w-1/3 border-r border-gray-200 pr-4">
                        <div className="space-y-4">
                            {/* Product Image */}
                            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {product.name}
                                </h3>
                                {product.description && (
                                    <p className="text-sm text-gray-600 mb-4">
                                        {product.description}
                                    </p>
                                )}
                            </div>

                            {/* Selected Variant Info */}
                            {selectedVariant && (
                                <Card className="p-4 bg-blue-50 border-blue-200">
                                    <h4 className="font-medium text-blue-900 mb-2">
                                        Selected Variant
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="font-medium">
                                            {selectedVariant.displayName}
                                        </div>
                                        <div className="text-blue-700">
                                            {
                                                selectedVariant.attributeCombination
                                            }
                                        </div>
                                        <div className="text-lg font-bold text-blue-900">
                                            $
                                            {selectedVariant.effectivePrice.toFixed(
                                                2
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Variant Selection */}
                    <div className="flex-1 pl-4">
                        <div className="h-full overflow-y-auto">
                            {isLoading ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {Array.from({ length: 6 }).map(
                                        (_, index) => (
                                            <Card key={index} className="p-4">
                                                <Skeleton className="h-4 w-3/4 mb-2" />
                                                <Skeleton className="h-3 w-1/2 mb-2" />
                                                <Skeleton className="h-4 w-1/4" />
                                            </Card>
                                        )
                                    )}
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-600 py-8">
                                    <div className="text-lg font-medium mb-2">
                                        Error loading variants
                                    </div>
                                    <div className="text-sm">
                                        Please try again
                                    </div>
                                </div>
                            ) : variants.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <div className="text-lg font-medium mb-2">
                                        No variants available
                                    </div>
                                    <div className="text-sm mb-4">
                                        This product does not have any variants yet. 
                                        Go to the product detail page to create new variants.
                                    </div>
                                    <div className="flex flex-col space-y-3">
                                        <Button
                                            onClick={() => {
                                                // Create a basic variant from the product itself
                                                const basicVariant = {
                                                    id: product.id,
                                                    name: product.name,
                                                    displayName: product.name,
                                                    effectivePrice: product.price,
                                                    attributeCombination: 'Standard',
                                                    attributeValues: [],
                                                    isActive: true
                                                };
                                                onVariantSelect(basicVariant as ProductVariant);
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                                        >
                                            Add Standard Option
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                // Navigate to product detail page
                                                window.location.href = `/app/menu/products/${product.id}/detail`;
                                            }}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Go to Product Detail
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900 mb-4">
                                        Available Variants ({variants.length})
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {variants.map((variant) => (
                                            <VariantCard
                                                key={variant.id}
                                                variant={variant}
                                                isSelected={
                                                    selectedVariant?.id ===
                                                    variant.id
                                                }
                                                onClick={() =>
                                                    handleVariantSelect(variant)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmSelection}
                        disabled={!selectedVariant}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Add to Order
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Variant Card Component
function VariantCard({
    variant,
    isSelected,
    onClick,
}: {
    variant: ProductVariant;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <Card
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 text-sm mb-1 truncate">
                        {variant.displayName}
                    </h5>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {variant.attributeCombination}
                    </p>
                    <div className="text-lg font-bold text-gray-900">
                        ${variant.effectivePrice.toFixed(2)}
                    </div>
                </div>

                {isSelected && (
                    <div className="ml-2 text-blue-600">
                        <Check className="w-5 h-5" />
                    </div>
                )}
            </div>
        </Card>
    );
}
