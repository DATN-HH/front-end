'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Clock,
    DollarSign,
    MessageCircle,
    Package,
    Plus,
    Sparkles,
} from 'lucide-react';

import { AiSearchResponse } from '@/api/v1/menu/ai-search';
import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToCartDialog } from '@/components/common/AddToCartDialog';
import { ProductVariantDialog } from '@/features/guess-menu/components/ProductVariantDialog';
import { useCustomToast } from '@/lib/show-toast';
import { useCartStore } from '@/stores/cart-store';

interface AiSearchResultsProps {
    results: AiSearchResponse;
    isLoading: boolean;
}

export function AiSearchResults({ results, isLoading }: AiSearchResultsProps) {
    const router = useRouter();
    const { success } = useCustomToast();
    const addProduct = useCartStore((state) => state.addProduct);
    const addFoodCombo = useCartStore((state) => state.addFoodCombo);
    const addProductVariant = useCartStore((state) => state.addProductVariant);

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedCombo, setSelectedCombo] = useState<any>(null);
    const [showProductDialog, setShowProductDialog] = useState(false);
    const [showComboDialog, setShowComboDialog] = useState(false);
    const [showVariantDialog, setShowVariantDialog] = useState(false);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <span className="text-muted-foreground">
                        AI is searching for recommendations...
                    </span>
                </div>
                <div className="mt-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!results?.success) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-muted-foreground">
                        {results?.message ||
                            'AI search failed. Please try again.'}
                    </p>
                </div>
            </div>
        );
    }

    const { foodCombo, products } = results.data;
    // Summary might be added in a future API version but is not in the current type
    const summary = (results.data as any).summary;
    const hasResults = foodCombo.length > 0 || products.length > 0;

    if (!hasResults) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                        No recommendations found for your request. Try a
                        different query.
                    </p>
                </div>
            </div>
        );
    }

    // Handle adding a product to cart
    const handleAddProductClick = (product: any) => {
        setSelectedProduct(product);

        // Check if product has variants
        if (product.variants && product.variants.length > 0) {
            setShowVariantDialog(true);
        } else {
            setShowProductDialog(true);
        }
    };

    // Handle adding a combo to cart
    const handleAddComboClick = (combo: any) => {
        setSelectedCombo(combo);
        setShowComboDialog(true);
    };

    // Handle adding product to cart from dialog
    const handleAddProductToCart = (
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
        setShowProductDialog(false);
    };

    // Handle adding combo to cart from dialog
    const handleAddComboToCart = (
        quantity: number,
        notes?: string,
        customizations?: string[]
    ) => {
        if (!selectedCombo) return;

        addFoodCombo(selectedCombo, {
            quantity,
            notes,
            customizations,
        });

        success('Added to Cart', `${selectedCombo.name} added to cart`);
        setShowComboDialog(false);
    };

    // Handle variant product add to cart
    const handleAddProductVariant = (
        product: any,
        variant: any,
        quantity: number,
        note?: string,
        customizations?: string[]
    ) => {
        addProductVariant(product, variant, {
            quantity,
            notes: note,
            customizations,
        });

        success(
            'Added to Cart',
            `${product.name} (${variant.name}) added to cart`
        );
        setShowVariantDialog(false);
    };

    // Prepare combo items list for display
    const getComboItemsList = (combo: any) => {
        if (!combo.comboItems || combo.comboItems.length === 0) return '';
        return combo.comboItems
            .map(
                (item: any) =>
                    `${item.quantity}x ${item.productName || item.name}`
            )
            .join(', ');
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-primary">
                        AI Recommendations
                    </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    {summary && typeof summary === 'string' ? (
                        <span className="flex items-start gap-2">
                            <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{summary}</span>
                        </span>
                    ) : (
                        'Based on your request, here are our AI-powered recommendations:'
                    )}
                </p>
            </div>

            {/* Food Combos */}
            {foodCombo.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Package className="w-6 h-6 text-orange-500" />
                            <h4 className="text-lg font-bold text-gray-900">
                                Recommended Combos
                            </h4>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {foodCombo.length} available
                            </span>
                        </div>
                    </div>

                    {/* Desktop Grid */}
                    <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
                        {foodCombo.map((combo: any) => (
                            <Card
                                key={combo.id}
                                className="group hover:shadow-md transition-all duration-300 overflow-hidden"
                                onClick={() =>
                                    router.push(`/menu/food-combo/${combo.id}`)
                                }
                            >
                                <CardContent className="p-0">
                                    {/* Image Section */}
                                    <div className="relative aspect-[3/2] overflow-hidden">
                                        {combo.image ? (
                                            <Image
                                                src={combo.image}
                                                alt={combo.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        '/placeholder.svg';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <Package className="h-10 w-10 text-gray-400" />
                                            </div>
                                        )}

                                        {/* Combo Badge */}
                                        <div className="absolute top-2 left-2">
                                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                                                <Package className="w-3 h-3 mr-1" />
                                                Combo
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-3 space-y-2">
                                        {/* Title */}
                                        <h3 className="font-semibold text-base text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors cursor-pointer">
                                            {combo.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            {combo.description}
                                        </p>

                                        {/* Combo Items Preview - if available */}
                                        {combo.comboItems &&
                                            combo.comboItems.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 mb-1">
                                                        Includes:
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-1">
                                                        {getComboItemsList(
                                                            combo
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                        {/* Price and Time */}
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="text-lg font-bold text-orange-600">
                                                {formatVietnameseCurrency(
                                                    combo.effectivePrice ||
                                                        combo.price
                                                )}
                                            </div>

                                            {combo.estimateTime && (
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {combo.estimateTime} min
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleAddComboClick(combo);
                                            }}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                            size="sm"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Mobile List */}
                    <div className="md:hidden space-y-3">
                        {foodCombo.map((combo: any) => (
                            <Card
                                key={combo.id}
                                className="group hover:shadow-md transition-all duration-300"
                                onClick={() =>
                                    router.push(`/menu/food-combo/${combo.id}`)
                                }
                            >
                                <CardContent className="p-0">
                                    <div className="flex">
                                        {/* Image */}
                                        <div className="relative w-20 h-20 flex-shrink-0">
                                            {combo.image ? (
                                                <Image
                                                    src={combo.image}
                                                    alt={combo.name}
                                                    fill
                                                    className="object-cover rounded-l-lg"
                                                    sizes="80px"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            '/placeholder.svg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-l-lg">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}

                                            <div className="absolute top-1 left-1">
                                                <Badge className="bg-orange-500 text-white text-xs px-1 py-0.5">
                                                    Combo
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-3 min-w-0">
                                            <div className="space-y-1">
                                                <h4 className="font-medium text-gray-900 line-clamp-1 text-sm hover:text-orange-600 transition-colors cursor-pointer">
                                                    {combo.name}
                                                </h4>

                                                {/* Items list */}
                                                {combo.comboItems &&
                                                    combo.comboItems.length >
                                                        0 && (
                                                        <p className="text-xs text-gray-600 line-clamp-1">
                                                            {getComboItemsList(
                                                                combo
                                                            )}
                                                        </p>
                                                    )}

                                                <div className="flex items-center justify-between pt-1">
                                                    <div className="text-base font-bold text-orange-600">
                                                        {formatVietnameseCurrency(
                                                            combo.effectivePrice ||
                                                                combo.price
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-end gap-1">
                                                        {combo.estimateTime && (
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                {
                                                                    combo.estimateTime
                                                                }{' '}
                                                                min
                                                            </div>
                                                        )}

                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                handleAddComboClick(
                                                                    combo
                                                                );
                                                            }}
                                                            size="sm"
                                                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Products */}
            {products.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold mb-4">
                        Recommended Items
                    </h4>

                    {/* Desktop Grid */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product: any) => (
                            <Card
                                key={product.id}
                                className="group hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                onClick={() =>
                                    router.push(`/menu/${product.id}`)
                                }
                            >
                                <CardContent className="p-0">
                                    {/* Product Image */}
                                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        '/placeholder.svg';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <Package className="h-10 w-10 text-gray-400" />
                                            </div>
                                        )}
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
                                                <span>
                                                    {product.estimateTime}min
                                                </span>
                                            </div>

                                            <div className="font-semibold text-green-600">
                                                {formatVietnameseCurrency(
                                                    product.price
                                                )}
                                                {product.variants &&
                                                    product.variants.length >
                                                        0 && (
                                                        <div className="text-xs text-gray-500">
                                                            {
                                                                product.variants
                                                                    .length
                                                            }{' '}
                                                            variant
                                                            {product.variants
                                                                .length > 1
                                                                ? 's'
                                                                : ''}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        {/* Add Button */}
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddProductClick(product);
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
                        ))}
                    </div>

                    {/* Mobile List */}
                    <div className="md:hidden space-y-3">
                        {products.map((product: any) => (
                            <div
                                key={product.id}
                                className="flex bg-white rounded-lg shadow-sm border p-3 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() =>
                                    router.push(`/menu/${product.id}`)
                                }
                            >
                                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    '/placeholder.svg';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}

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
                                                {formatVietnameseCurrency(
                                                    product.price
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                        {product.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                {product.estimateTime}min
                                            </span>

                                            {product.variants &&
                                                product.variants.length > 0 && (
                                                    <span className="text-xs ml-2">
                                                        {
                                                            product.variants
                                                                .length
                                                        }{' '}
                                                        variant
                                                        {product.variants
                                                            .length > 1
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
                                                handleAddProductClick(product);
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
                </div>
            )}

            {/* Add to Cart Dialogs */}
            {selectedProduct && (
                <>
                    <AddToCartDialog
                        open={showProductDialog}
                        onOpenChange={setShowProductDialog}
                        title={selectedProduct.name}
                        description={selectedProduct.description}
                        price={selectedProduct.price || 0}
                        onAddToCart={handleAddProductToCart}
                        formatPrice={formatVietnameseCurrency}
                    />

                    <ProductVariantDialog
                        open={showVariantDialog}
                        onOpenChange={setShowVariantDialog}
                        product={selectedProduct}
                        onAddToCart={handleAddProductVariant}
                    />
                </>
            )}

            {selectedCombo && (
                <AddToCartDialog
                    open={showComboDialog}
                    onOpenChange={setShowComboDialog}
                    title={selectedCombo.name}
                    description={getComboItemsList(selectedCombo)}
                    price={
                        selectedCombo.effectivePrice || selectedCombo.price || 0
                    }
                    onAddToCart={handleAddComboToCart}
                    formatPrice={formatVietnameseCurrency}
                />
            )}
        </div>
    );
}
