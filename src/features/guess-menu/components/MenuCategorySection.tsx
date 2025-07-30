'use client';

import { Clock, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
    MenuProduct,
    MenuVariant,
    useMenuProductsByCategory,
    formatPriceRange,
    formatVietnameseCurrency,
} from '@/api/v1/menu/menu-products';
import { AddToCartDialog } from '@/components/common/AddToCartDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomToast } from '@/lib/show-toast';
import { useCartStore } from '@/stores/cart-store';

import { ProductVariantDialog } from './ProductVariantDialog';

interface MenuCategorySectionProps {
    categoryId: number;
    categoryName: string;
}

interface ProductCardProps {
    product: MenuProduct;
    onAddClick: (product: MenuProduct) => void;
}

function ProductCard({ product, onAddClick }: ProductCardProps) {
    const router = useRouter();
    const hasVariants = product.variants && product.variants.length > 0;

    const handleCardClick = () => {
        router.push(`/menu/${product.id}`);
    };

    return (
        <Card
            className="group hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={handleCardClick}
        >
            <CardContent className="p-0">
                {/* Product Image */}
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                        src={
                            product.image ||
                            '/placeholder.svg?height=200&width=300'
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                    />
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg line-clamp-2">
                            {product.name}
                        </h3>
                        {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Time and Price */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{product.estimateTime}min</span>
                        </div>

                        <div className="text-right">
                            <div className="font-semibold text-green-600">
                                {formatPriceRange(product)}
                            </div>
                            {hasVariants && (
                                <div className="text-xs text-gray-500">
                                    {product.variants.length} variant
                                    {product.variants.length > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Button */}
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddClick(product);
                        }}
                        className="w-full"
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ProductCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-0">
                <Skeleton className="aspect-video w-full rounded-t-lg" />
                <div className="p-4 space-y-3">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-8 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

export function MenuCategorySection({
    categoryId,
    categoryName,
}: MenuCategorySectionProps) {
    const router = useRouter();
    const addProduct = useCartStore((state) => state.addProduct);
    const addProductVariant = useCartStore((state) => state.addProductVariant);
    const { success } = useCustomToast();
    const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(
        null
    );
    const [showVariantDialog, setShowVariantDialog] = useState(false);
    const [showAddToCartDialog, setShowAddToCartDialog] = useState(false);

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

    const handleAddClick = (product: MenuProduct) => {
        const hasVariants = product.variants && product.variants.length > 0;

        setSelectedProduct(product);
        if (hasVariants) {
            setShowVariantDialog(true);
        } else {
            setShowAddToCartDialog(true);
        }
    };

    const handleAddToCart = (
        product: MenuProduct,
        variant: MenuVariant | null,
        quantity: number,
        note?: string,
        customizations?: string[]
    ) => {
        if (variant) {
            addProductVariant(product, variant, {
                quantity,
                notes: note,
                customizations,
            });
            success(
                'Added to Cart',
                `${product.name} (${variant.name}) added to cart`
            );
        } else {
            addProduct(product, {
                quantity,
                notes: note,
                customizations,
            });
            success('Added to Cart', `${product.name} added to cart`);
        }
        setShowVariantDialog(false);
    };

    const handleSimpleAddToCart = (
        quantity: number,
        notes?: string,
        customizations?: string[]
    ) => {
        if (!selectedProduct) return;

        addProduct(selectedProduct, {
            quantity,
            notes,
            customizations,
        });
        success('Added to Cart', `${selectedProduct.name} added to cart`);
        setShowAddToCartDialog(false);
    };

    // Don't render if loading and no cached data
    if (isLoading && products.length === 0) {
        return (
            <section className="space-y-4">
                <h2 className="text-2xl font-serif font-bold">
                    {categoryName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            </section>
        );
    }

    // Don't render if error or no products
    if (error || products.length === 0) {
        return null;
    }

    return (
        <>
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold">
                        {categoryName}
                    </h2>
                    <Badge variant="secondary">{products.length} items</Badge>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden space-y-3">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex bg-white rounded-lg shadow-sm border p-3 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => router.push(`/menu/${product.id}`)}
                        >
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                    src={
                                        product.image ||
                                        '/placeholder.svg?height=80&width=80'
                                    }
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                                {product.variants &&
                                    product.variants.length > 0 && (
                                        <div className="absolute top-1 right-1">
                                            <Badge
                                                variant="secondary"
                                                className="text-xs px-1 py-0"
                                            >
                                                {product.variants.length}
                                            </Badge>
                                        </div>
                                    )}
                            </div>

                            <div className="flex-1 ml-3 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-sm leading-tight truncate pr-2">
                                        {product.name}
                                    </h3>
                                    <div className="flex-shrink-0">
                                        <span className="text-sm font-bold text-green-600">
                                            {formatPriceRange(product)}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                {product.estimateTime}min
                                            </span>
                                        </div>
                                        {product.variants &&
                                            product.variants.length > 0 && (
                                                <span className="text-xs">
                                                    {product.variants.length}{' '}
                                                    variant
                                                    {product.variants.length > 1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            )}
                                    </div>

                                    <Button
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddClick(product);
                                        }}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddClick={handleAddClick}
                        />
                    ))}
                </div>
            </section>

            {/* Variant Selection Dialog */}
            <ProductVariantDialog
                open={showVariantDialog}
                onOpenChange={setShowVariantDialog}
                product={selectedProduct}
                onAddToCart={handleAddToCart}
            />

            {/* Simple Add to Cart Dialog */}
            {selectedProduct && (
                <AddToCartDialog
                    open={showAddToCartDialog}
                    onOpenChange={setShowAddToCartDialog}
                    title={selectedProduct.name}
                    description={selectedProduct.description}
                    price={selectedProduct.price || 0}
                    onAddToCart={handleSimpleAddToCart}
                    formatPrice={formatVietnameseCurrency}
                />
            )}
        </>
    );
}
