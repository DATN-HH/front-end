'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

// Import API hooks and types
import { useAllCategories } from '@/api/v1/menu/categories';
import {
    useAllAvailableVariants,
    ProductVariantResponse,
} from '@/api/v1/menu/product-attributes';

// Types for POS products - based on variants
interface POSProduct {
    id: number;
    variantId: number;
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
}

interface POSProductGridProps {
    onProductSelect: (product: POSProduct) => void;
}

// Helper function to convert ProductVariantResponse to POSProduct
const convertVariantToPOSProduct = (
    variant: ProductVariantResponse
): POSProduct => {
    return {
        id: variant.productTemplateId,
        variantId: variant.id,
        name: variant.name,
        displayName: variant.displayName,
        description: variant.attributeCombination,
        image: variant.image,
        categoryId: undefined, // Will be set from product template if needed
        categoryName: undefined,
        price: variant.price || variant.effectivePrice || 0,
        effectivePrice: variant.effectivePrice || variant.price || 0,
        attributeCombination: variant.attributeCombination,
        productTemplateId: variant.productTemplateId,
        productTemplateName: variant.productTemplateName,
        status: variant.status,
        isActive: variant.isActive,
    };
};

export function POSProductGrid({ onProductSelect }: POSProductGridProps) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch categories
    const { data: categoriesData = [], isLoading: categoriesLoading } =
        useAllCategories();

    // Fetch all product variants
    const { data: allVariants = [], isLoading: variantsLoading } =
        useAllAvailableVariants();

    // Convert variants to POS products
    const allPOSProducts = allVariants
        .map(convertVariantToPOSProduct)
        .filter((product) => product.isActive);

    // Filter by category if selected (we'll need to implement category filtering later)
    const categoryFilteredProducts = allPOSProducts; // For now, show all

    // Filter products by search query
    const filteredProducts = categoryFilteredProducts.filter(
        (product) =>
            product.displayName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            product.productTemplateName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (product.description &&
                product.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()))
    );

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

                {/* Category Tabs - Odoo Style */}
                <div className="flex space-x-1">
                    <Button
                        variant={
                            selectedCategory === null ? 'default' : 'outline'
                        }
                        className={`px-4 py-2 font-medium ${
                            selectedCategory === null
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All Variants ({filteredProducts.length})
                    </Button>
                    {categoriesData.map((category) => (
                        <Button
                            key={category.id}
                            variant={
                                selectedCategory === category.id
                                    ? 'default'
                                    : 'outline'
                            }
                            className={`px-4 py-2 font-medium ${
                                selectedCategory === category.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {variantsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => onProductSelect(product)}
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

                {/* Empty State */}
                {!variantsLoading && filteredProducts.length === 0 && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center text-gray-500">
                            <div className="text-lg font-medium mb-2">
                                No products found
                            </div>
                            <div className="text-sm">
                                {selectedCategory
                                    ? 'No products in this category'
                                    : 'No products available'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Product Card Component - Odoo Style
function ProductCard({
    product,
    onClick,
}: {
    product: POSProduct;
    onClick: () => void;
}) {
    return (
        <Card
            className="p-3 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border border-gray-200 bg-white rounded-xl overflow-hidden"
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
            <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
                    {product.productTemplateName}
                </h3>

                <h4 className="font-medium text-blue-600 text-xs leading-tight line-clamp-1">
                    {product.displayName}
                </h4>

                {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                )}

                {/* Price */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    {product.price > 0 ? (
                        <span className="text-lg font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            ${product.price.toFixed(2)}
                        </span>
                    ) : product.effectivePrice > 0 ? (
                        <span className="text-lg font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            ${product.effectivePrice.toFixed(2)}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400 italic">
                            No price set
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}
