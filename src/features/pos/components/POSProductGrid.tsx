'use client';

import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';

import { useAllFoodCombos } from '@/api/v1/menu/food-combos';
import { useAllProducts } from '@/api/v1/menu/products';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { POSProductVariantModal } from './POSProductVariantModal';

// Types for POS products - based on variants
interface POSProduct {
    id: number;
    variantId?: number;
    name: string;
    displayName: string;
    description?: string;
    image?: string;
    categoryId?: number;
    categoryName?: string;
    price: number;
    effectivePrice: number;
    attributeCombination?: string;
    productTemplateId: number;
    productTemplateName: string;
    status: string;
    isActive?: boolean;
    isCombo?: boolean;
    hasVariants?: boolean; // Added for grouping
    variants?: any[]; // Keep variants data for dialog
    priceRange?: { min: number; max: number } | null; // Add price range
}

// Category interface extracted from products
interface Category {
    id: number;
    name: string;
}

interface POSProductGridProps {
    onProductSelect: (product: POSProduct) => void;
}

// Helper function to format Vietnamese currency
const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Helper function to convert Product to POSProduct with variant support
const convertProductToPOSProduct = (
    product: any,
    isVariant: boolean = false,
    variant?: any
): POSProduct[] => {
    const results: POSProduct[] = [];
    const baseProduct = product;

    // If this is a variant, create POSProduct for the variant
    if (isVariant && variant) {
        // Only include variants that have a price
        if (variant.price || variant.effectivePrice) {
            results.push({
                id: baseProduct.id,
                variantId: variant.id,
                name: baseProduct.name,
                displayName:
                    variant.displayName ||
                    `${baseProduct.name} (${variant.name})`,
                description: baseProduct.description,
                image: baseProduct.image,
                categoryId: baseProduct.category?.id,
                categoryName: baseProduct.category?.name,
                price: variant.effectivePrice || variant.price || 0,
                effectivePrice: variant.effectivePrice || variant.price || 0,
                attributeCombination: variant.attributeCombination || '',
                productTemplateId: baseProduct.id,
                productTemplateName: baseProduct.name,
                status: baseProduct.status || 'ACTIVE',
                isActive:
                    variant.isActive !== false &&
                    (baseProduct.status === 'ACTIVE' || !baseProduct.status),
                isCombo: false,
            });
        }
    } else {
        // For products without variants or base product
        if (!baseProduct.variants?.length) {
            // Product without variants
            results.push({
                id: baseProduct.id,
                variantId: undefined,
                name: baseProduct.name,
                displayName: baseProduct.name,
                description: baseProduct.description,
                image: baseProduct.image,
                categoryId: baseProduct.category?.id,
                categoryName: baseProduct.category?.name,
                price: baseProduct.price || 0,
                effectivePrice: baseProduct.price || 0,
                attributeCombination: undefined,
                productTemplateId: baseProduct.id,
                productTemplateName: baseProduct.name,
                status: baseProduct.status || 'ACTIVE',
                isActive:
                    baseProduct.status === 'ACTIVE' || !baseProduct.status, // Default to active if no status
                isCombo: false,
            });
        } else {
            // Product with variants - process each variant that has a price
            baseProduct.variants.forEach((variant: any) => {
                if (variant.price || variant.effectivePrice) {
                    results.push({
                        id: baseProduct.id,
                        variantId: variant.id,
                        name: baseProduct.name,
                        displayName:
                            variant.displayName ||
                            `${baseProduct.name} (${variant.name})`,
                        description: baseProduct.description,
                        image: baseProduct.image,
                        categoryId: baseProduct.category?.id,
                        categoryName: baseProduct.category?.name,
                        price: variant.effectivePrice || variant.price || 0,
                        effectivePrice:
                            variant.effectivePrice || variant.price || 0,
                        attributeCombination:
                            variant.attributeCombination || '',
                        productTemplateId: baseProduct.id,
                        productTemplateName: baseProduct.name,
                        status: baseProduct.status || 'ACTIVE',
                        isActive:
                            variant.isActive !== false &&
                            (baseProduct.status === 'ACTIVE' ||
                                !baseProduct.status),
                        isCombo: false,
                    });
                }
            });
        }
    }

    return results.filter((product) => product.isActive);
};

// Helper function to convert FoodCombo to POSProduct
const convertComboToPOSProduct = (combo: any): POSProduct => {
    return {
        id: combo.id || 0,
        variantId: undefined,
        name: combo.name || '',
        displayName: combo.name || '',
        description: combo.description || '',
        image: combo.image || '',
        categoryId: combo.categoryId || combo.posCategoryId || 0,
        categoryName:
            combo.categoryName || combo.posCategoryName || 'Food Combos',
        price: combo.price || combo.effectivePrice || 0,
        effectivePrice: combo.effectivePrice || combo.price || 0,
        attributeCombination: `${combo.itemsCount || 0} items`,
        productTemplateId: combo.id || 0,
        productTemplateName: combo.name || '',
        status: combo.status || 'ACTIVE',
        isActive: combo.status === 'ACTIVE' || !combo.status, // Default to active if no status
        isCombo: true,
    };
};

export function POSProductGrid({ onProductSelect }: POSProductGridProps) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null
    );
    const [showFoodCombos, setShowFoodCombos] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Fetch all products (no more categories API call)
    const {
        data: allProducts = [],
        isLoading: productsLoading,
        error: productsError,
    } = useAllProducts();

    // Fetch available food combos for POS
    const {
        data: allCombos = [],
        isLoading: combosLoading,
        error: combosError,
    } = useAllFoodCombos();

    // Extract categories from products
    const categories = useMemo(() => {
        const categoryMap = new Map<number, Category>();

        allProducts.forEach((product: any) => {
            if (product.category?.id && product.category?.name) {
                categoryMap.set(product.category.id, {
                    id: product.category.id,
                    name: product.category.name,
                });
            }
        });

        const extractedCategories = Array.from(categoryMap.values()).sort(
            (a, b) => a.name.localeCompare(b.name)
        );

        return extractedCategories;
    }, [allProducts]);

    // Convert products to POS products with proper grouping
    const allProductsPOS: POSProduct[] = useMemo(() => {
        const results: POSProduct[] = [];

        allProducts.forEach((product: any) => {
            // Check if product has variants with price
            const variantsWithPrice =
                product.variants?.filter(
                    (v: any) => v.price || v.effectivePrice
                ) || [];

            if (variantsWithPrice.length > 0) {
                // Product has valid variants → show grouped product with price range
                const prices = variantsWithPrice.map(
                    (v: any) => v.effectivePrice || v.price
                );
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                results.push({
                    id: product.id,
                    variantId: undefined, // Base product for grouping
                    name: product.name,
                    displayName: product.name,
                    description: product.description,
                    image: product.image,
                    categoryId: product.category?.id,
                    categoryName: product.category?.name,
                    price: minPrice, // Use min price as base
                    effectivePrice: minPrice,
                    attributeCombination: `${variantsWithPrice.length} variants`, // Show variant count
                    productTemplateId: product.id,
                    productTemplateName: product.name,
                    status: product.status || 'ACTIVE',
                    isActive: product.status === 'ACTIVE' || !product.status,
                    isCombo: false,
                    hasVariants: true, // Has valid variants
                    variants: variantsWithPrice, // Keep variants for modal
                    priceRange:
                        minPrice === maxPrice
                            ? null
                            : { min: minPrice, max: maxPrice }, // Add price range
                });
            } else {
                // No valid variants → show as regular product
                results.push({
                    id: product.id,
                    variantId: undefined,
                    name: product.name,
                    displayName: product.name,
                    description: product.description,
                    image: product.image,
                    categoryId: product.category?.id,
                    categoryName: product.category?.name,
                    price: product.price || 0,
                    effectivePrice: product.price || 0,
                    attributeCombination: undefined,
                    productTemplateId: product.id,
                    productTemplateName: product.name,
                    status: product.status || 'ACTIVE',
                    isActive: product.status === 'ACTIVE' || !product.status,
                    isCombo: false,
                    hasVariants: false, // No valid variants
                    variants: [],
                });
            }
        });

        const activeResults = results.filter((product) => product.isActive);
        return activeResults;
    }, [allProducts]);

    // Convert combos to POS products
    const allCombosPOS: POSProduct[] = useMemo(() => {
        const results = allCombos
            .map((combo: any) => convertComboToPOSProduct(combo))
            .filter((combo) => combo?.isActive);

        return results;
    }, [allCombos]);

    // Combine products and combos
    const allPOSProducts = useMemo(() => {
        const combined = [...allProductsPOS, ...allCombosPOS];
        return combined;
    }, [allProductsPOS, allCombosPOS]);

    // Filter products based on selection
    const categoryFilteredProducts = useMemo(() => {
        // Determine which product set to use based on showFoodCombos toggle
        const baseProducts = showFoodCombos ? allCombosPOS : allProductsPOS;

        // Apply category filter if selected
        if (selectedCategory) {
            const filtered = baseProducts.filter(
                (product) => product.categoryId === selectedCategory
            );
            return filtered;
        }

        return baseProducts;
    }, [showFoodCombos, allCombosPOS, allProductsPOS, selectedCategory]);

    // Filter products by search query
    const filteredProducts = useMemo(() => {
        if (!searchQuery) {
            return categoryFilteredProducts;
        }

        const searchFiltered = categoryFilteredProducts.filter(
            (product) =>
                product.displayName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                product.productTemplateName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                product.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
        );

        return searchFiltered;
    }, [categoryFilteredProducts, searchQuery]);

    return (
        <div className="h-full flex flex-col">
            {/* Search Bar */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 text-sm"
                    />
                </div>

                {/* Category and Food Combo Buttons - Horizontally Scrollable with proper overflow handling */}
                <div className="flex gap-2 mb-3 pb-2 flex-wrap">
                    {/* Show All Button */}
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSelectedCategory(null);
                            setShowFoodCombos(false);
                        }}
                        className="flex-shrink-0 text-sm px-3 py-2 whitespace-nowrap"
                    >
                        Show All ({allProductsPOS.length})
                    </Button>

                    {/* Food Combos Button */}
                    <Button
                        variant={showFoodCombos ? 'default' : 'outline'}
                        className={`flex-shrink-0 px-3 py-2 font-medium text-sm whitespace-nowrap ${
                            showFoodCombos
                                ? 'bg-amber-600 text-white hover:bg-amber-700'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => {
                            setShowFoodCombos(!showFoodCombos);
                            setSelectedCategory(null);
                        }}
                    >
                        Food Combos ({allCombosPOS.length})
                    </Button>

                    {/* Category Buttons */}
                    {categories.map((category) => {
                        // Count products in this category (excluding combos)
                        const categoryProductCount = allProductsPOS.filter(
                            (item) => item.categoryId === category.id
                        ).length;

                        const isSelected =
                            selectedCategory === category.id && !showFoodCombos;

                        return (
                            <Button
                                key={category.id}
                                variant={isSelected ? 'default' : 'outline'}
                                className={`flex-shrink-0 px-3 py-2 font-medium text-sm whitespace-nowrap min-w-0 max-w-[200px] truncate ${
                                    isSelected
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                onClick={() => {
                                    setSelectedCategory(category.id);
                                    setShowFoodCombos(false);
                                }}
                                title={`${category.name} (${categoryProductCount})`}
                            >
                                <span className="truncate">
                                    {category.name} ({categoryProductCount})
                                </span>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {productsLoading || combosLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 15 }).map((_, index) => (
                            <Card key={index} className="p-3">
                                <Skeleton className="h-32 w-full mb-3 rounded-lg" />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-3 w-1/2 mb-2" />
                                <Skeleton className="h-6 w-20" />
                            </Card>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={`${product.id}-${product.variantId || 'base'}`}
                                product={product}
                                onClick={() => {
                                    // If product has valid variants, show variant selection modal
                                    if (
                                        product.hasVariants &&
                                        product.variants &&
                                        product.variants.length > 0
                                    ) {
                                        setSelectedProduct(product);
                                        setShowVariantModal(true);
                                    } else {
                                        // No valid variants → add product directly to order
                                        if (onProductSelect) {
                                            onProductSelect(product);
                                        }
                                    }
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium mb-2">
                            No products found
                        </h3>
                        <p className="text-sm text-center">
                            {searchQuery
                                ? `No products match "${searchQuery}"`
                                : 'No products available in this category'}
                        </p>
                    </div>
                )}
            </div>

            {/* Product Variant Modal */}
            {showVariantModal && selectedProduct && (
                <POSProductVariantModal
                    product={selectedProduct}
                    onVariantSelect={(variant) => {
                        // Map variant to POSProduct format
                        const posProduct: POSProduct = {
                            id: selectedProduct.id,
                            variantId: (variant as any).id,
                            name: selectedProduct.name,
                            displayName:
                                (variant as any).displayName ||
                                `${selectedProduct.name} (${(variant as any).name})`,
                            description: selectedProduct.description,
                            image: selectedProduct.image,
                            categoryId: selectedProduct.categoryId,
                            categoryName: selectedProduct.categoryName,
                            price:
                                (variant as any).effectivePrice ||
                                (variant as any).price ||
                                0,
                            effectivePrice:
                                (variant as any).effectivePrice ||
                                (variant as any).price ||
                                0,
                            attributeCombination:
                                (variant as any).attributeCombination || '',
                            productTemplateId: selectedProduct.id,
                            productTemplateName: selectedProduct.name,
                            status: selectedProduct.status,
                            isActive: true,
                            isCombo: false,
                        };
                        onProductSelect(posProduct);
                        setShowVariantModal(false);
                        setSelectedProduct(null);
                    }}
                    onClose={() => {
                        setShowVariantModal(false);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </div>
    );
}

// Product Card Component - Odoo Style with VND formatting
function ProductCard({
    product,
    onClick,
}: {
    product: POSProduct;
    onClick: () => void;
}) {
    return (
        <Card
            className={`p-3 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border border-gray-200 bg-white rounded-xl overflow-hidden ${
                product.isCombo
                    ? 'border-l-4 border-l-amber-500'
                    : product.variantId
                      ? 'border-l-4 border-l-blue-500'
                      : ''
            }`}
            onClick={onClick}
        >
            {/* Product Image */}
            <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover rounded-lg"
                    />
                ) : (
                    <div className="text-gray-400 text-sm text-center font-medium">
                        🍽️
                        <div className="text-xs mt-1">No Image</div>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-3">
                <h3 className="font-medium text-sm truncate">
                    {product.productTemplateName || product.name}
                </h3>

                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm text-green-600">
                        {product.priceRange
                            ? `${formatVND(product.priceRange.min)} - ${formatVND(product.priceRange.max)}`
                            : formatVND(
                                  product.effectivePrice || product.price
                              )}
                    </span>
                    <div className="flex gap-1">
                        {product.isCombo && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                Combo
                            </span>
                        )}
                        {product.hasVariants && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                {product.variants?.length || 0} variants
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
