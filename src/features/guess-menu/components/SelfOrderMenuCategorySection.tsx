'use client';

import { Clock, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
    MenuProduct,
    useMenuProductsByCategory,
    formatPriceRange,
    formatVietnameseCurrency,
} from '@/api/v1/menu/menu-products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SelfOrderMenuCategorySectionProps {
    categoryId: number;
    categoryName: string;
    currentOrderItems: any[];
    onUpdateTempOrder: (items: any[]) => void;
}

interface SelfOrderProductCardProps {
    product: MenuProduct;
    currentOrderItems: any[];
    onUpdateTempOrder: (items: any[]) => void;
}

function SelfOrderProductCard({
    product,
    currentOrderItems,
    onUpdateTempOrder,
}: SelfOrderProductCardProps) {
    const router = useRouter();

    // Find current ordered quantity for this product (both existing and new items)
    const existingItems = currentOrderItems.filter(
        (item) =>
            item.productId === product.id && !item.isCombo && item.orderItemId
    );
    const newItems = currentOrderItems.filter(
        (item) =>
            item.productId === product.id && !item.isCombo && !item.orderItemId
    );

    const existingQuantity = existingItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );
    const newQuantity = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalQuantity = existingQuantity + newQuantity;

    const handleQuantityChange = (increment: boolean) => {
        const targetNewQuantity = increment
            ? newQuantity + 1
            : Math.max(0, newQuantity - 1);

        // Remove all new items for this product first
        let filteredItems = currentOrderItems.filter(
            (item) =>
                !(
                    item.productId === product.id &&
                    !item.isCombo &&
                    !item.orderItemId
                )
        );

        // Add new item with the target quantity if > 0
        if (targetNewQuantity > 0) {
            filteredItems.push({
                productId: product.id,
                productName: product.name,
                quantity: targetNewQuantity,
                price: product.price,
                notes: '',
                isCombo: false,
                // No orderItemId means this is a new item
            });
        }

        onUpdateTempOrder(filteredItems);
    };

    return (
        <Card className="group overflow-hidden">
            <CardContent className="p-0">
                {/* Product Image */}
                <div
                    className="aspect-[3/2] relative bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/menu/${product.id}`)}
                >
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 truncate mb-1">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {product.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="font-semibold text-gray-900">
                                {product.variants?.length > 0
                                    ? formatPriceRange(product)
                                    : formatVietnameseCurrency(
                                          product.price || 0
                                      )}
                            </p>
                            {product.estimateTime && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{product.estimateTime}min</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            {existingQuantity > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="text-green-600 mb-1"
                                >
                                    Current: {existingQuantity}
                                </Badge>
                            )}
                            {newQuantity > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="text-blue-600"
                                >
                                    Adding: {newQuantity}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuantityChange(false)}
                                disabled={newQuantity === 0}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                                {newQuantity}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuantityChange(true)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {product.variants?.length > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                    router.push(`/menu/${product.id}`)
                                }
                                className="text-blue-600 hover:text-blue-700"
                            >
                                View Options
                            </Button>
                        )}
                    </div>

                    {existingQuantity > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            You already have {existingQuantity} of this item in
                            your order
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function ProductCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-0">
                <Skeleton className="aspect-[3/2] w-full" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function SelfOrderMenuCategorySection({
    categoryId,
    categoryName,
    currentOrderItems,
    onUpdateTempOrder,
}: SelfOrderMenuCategorySectionProps) {
    const {
        data: rawProducts = [],
        isLoading,
        error,
    } = useMenuProductsByCategory(categoryId);

    // Filter products and variants with null prices
    const products = rawProducts
        .map((product) => {
            // Filter variants with non-null prices
            const validVariants =
                product.variants?.filter((variant) => variant.price !== null) ||
                [];

            return {
                ...product,
                variants: validVariants,
            };
        })
        .filter((product) => {
            // Show product if:
            // 1. Has valid variants, OR
            // 2. Has no variants but price is not null/0
            const hasValidVariants =
                product.variants && product.variants.length > 0;
            const hasValidPrice = product.price != null && product.price > 0;

            return (
                hasValidVariants || (!product.variants?.length && hasValidPrice)
            );
        });

    if (error) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {categoryName}
                </h2>
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-red-600">Failed to load products</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {categoryName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(8)
                        .fill(0)
                        .map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {categoryName}
                </h2>
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-500">
                            No products available in this category
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Category Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    {categoryName}
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {products.length} items
                </span>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <SelfOrderProductCard
                        key={product.id}
                        product={product}
                        currentOrderItems={currentOrderItems}
                        onUpdateTempOrder={onUpdateTempOrder}
                    />
                ))}
            </div>
        </div>
    );
}
