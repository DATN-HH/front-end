'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/services/api-client';
import { BaseResponse } from '@/api/v1';

// Types for POS products
interface POSProduct {
    id: number;
    name: string;
    description?: string;
    image?: string;
    categoryId?: number;
    categoryName?: string;
    hasVariants: boolean;
    defaultPrice?: number;
}

interface POSCategory {
    id: number;
    name: string;
    productCount: number;
}

interface POSProductGridProps {
    onProductSelect: (product: POSProduct) => void;
}

// API calls for POS products
const fetchPOSProducts = async (): Promise<POSProduct[]> => {
    const response = await apiClient.get<BaseResponse<any[]>>('/api/pos/products');
    return response.data.payload.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        categoryId: product.category ? 1 : undefined, // Map category name to ID
        categoryName: product.category,
        hasVariants: false, // TODO: Implement variant detection
        defaultPrice: product.defaultPrice
    }));
};

const fetchPOSCategories = async (): Promise<POSCategory[]> => {
    // Mock categories for now - will be replaced with real API
    return [
        { id: 1, name: 'Food', productCount: 15 },
        { id: 2, name: 'Drinks', productCount: 8 },
        { id: 3, name: 'Desserts', productCount: 5 },
        { id: 4, name: 'Combos', productCount: 3 }
    ];
};

export function POSProductGrid({ onProductSelect }: POSProductGridProps) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    // Fetch products and categories
    const { data: products = [], isLoading: productsLoading } = useQuery({
        queryKey: ['pos-products'],
        queryFn: fetchPOSProducts,
    });

    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['pos-categories'],
        queryFn: fetchPOSCategories,
    });

    // Filter products by selected category
    const filteredProducts = selectedCategory 
        ? products.filter(product => product.categoryId === selectedCategory)
        : products;

    return (
        <div className="h-full flex flex-col">
            {/* Category Tabs - Odoo Style */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex space-x-1">
                    <Button
                        variant={selectedCategory === null ? "default" : "outline"}
                        className={`px-4 py-2 font-medium ${
                            selectedCategory === null
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
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
                {productsLoading ? (
                    <div className="grid grid-cols-4 gap-4">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <Card key={index} className="p-4">
                                <Skeleton className="h-24 w-full mb-3" />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-3 w-1/2" />
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-4">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => onProductSelect(product)}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!productsLoading && filteredProducts.length === 0 && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center text-gray-500">
                            <div className="text-lg font-medium mb-2">No products found</div>
                            <div className="text-sm">
                                {selectedCategory 
                                    ? 'No products in this category'
                                    : 'No products available'
                                }
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
    onClick 
}: { 
    product: POSProduct; 
    onClick: () => void;
}) {
    return (
        <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
            onClick={onClick}
        >
            {/* Product Image */}
            <div className="h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                {product.image ? (
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className="h-full w-full object-cover rounded-lg"
                    />
                ) : (
                    <div className="text-gray-400 text-xs text-center">
                        No Image
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="space-y-1">
                <h3 className="font-medium text-gray-900 text-sm leading-tight">
                    {product.name}
                </h3>
                
                {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                        {product.description}
                    </p>
                )}

                {/* Price and Variant Indicator */}
                <div className="flex items-center justify-between mt-2">
                    {product.defaultPrice && (
                        <span className="text-sm font-medium text-gray-900">
                            ${product.defaultPrice.toFixed(2)}
                        </span>
                    )}
                    
                    {product.hasVariants && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Variants
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}
