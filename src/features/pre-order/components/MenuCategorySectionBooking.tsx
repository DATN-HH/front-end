'use client';

import { Clock, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

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

import { ProductBookingDialog } from './ProductBookingDialog';

interface MenuCategorySectionBookingProps {
    categoryId: number;
    categoryName: string;
}

interface ProductCardProps {
    product: MenuProduct;
    onAddClick: (product: MenuProduct) => void;
}

function ProductCard({ product, onAddClick }: ProductCardProps) {
    const hasVariants = product.variants && product.variants.length > 0;
    const priceDisplay = hasVariants
        ? formatPriceRange(product)
        : formatVietnameseCurrency(product.price || 0);

    return (
        <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardContent className="p-0">
                {/* Mobile: Horizontal Layout, Desktop: Vertical Layout */}
                <div className="flex md:flex-col">
                    {/* Image */}
                    <div className="relative w-24 h-24 md:w-full md:aspect-[4/3] overflow-hidden flex-shrink-0">
                        <Image
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 96px, (max-width: 1200px) 50vw, 33vw"
                        />
                        {product.estimateTime && (
                            <div className="absolute top-1 right-1 md:top-2 md:right-2">
                                <Badge className="bg-black/70 text-white text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {product.estimateTime}min
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 md:p-4 space-y-2 md:space-y-3">
                        <div>
                            <h3 className="font-semibold text-sm md:text-lg text-gray-900 line-clamp-1">
                                {product.name}
                            </h3>
                            {product.description && (
                                <p className="text-xs md:text-sm text-gray-600 line-clamp-1 md:line-clamp-2 mt-1">
                                    {product.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm md:text-lg font-bold text-orange-600">
                                {priceDisplay}
                            </div>
                            <Button
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600 h-7 md:h-9 text-xs md:text-sm px-2 md:px-3"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAddClick(product);
                                }}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function MenuCategorySectionBooking({
    categoryId,
    categoryName,
}: MenuCategorySectionBookingProps) {
    const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(
        null
    );
    const [showProductDialog, setShowProductDialog] = useState(false);

    const {
        data: products,
        isLoading,
        error,
    } = useMenuProductsByCategory(categoryId);

    const handleAddClick = (product: MenuProduct) => {
        setSelectedProduct(product);
        setShowProductDialog(true);
    };

    const handleCloseDialog = () => {
        setShowProductDialog(false);
        setSelectedProduct(null);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-64 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">Failed to load products</p>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return <></>;
    }

    return (
        <>
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                    {categoryName}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddClick={handleAddClick}
                        />
                    ))}
                </div>
            </div>

            {/* Product Booking Dialog */}
            <ProductBookingDialog
                isOpen={showProductDialog}
                onClose={handleCloseDialog}
                product={selectedProduct}
                quickNotes={[
                    'No spicy',
                    'Extra sauce',
                    'Less salt',
                    'Well done',
                ]}
            />
        </>
    );
}
